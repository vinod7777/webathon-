import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Package, AlertTriangle, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useInventory, Product } from '@/hooks/useInventory';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { StatsCard } from '@/components/inventory/StatsCard';
import { ProductTable } from '@/components/inventory/ProductTable';
import { ProductFormDialog } from '@/components/inventory/ProductFormDialog';
import { SellProductDialog } from '@/components/inventory/SellProductDialog';
import { DeleteConfirmDialog } from '@/components/inventory/DeleteConfirmDialog';
import { LowStockAlert } from '@/components/inventory/LowStockAlert';
import { RecentSales } from '@/components/inventory/RecentSales';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const Dashboard = () => {
  const {
    products,
    sales,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    getLowStockProducts,
    getOutOfStockProducts,
    getTotalInventoryValue,
    getTotalSalesValue,
  } = useInventory();

  const { setTheme } = useTheme();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();
  const alertCount = lowStockProducts.length + outOfStockProducts.length;

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  // formatCurrency imported from utils/currency

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
      toast.success(`Sale recorded: ${formatCurrency(sale.totalAmount)}`);
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
            {/* Alerts */}
            <div className="mb-6">
              <LowStockAlert
                lowStockProducts={lowStockProducts}
                outOfStockProducts={outOfStockProducts}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Products"
                value={products.length}
                icon={Package}
              />
              <StatsCard
                title="Low Stock Alerts"
                value={alertCount}
                icon={AlertTriangle}
                variant={alertCount > 0 ? 'warning' : 'default'}
              />
              <StatsCard
                title="Inventory Value"
                value={formatCurrency(getTotalInventoryValue())}
                icon={DollarSign}
              />
              <StatsCard
                title="Total Sales"
                value={formatCurrency(getTotalSalesValue())}
                icon={TrendingUp}
                variant="success"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Product Table */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Products</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your inventory and track stock levels
                  </p>
                </div>
                <ProductTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteClick}
                  onSell={handleSellClick}
                />
              </div>

              {/* Recent Sales */}
              <div>
                <RecentSales sales={sales} />
              </div>
            </div>
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
    </SidebarProvider>
  );
};

export default Dashboard;
