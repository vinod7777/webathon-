import { Sale } from '@/types/inventory';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency';

interface RecentSalesProps {
  sales: Sale[];
}

export const RecentSales = ({ sales }: RecentSalesProps) => {
  const recentSales = sales.slice(0, 5);

  return (
    <div className="rounded-lg border bg-card card-shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Recent Sales</h3>
        <p className="text-sm text-muted-foreground">Latest transactions</p>
      </div>
      <div className="p-6">
        {recentSales.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No sales recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {recentSales.map((sale, index) => (
              <div
                key={sale.id}
                className="flex items-center justify-between animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sale.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(sale.date, 'MMM d, yyyy')} · {sale.quantity} units
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-success">
                    +{formatCurrency(sale.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
