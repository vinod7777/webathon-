import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

// Admin credentials are validated via edge function that checks environment secrets
export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdminAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use the Supabase edge function to validate admin credentials against secrets
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('adminToken', data.token);
        setIsAdminAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const adminLogout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminLogin, adminLogout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
