import { ArrowLeft, Package, ShoppingCart, AlertTriangle, BarChart3, Settings, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Package,
    title: 'Add Your Products',
    description: 'Start by adding your inventory items. Click "Add Product" to enter product details including name, SKU, category, quantity, and pricing.',
    tips: [
      'Use unique SKU codes for each product',
      'Set accurate cost prices for inventory valuation',
      'Define minimum stock levels for alerts',
    ],
  },
  {
    icon: ShoppingCart,
    title: 'Record Sales',
    description: 'When you make a sale, click the "Sell" button next to any product. Enter the quantity sold and the system will automatically update your stock.',
    tips: [
      'Sales are recorded with timestamps',
      'Stock quantities update automatically',
      'View sales history in the Sales page',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Monitor Stock Alerts',
    description: 'The Alerts page shows products that are low on stock or out of stock. Stay on top of your inventory to avoid stockouts.',
    tips: [
      'Low stock alerts trigger at your set threshold',
      'Out of stock items need immediate attention',
      'Restock products before they run out',
    ],
  },
  {
    icon: BarChart3,
    title: 'View Reports',
    description: 'Access the Reports page to see visual analytics of your inventory performance, sales trends, and category breakdowns.',
    tips: [
      'Track sales over time with charts',
      'Identify top-selling products',
      'Monitor inventory value trends',
    ],
  },
  {
    icon: Settings,
    title: 'Configure Settings',
    description: 'Customize your experience in Settings. Set your business name, default stock thresholds, notification preferences, and theme.',
    tips: [
      'Set a default low stock threshold',
      'Enable notifications for alerts',
      'Switch between light and dark modes',
    ],
  },
];

const GettingStarted = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <Header onAddProduct={() => {}} />

          <main className="p-6">
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild className="mb-4">
                <Link to="/help">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Help
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Getting Started Guide</h1>
              <p className="text-muted-foreground">Learn how to use StockFlow to manage your inventory</p>
            </div>

            <div className="space-y-6 max-w-3xl">
              {steps.map((step, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <step.icon className="h-5 w-5" />
                          {step.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="mt-2 ml-13">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
                  <p className="mb-4 opacity-90">Head to the Products page to add your first product and begin managing your inventory.</p>
                  <Button variant="secondary" asChild>
                    <Link to="/products">
                      <Package className="mr-2 h-4 w-4" />
                      Go to Products
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default GettingStarted;
