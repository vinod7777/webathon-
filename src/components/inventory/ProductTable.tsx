import { useState } from 'react';
import { Pencil, Trash2, ShoppingCart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StockBadge } from './StockBadge';
import { Product } from '@/hooks/useInventory';
import { getStockStatus } from '@/types/inventory';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currency';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSell: (product: Product) => void;
}

export const ProductTable = ({ products, onEdit, onDelete, onSell }: ProductTableProps) => {
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // formatCurrency imported from utils/currency

  return (
    <div className="rounded-lg border bg-card card-shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead
              className="cursor-pointer hover:text-foreground transition-colors"
              onClick={() => handleSort('name')}
            >
              Product Name
              {sortField === 'name' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground transition-colors"
              onClick={() => handleSort('category')}
            >
              Category
              {sortField === 'category' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground transition-colors text-right"
              onClick={() => handleSort('quantity')}
            >
              Quantity
              {sortField === 'quantity' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground transition-colors text-right"
              onClick={() => handleSort('price')}
            >
              Price
              {sortField === 'price' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No products found. Add your first product to get started.
              </TableCell>
            </TableRow>
          ) : (
            sortedProducts.map((product, index) => {
              const status = getStockStatus(product.quantity, product.minStock);
              return (
                <TableRow
                  key={product.id}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    status === 'out-of-stock' && 'bg-danger/5'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-semibold',
                        status === 'out-of-stock' && 'text-danger',
                        status === 'low-stock' && 'text-warning'
                      )}
                    >
                      {product.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <StockBadge status={status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSell(product)}
                        disabled={product.quantity === 0}
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(product)}
                        className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
