import { useState } from 'react';
import { Plus, Search, Filter, Loader2, Upload } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useInventory, Product } from '@/hooks/useInventory';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { ProductTable } from '@/components/inventory/ProductTable';
import { ProductFormDialog } from '@/components/inventory/ProductFormDialog';
import { SellProductDialog } from '@/components/inventory/SellProductDialog';
import { DeleteConfirmDialog } from '@/components/inventory/DeleteConfirmDialog';
import { ImportProductsDialog } from '@/components/inventory/ImportProductsDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const Products = () => {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
  } = useInventory();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSellClick = (product: Product) => {
    setSelectedProduct(product);
    setIsSellDialogOpen(true);
  };

  const handleProductSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, data);
      toast.success('Product updated successfully');
    } else {
      await addProduct(data);
      toast.success('Product added successfully');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct.id);
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleSell = async (productId: string, quantity: number) => {
    const sale = await recordSale(productId, quantity);
    if (sale) {
      toast.success(`Sale recorded: $${sale.totalAmount.toFixed(2)}`);
    }
  };

  const handleImportProducts = async (importedProducts: Array<{
    name: string;
    sku: string;
    category: string;
    quantity: number;
    minStock: number;
    price: number;
    costPrice: number;
  }>) => {
    let successCount = 0;
    let errorCount = 0;

    for (const product of importedProducts) {
      try {
        await addProduct(product);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} products`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to import ${errorCount} products`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <Header onAddProduct={handleAddProduct} />

          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your product inventory</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
            <ProductTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              onSell={handleSellClick}
            />
          </main>
        </SidebarInset>
      </div>

      {/* Dialogs */}
      <ProductFormDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={selectedProduct}
        onSubmit={handleProductSubmit}
      />

      <SellProductDialog
        open={isSellDialogOpen}
        onOpenChange={setIsSellDialogOpen}
        product={selectedProduct}
        onSell={handleSell}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={selectedProduct}
        onConfirm={handleDeleteConfirm}
      />

      <ImportProductsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportProducts}
      />
    </SidebarProvider>
  );
};

export default Products;
