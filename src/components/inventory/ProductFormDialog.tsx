import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/hooks/useInventory';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  sku: z.string().min(1, 'SKU is required').max(50),
  category: z.string().min(1, 'Category is required'),
  customCategory: z.string().max(50).optional(),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
  minStock: z.coerce.number().min(0, 'Minimum stock must be 0 or greater'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or greater'),
}).refine((data) => {
  if (data.category === 'Other' && (!data.customCategory || data.customCategory.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Please enter a custom category name',
  path: ['customCategory'],
});

type ProductFormData = z.infer<typeof productSchema>;

const categories = [
  'Electronics',
  'Beverages',
  'Accessories',
  'Kitchen',
  'Office',
  'Clothing',
  'Health',
  'Sports',
  'Other',
];

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: Omit<ProductFormData, 'customCategory'> & { category: string }) => void;
}

export const ProductFormDialog = ({
  open,
  onOpenChange,
  product,
  onSubmit,
}: ProductFormDialogProps) => {
  const isEditing = !!product;
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      customCategory: '',
      quantity: 0,
      minStock: 10,
      price: 0,
      costPrice: 0,
    },
  });

  const watchCategory = form.watch('category');

  useEffect(() => {
    setShowCustomCategory(watchCategory === 'Other');
  }, [watchCategory]);

  useEffect(() => {
    if (product) {
      // Check if the product category is a custom one (not in predefined list)
      const isCustomCategory = !categories.includes(product.category);
      
      form.reset({
        name: product.name,
        sku: product.sku,
        category: isCustomCategory ? 'Other' : product.category,
        customCategory: isCustomCategory ? product.category : '',
        quantity: product.quantity,
        minStock: product.minStock,
        price: product.price,
        costPrice: product.costPrice,
      });
      
      setShowCustomCategory(isCustomCategory);
    } else {
      form.reset({
        name: '',
        sku: '',
        category: '',
        customCategory: '',
        quantity: 0,
        minStock: 10,
        price: 0,
        costPrice: 0,
      });
      setShowCustomCategory(false);
    }
  }, [product, form]);

  const handleSubmit = (data: ProductFormData) => {
    // Use custom category if "Other" is selected
    const finalCategory = data.category === 'Other' && data.customCategory 
      ? data.customCategory.trim() 
      : data.category;
    
    onSubmit({
      name: data.name,
      sku: data.sku,
      category: finalCategory,
      quantity: data.quantity,
      minStock: data.minStock,
      price: data.price,
      costPrice: data.costPrice,
    });
    form.reset();
    setShowCustomCategory(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the product details below.'
              : 'Fill in the details to add a new product to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PRD-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Custom Category Input - shown when "Other" is selected */}
            {showCustomCategory && (
              <FormField
                control={form.control}
                name="customCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Category Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your custom category" 
                        maxLength={50}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock Level</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
