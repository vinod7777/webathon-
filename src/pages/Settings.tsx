import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { User, Store, Bell, Shield, Loader2, Save, Moon, Sun } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [settings, setSettings] = useState({
    businessName: '',
    lowStockThreshold: 10,
    emailNotifications: true,
    pushNotifications: false,
  });

  // Load profile data from Firebase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setSettings(prev => ({
            ...prev,
            businessName: data.businessName || '',
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        businessName: settings.businessName.trim(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <Header onAddProduct={() => {}} />

          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle>Profile</CardTitle>
                  </div>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input 
                      value={user?.displayName || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Business Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    <CardTitle>Business</CardTitle>
                  </div>
                  <CardDescription>Configure your business settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Enter your business name"
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStock">Default Low Stock Threshold</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      min="1"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 10 })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Products with stock at or below this level will trigger alerts
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotif">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts for low stock items
                      </p>
                    </div>
                    <Switch
                      id="emailNotif"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotif">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get browser notifications for important updates
                      </p>
                    </div>
                    <Switch
                      id="pushNotif"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                    />
                  </div>
               </CardContent>
               </Card>

               {/* Appearance Settings */}
               <Card>
                 <CardHeader>
                   <div className="flex items-center gap-2">
                     <Sun className="h-5 w-5" />
                     <CardTitle>Appearance</CardTitle>
                   </div>
                   <CardDescription>Customize how your app looks</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="darkMode">Dark Mode</Label>
                       <p className="text-sm text-muted-foreground">
                         Switch between light and dark themes
                       </p>
                     </div>
                     <Button
                       onClick={toggleDarkMode}
                       variant="outline"
                       size="sm"
                       className="gap-2"
                     >
                       {theme === 'dark' ? (
                         <>
                           <Sun className="h-4 w-4" />
                           Light
                         </>
                       ) : (
                         <>
                           <Moon className="h-4 w-4" />
                           Dark
                         </>
                       )}
                     </Button>
                   </div>
                 </CardContent>
               </Card>

               {/* Security Settings */}
               <Card>
                 <CardHeader>
                   <div className="flex items-center gap-2">
                     <Shield className="h-5 w-5" />
                     <CardTitle>Security</CardTitle>
                   </div>
                   <CardDescription>Manage your security preferences</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <Button variant="outline" className="w-full sm:w-auto">
                     Change Password
                   </Button>
                   <p className="text-sm text-muted-foreground">
                     Last password change: Never
                   </p>
                 </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
