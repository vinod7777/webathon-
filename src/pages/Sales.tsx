import { useState, useMemo } from 'react';
import { Calendar, Search, TrendingUp, DollarSign, ShoppingCart, Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useInventory } from '@/hooks/useInventory';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { StatsCard } from '@/components/inventory/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatCurrency } from '@/utils/currency';

const Sales = () => {
  const { sales, loading, addProduct } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sales
  const filteredSales = sales.filter(sale =>
    sale.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlySales = sales.filter(sale =>
      isWithinInterval(sale.date, { start: monthStart, end: monthEnd })
    );

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTransactions = sales.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      totalTransactions,
      averageOrderValue,
    };
  }, [sales]);

  // formatCurrency imported from utils/currency

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
          <Header onAddProduct={() => addProduct} />

          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Sales</h1>
              <p className="text-muted-foreground">View and manage your sales history</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                icon={DollarSign}
                variant="success"
              />
              <StatsCard
                title="This Month"
                value={formatCurrency(stats.monthlyRevenue)}
                icon={Calendar}
              />
              <StatsCard
                title="Total Transactions"
                value={stats.totalTransactions}
                icon={ShoppingCart}
              />
              <StatsCard
                title="Avg Order Value"
                value={formatCurrency(stats.averageOrderValue)}
                icon={TrendingUp}
              />
            </div>

            {/* Sales Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <CardTitle>Sales History</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredSales.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sales recorded yet</p>
                    <p className="text-sm">Sales will appear here when you sell products</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="text-muted-foreground">
                            {format(sale.date, 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell className="font-medium">{sale.productName}</TableCell>
                          <TableCell className="text-right">{sale.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(sale.unitPrice)}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(sale.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Sales;
