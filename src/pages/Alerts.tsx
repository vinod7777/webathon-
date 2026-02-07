import { AlertTriangle, AlertCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useInventory } from '@/hooks/useInventory';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const { products, loading, addProduct, getLowStockProducts, getOutOfStockProducts } = useInventory();
  const navigate = useNavigate();

  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAlerts = lowStockProducts.length > 0 || outOfStockProducts.length > 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <Header onAddProduct={() => addProduct} />

          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Stock Alerts</h1>
              <p className="text-muted-foreground">Monitor low stock and out of stock items</p>
            </div>

            {!hasAlerts ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-70" />
                  <h3 className="text-xl font-semibold mb-2">All Stock Levels are Healthy</h3>
                  <p className="text-muted-foreground mb-4">
                    No products are currently low on stock or out of stock.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/products')}>
                    View Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Out of Stock Section */}
                {outOfStockProducts.length > 0 && (
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-destructive">Out of Stock</CardTitle>
                        <Badge variant="destructive">{outOfStockProducts.length}</Badge>
                      </div>
                      <CardDescription>
                        These products need immediate restocking
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {outOfStockProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                SKU: {product.sku} • Category: {product.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="destructive">Out of Stock</Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                Min: {product.minStock} units
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Low Stock Section */}
                {lowStockProducts.length > 0 && (
                  <Card className="border-yellow-500/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-yellow-600">Low Stock</CardTitle>
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          {lowStockProducts.length}
                        </Badge>
                      </div>
                      <CardDescription>
                        These products are running low and should be restocked soon
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {lowStockProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                SKU: {product.sku} • Category: {product.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                {product.quantity} left
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                Min: {product.minStock} units
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Alerts;
