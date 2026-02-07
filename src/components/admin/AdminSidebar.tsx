import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Settings,
  LogOut,
  Shield,
  BarChart3
} from 'lucide-react';
import logo from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type AdminTab = 'dashboard' | 'users' | 'support' | 'reports' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

const mainNavItems: { title: string; tab: AdminTab; icon: React.ComponentType<{ className?: string }> }[] = [
  { title: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard },
  { title: 'Users', tab: 'users', icon: Users },
  { title: 'Support Requests', tab: 'support', icon: Mail },
];

const secondaryNavItems: { title: string; tab: AdminTab; icon: React.ComponentType<{ className?: string }> }[] = [
  { title: 'Reports', tab: 'reports', icon: BarChart3 },
  { title: 'System Settings', tab: 'settings', icon: Settings },
];

export function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-sidebar-border border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Admin Panel" className={isCollapsed ? "h-8 w-auto" : "h-10 w-auto"} />
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Admin</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <button
                      onClick={() => onTabChange(item.tab)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        activeTab === item.tab && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <button
                      onClick={() => onTabChange(item.tab)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        activeTab === item.tab && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!isCollapsed && (
          <div className="text-xs text-sidebar-foreground/60 mt-2">
            © 2026 Admin Portal
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
