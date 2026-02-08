import { useMemo, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { BarChart3, TrendingUp, Package, DollarSign, Loader2, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useInventory } from '@/hooks/useInventory';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { StatsCard } from '@/components/inventory/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { exportToExcel, exportToPDF } from '@/utils/exportReport';
import { toast } from 'sonner';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

const COLORS = [
  '#FF00FF', // Neon Magenta
  '#00FFFF', // Neon Cyan
  '#39FF14', // Neon Green
  '#FFFF00', // Neon Yellow
  '#FF5F1F', // Neon Orange
  '#BF00FF', // Neon Purple
];

const Reports = () => {
  const {
    products,
    sales,
    loading,
    addProduct,
    getTotalInventoryValue,
    getTotalSalesValue,
  } = useInventory();

  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  // formatCurrency imported from utils/currency

  // Category distribution data
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { count: number; value: number }>();
    
    products.forEach(product => {
      const existing = categoryMap.get(product.category) || { count: 0, value: 0 };
      categoryMap.set(product.category, {
        count: existing.count + 1,
        value: existing.value + (product.quantity * product.price),
      });
    });

    return Array.from(categoryMap, ([name, data]) => ({
      name,
      count: data.count,
      value: data.value,
    }));
  }, [products]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    sales.forEach(sale => {
      const existing = productSales.get(sale.productId) || { 
        name: sale.productName, 
        quantity: 0, 
        revenue: 0 
      };
      productSales.set(sale.productId, {
        name: sale.productName,
        quantity: existing.quantity + sale.quantity,
        revenue: existing.revenue + sale.totalAmount,
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Calculate profit margin
  const profitData = useMemo(() => {
    const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const potentialProfit = totalValue - totalCost;
    const margin = totalValue > 0 ? ((potentialProfit / totalValue) * 100).toFixed(1) : 0;
    
    return { totalCost, totalValue, potentialProfit, margin };
  }, [products]);

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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground">Insights into your inventory and sales performance</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportToExcel({
                          products,
                          sales,
                          stats: {
                            inventoryValue: getTotalInventoryValue(),
                            totalSales: getTotalSalesValue(),
                            potentialProfit: profitData.potentialProfit,
                            profitMargin: String(profitData.margin),
                          },
                          categoryData,
                          topProducts,
                        });
                        toast.success('Excel report downloaded successfully');
                      } catch (error) {
                        toast.error('Failed to generate Excel report');
                      }
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Download as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportToPDF({
                          products,
                          sales,
                          stats: {
                            inventoryValue: getTotalInventoryValue(),
                            totalSales: getTotalSalesValue(),
                            potentialProfit: profitData.potentialProfit,
                            profitMargin: String(profitData.margin),
                          },
                          categoryData,
                          topProducts,
                        });
                        toast.success('PDF report downloaded successfully');
                      } catch (error) {
                        toast.error('Failed to generate PDF report');
                      }
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Download as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Inventory Value"
                value={formatCurrency(getTotalInventoryValue())}
                icon={Package}
              />
              <StatsCard
                title="Total Sales"
                value={formatCurrency(getTotalSalesValue())}
                icon={DollarSign}
                variant="success"
              />
              <StatsCard
                title="Potential Profit"
                value={formatCurrency(profitData.potentialProfit)}
                icon={TrendingUp}
              />
              <StatsCard
                title="Profit Margin"
                value={`${profitData.margin}%`}
                icon={BarChart3}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Distribution */}
              <Card className="shadow-[0_0_15px_rgba(0,255,255,0.2)] border-cyan-500/20 hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:scale-[1.02] transition-all duration-300">
                <CardHeader>
                  <CardTitle>Inventory by Category</CardTitle>
                  <CardDescription>Product distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No products to display
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <Card className="shadow-[0_0_15px_rgba(255,0,255,0.2)] border-pink-500/20 hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] hover:scale-[1.02] transition-all duration-300">
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No sales data to display
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Product: ${label}`}
                        />
                        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                          {topProducts.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Category Value */}
              <Card className="lg:col-span-2 shadow-[0_0_15px_rgba(57,255,20,0.2)] border-green-500/20 hover:shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:scale-[1.02] transition-all duration-300">
                <CardHeader>
                  <CardTitle>Category Value Distribution</CardTitle>
                  <CardDescription>Total inventory value by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No products to display
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Inventory Value" radius={[4, 4, 0, 0]}>
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
