import { cn } from '@/lib/utils';
import { StockStatus } from '@/types/inventory';

interface StockBadgeProps {
  status: StockStatus;
  className?: string;
}

const statusConfig = {
  'in-stock': {
    label: 'In Stock',
    className: 'bg-success/10 text-success border-success/20',
  },
  'low-stock': {
    label: 'Low Stock',
    className: 'bg-warning/10 text-warning border-warning/20 animate-pulse-subtle',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    className: 'bg-danger/10 text-danger border-danger/20',
  },
};

export const StockBadge = ({ status, className }: StockBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
