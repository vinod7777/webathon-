import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, Loader2, RefreshCw, Mail, ChevronLeft, ChevronRight, X, AlertTriangle, Eye, Calendar, Building2, User, Flame } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Check, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useMaintenanceMode } from '@/contexts/MaintenanceContext';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  email: string | null;
  businessName: string | null;
  createdAt: Date;
  productsCount?: number;
  salesCount?: number;
  totalRevenue?: number;
}

interface SupportEmail {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}


const ITEMS_PER_PAGE = 10;


const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();
  const { settings, updateSettings, isLoading: settingsLoading } = useMaintenanceMode();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [supportEmails, setSupportEmails] = useState<SupportEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'support' | 'reports' | 'settings'>('dashboard');
  const [usersPage, setUsersPage] = useState(1);
  const [emailsPage, setEmailsPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<SupportEmail | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [pendingMaintenanceMode, setPendingMaintenanceMode] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'profiles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          displayName: data.displayName || null,
          email: data.email || null,
          businessName: data.businessName || null,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
        } as UserProfile;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportEmails = async () => {
    setEmailsLoading(true);
    try {
      const q = query(collection(db, 'support_emails'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const emailsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail || 'Unknown',
          userDisplayName: data.userDisplayName || 'Unknown User',
          subject: data.subject,
          message: data.message,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as SupportEmail;
      });
      setSupportEmails(emailsList);
    } catch (error) {
      console.error('Error fetching support emails:', error);
      toast.error('Failed to fetch support emails');
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSupportEmails();
  }, []);

  // Pagination for users
  const usersTotalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const usersStartIndex = (usersPage - 1) * ITEMS_PER_PAGE;
  const usersEndIndex = usersStartIndex + ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(usersStartIndex, usersEndIndex);

  // Pagination for support emails
  const emailsTotalPages = Math.ceil(supportEmails.length / ITEMS_PER_PAGE);
  const emailsStartIndex = (emailsPage - 1) * ITEMS_PER_PAGE;
  const emailsEndIndex = emailsStartIndex + ITEMS_PER_PAGE;
  const paginatedEmails = supportEmails.slice(emailsStartIndex, emailsEndIndex);

  // User growth data (last 7 days)
  const userGrowthData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dayStr = format(date, 'MMM d');
      const usersOnDay = users.filter(u => 
        format(u.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      
      return { date: dayStr, users: usersOnDay };
    });
  }, [users]);

  const goToUsersPage = (page: number) => {
    setUsersPage(Math.max(1, Math.min(page, usersTotalPages)));
  };

  const goToEmailsPage = (page: number) => {
    setEmailsPage(Math.max(1, Math.min(page, emailsTotalPages)));
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleOpenUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setUserStatsLoading(true);
    
    try {
      // Fetch user's products count
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      const productsSnapshot = await getDocs(productsQuery);
      const userProducts = productsSnapshot.docs.filter(doc => doc.data().userId === user.userId);
      
      // Fetch user's sales
      const salesQuery = query(
        collection(db, 'sales'),
        orderBy('date', 'desc')
      );
      const salesSnapshot = await getDocs(salesQuery);
      const userSales = salesSnapshot.docs.filter(doc => doc.data().userId === user.userId);
      
      const totalRevenue = userSales.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
      
      setSelectedUser({
        ...user,
        productsCount: userProducts.length,
        salesCount: userSales.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setUserStatsLoading(false);
    }
  };

  const handleOpenEmail = (email: SupportEmail) => {
    setSelectedEmail(email);
  };

  const handleUpdateStatus = async (emailId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'support_emails', emailId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setSupportEmails(prev => 
        prev.map(email => 
          email.id === emailId ? { ...email, status: newStatus } : email
        )
      );
      
      // Update selected email if open
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      toast.success(`Status updated to ${newStatus === 'resolved' ? 'Solved' : 'In Progress'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    if (checked) {
      // Show confirmation dialog before enabling
      setPendingMaintenanceMode(true);
      setShowMaintenanceConfirm(true);
    } else {
      // Disable immediately
      handleUpdateSetting('maintenanceMode', false);
    }
  };

  const confirmMaintenanceMode = async () => {
    await handleUpdateSetting('maintenanceMode', true);
    setShowMaintenanceConfirm(false);
    setPendingMaintenanceMode(false);
  };

  const handleUpdateSetting = async (key: string, value: boolean | number) => {
    setSavingSettings(true);
    try {
      await updateSettings({ [key]: value });
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSavingSettings(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-success text-success-foreground">Resolved</Badge>;
      case 'in-progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'support') {
      setEmailsPage(1);
    }
  };

  const isUrgent = (email: SupportEmail) => {
    const text = `${email.subject} ${email.message}`.toLowerCase();
    return text.includes('urgent') || text.includes('priority') || text.includes('asap') || text.includes('emergency');
  };

  // Memoized report data
  const monthlySignupData = useMemo(() => {
    const monthlyData = new Map<string, number>();
    users.forEach(user => {
      const month = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });
    return Array.from(monthlyData.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, count]) => ({ month, signups: count }));
  }, [users]);

  const supportStatusData = useMemo(() => {
    const statusMap = new Map<string, number>();
    supportEmails.forEach(email => {
      const status = email.status || 'pending';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    return Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
  }, [supportEmails]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="border-b bg-card sticky top-0 z-10">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'users' && 'Users'}
                  {activeTab === 'support' && 'Support Requests'}
                  {activeTab === 'reports' && 'Reports'}
                  {activeTab === 'settings' && 'System Settings'}
                </h1>
                {activeTab === 'support' && supportEmails.filter(e => e.status === 'pending').length > 0 && (
                  <Badge variant="destructive">
                    {supportEmails.filter(e => e.status === 'pending').length} pending
                  </Badge>
                )}
              </div>
            </div>
          </header>

          <main className="p-6">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Support</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportEmails.filter(e => e.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportEmails.filter(e => e.status === 'resolved').length}</div>
                  <p className="text-xs text-muted-foreground">Resolved requests</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth (Last 7 Days)</CardTitle>
                  <CardDescription>New user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)" 
                        name="New Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Support Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Overview</CardTitle>
                  <CardDescription>Current support request status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-warning" />
                        <span>Pending</span>
                      </div>
                      <Badge variant="secondary">
                        {supportEmails.filter(e => e.status === 'pending').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span>In Progress</span>
                      </div>
                      <Badge variant="secondary">
                        {supportEmails.filter(e => e.status === 'in-progress').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-success" />
                        <span>Resolved</span>
                      </div>
                      <Badge variant="secondary">
                        {supportEmails.filter(e => e.status === 'resolved').length}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-medium">
                      <span>Total Requests</span>
                      <span>{supportEmails.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Registered Users
                  </CardTitle>
                  <CardDescription>
                    View all registered users and their profiles
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchUsers}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users registered yet</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow 
                          key={user.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleOpenUser(user)}
                        >
                          <TableCell className="font-medium">
                            {user.displayName || 'Not set'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email || 'Not set'}
                          </TableCell>
                          <TableCell>
                            {user.businessName || 'Not set'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(user.createdAt, 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenUser(user);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Users Pagination */}
                  {usersTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {usersStartIndex + 1}-{Math.min(usersEndIndex, users.length)} of {users.length} users
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToUsersPage(usersPage - 1)}
                          disabled={usersPage === 1}
                          className="h-8 px-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: usersTotalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={usersPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => goToUsersPage(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToUsersPage(usersPage + 1)}
                          disabled={usersPage === usersTotalPages}
                          className="h-8 px-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Support Requests Tab */}
        {activeTab === 'support' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Support Requests
                  </CardTitle>
                  <CardDescription>
                    View and manage customer support emails
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSupportEmails}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {emailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : supportEmails.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No support requests yet</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEmails.map((email) => {
                        const urgent = isUrgent(email);
                        return (
                          <TableRow 
                            key={email.id} 
                            className={`cursor-pointer hover:bg-muted/50 ${urgent ? 'bg-destructive/5' : ''}`}
                            onClick={() => handleOpenEmail(email)}
                          >
                            <TableCell>
                              {urgent ? (
                                <Badge variant="destructive" className="gap-1">
                                  <Flame className="h-3 w-3" />
                                  Priority
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">Normal</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {format(email.createdAt, 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{email.userDisplayName}</p>
                                <p className="text-sm text-muted-foreground">{email.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {email.subject}
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate text-muted-foreground">
                              {email.message}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(email.status)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {emailsTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {emailsStartIndex + 1}-{Math.min(emailsEndIndex, supportEmails.length)} of {supportEmails.length} requests
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToEmailsPage(emailsPage - 1)}
                          disabled={emailsPage === 1}
                          className="h-8 px-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: emailsTotalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={emailsPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => goToEmailsPage(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToEmailsPage(emailsPage + 1)}
                          disabled={emailsPage === emailsTotalPages}
                          className="h-8 px-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* User Growth Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Support Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{supportEmails.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total received</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {supportEmails.filter(e => e.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
                </CardContent>
              </Card>
            </div>

            {/* User Signup Trend */}
            <Card>
              <CardHeader>
                <CardTitle>User Signups Over Time</CardTitle>
                <CardDescription>New user registrations by month</CardDescription>
              </CardHeader>
               <CardContent>
                 {users.length === 0 ? (
                   <div className="text-center py-8 text-muted-foreground">
                     No user data available
                   </div>
                 ) : (
                   <ResponsiveContainer width="100%" height={300}>
                     <AreaChart data={monthlySignupData}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="month" />
                       <YAxis />
                       <Tooltip />
                       <Area type="monotone" dataKey="signups" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" />
                     </AreaChart>
                   </ResponsiveContainer>
                 )}
               </CardContent>
            </Card>

            {/* Support Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Support Request Status</CardTitle>
                <CardDescription>Distribution of support request statuses</CardDescription>
              </CardHeader>
               <CardContent>
                 {supportEmails.length === 0 ? (
                   <div className="text-center py-8 text-muted-foreground">
                     No support requests yet
                   </div>
                 ) : (
                   <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                       <Pie
                         data={supportStatusData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, value }) => `${name} (${value})`}
                         outerRadius={100}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {[0, 1, 2].map((index) => (
                           <Cell key={`cell-${index}`} fill={['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'][index]} />
                         ))}
                       </Pie>
                       <Tooltip />
                       <Legend />
                     </PieChart>
                   </ResponsiveContainer>
                 )}
               </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure application-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Mode with Warning */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    {settings.maintenanceMode && (
                      <Badge variant="destructive" className="text-xs">ACTIVE</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When enabled, all users will be logged out and cannot sign in
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={handleMaintenanceToggle}
                  disabled={savingSettings || settingsLoading}
                />
              </div>

              {settings.maintenanceMode && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Maintenance Mode is Active</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All regular users are blocked from accessing the application. 
                      Login and registration are disabled.
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="signups">Allow New Signups</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register for accounts
                  </p>
                </div>
                <Switch
                  id="signups"
                  checked={settings.allowNewSignups}
                  onCheckedChange={(checked) => handleUpdateSetting('allowNewSignups', checked)}
                  disabled={savingSettings || settingsLoading || settings.maintenanceMode}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="threshold">Default Low Stock Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Default minimum stock level for new products
                </p>
                <div className="flex gap-2 items-center">
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    value={settings.defaultLowStockThreshold}
                    onChange={(e) => handleUpdateSetting('defaultLowStockThreshold', parseInt(e.target.value) || 10)}
                    className="w-32"
                    disabled={savingSettings || settingsLoading}
                  />
                  {savingSettings && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Email Detail Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Support Request
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedEmail && format(selectedEmail.createdAt, 'MMMM d, yyyy \'at\' h:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedEmail.userDisplayName}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmail.userEmail}</p>
                </div>
                {getStatusBadge(selectedEmail.status)}
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{selectedEmail.subject}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedEmail.message}
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedEmail.status === 'in-progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedEmail.id, 'in-progress')}
                    disabled={selectedEmail.status === 'in-progress'}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    In Progress
                  </Button>
                  <Button
                    variant={selectedEmail.status === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedEmail.id, 'resolved')}
                    disabled={selectedEmail.status === 'resolved'}
                    className={selectedEmail.status !== 'resolved' ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Solved
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedEmail(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Account created on {selectedUser && format(selectedUser.createdAt, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* User Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedUser.displayName || 'No name set'}
                    </h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Business Name</p>
                      <p className="font-medium">{selectedUser.businessName || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">{format(selectedUser.createdAt, 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showMaintenanceConfirm} onOpenChange={setShowMaintenanceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Enable Maintenance Mode?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will immediately:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Log out all currently signed-in users</li>
                <li>Block all new login attempts</li>
                <li>Disable new user registrations</li>
                <li>Show a maintenance page to all visitors</li>
              </ul>
              <p className="font-medium mt-2">
                Only admins will be able to access the admin panel.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingMaintenanceMode(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMaintenanceMode}
              className="bg-destructive hover:bg-destructive/90"
            >
              Enable Maintenance Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
