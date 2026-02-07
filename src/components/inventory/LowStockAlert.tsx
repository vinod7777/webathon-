import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/hooks/useInventory';
import { cn } from '@/lib/utils';

interface LowStockAlertProps {
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
}

export const LowStockAlert = ({ lowStockProducts, outOfStockProducts }: LowStockAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

  if (totalAlerts === 0 || !isVisible) return null;

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 animate-fade-in',
        outOfStockProducts.length > 0
          ? 'bg-danger/10 border-danger/20'
          : 'bg-warning/10 border-warning/20'
      )}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <AlertTriangle
          className={cn(
            'h-5 w-5 mt-0.5',
            outOfStockProducts.length > 0 ? 'text-danger' : 'text-warning'
          )}
        />
        <div>
          <h4 className="font-semibold text-foreground">Inventory Alerts</h4>
          <div className="mt-2 space-y-1 text-sm">
            {outOfStockProducts.length > 0 && (
              <p className="text-danger">
                <span className="font-medium">{outOfStockProducts.length}</span> product(s) out of
                stock: {outOfStockProducts.map((p) => p.name).join(', ')}
              </p>
            )}
            {lowStockProducts.length > 0 && (
              <p className="text-warning">
                <span className="font-medium">{lowStockProducts.length}</span> product(s) running
                low: {lowStockProducts.map((p) => p.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
