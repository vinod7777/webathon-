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
import { Product } from '@/hooks/useInventory';

interface SellProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSell: (productId: string, quantity: number) => void;
}

export const SellProductDialog = ({
  open,
  onOpenChange,
  product,
  onSell,
}: SellProductDialogProps) => {
  const sellSchema = z.object({
    quantity: z.coerce
      .number()
      .min(1, 'Quantity must be at least 1')
      .max(product?.quantity ?? 1, `Maximum available: ${product?.quantity ?? 0}`),
  });

  type SellFormData = z.infer<typeof sellSchema>;

  const form = useForm<SellFormData>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const watchQuantity = form.watch('quantity');
  const totalAmount = (product?.price ?? 0) * (watchQuantity || 0);

  const handleSubmit = (data: SellFormData) => {
    if (product) {
      onSell(product.id, data.quantity);
      form.reset();
      onOpenChange(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Record Sale</DialogTitle>
          <DialogDescription>
            Record a sale for <span className="font-medium">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Stock:</span>
            <span className="font-medium">{product.quantity} units</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Unit Price:</span>
            <span className="font-medium">{formatCurrency(product.price)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Sell</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={product.quantity}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Record Sale</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
