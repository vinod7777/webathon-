import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMaintenanceMode } from '@/contexts/MaintenanceContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, signOut } = useAuth();
  const { settings, isLoading: maintenanceLoading } = useMaintenanceMode();
  const navigate = useNavigate();

  useEffect(() => {
    // If maintenance mode is enabled, sign out the user and redirect
    if (settings.maintenanceMode && user && !loading && !maintenanceLoading) {
      signOut().then(() => {
        navigate('/maintenance', { replace: true });
      });
    }
  }, [settings.maintenanceMode, user, loading, maintenanceLoading, signOut, navigate]);

  if (loading || maintenanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to maintenance page if maintenance mode is on
  if (settings.maintenanceMode) {
    return <Navigate to="/maintenance" replace />;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};
