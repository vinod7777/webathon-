import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AppSettings {
  maintenanceMode: boolean;
  allowNewSignups: boolean;
  defaultLowStockThreshold: number;
}

interface MaintenanceContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  maintenanceMode: false,
  allowNewSignups: true,
  defaultLowStockThreshold: 10,
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const useMaintenanceMode = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceMode must be used within a MaintenanceProvider');
  }
  return context;
};

interface MaintenanceProviderProps {
  children: ReactNode;
}

export const MaintenanceProvider = ({ children }: MaintenanceProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize settings document if it doesn't exist
    const initSettings = async () => {
      const settingsRef = doc(db, 'app_settings', 'general');
      const settingsDoc = await getDoc(settingsRef);
      
      if (!settingsDoc.exists()) {
        await setDoc(settingsRef, defaultSettings);
      }
    };

    initSettings();

    // Listen to real-time changes
    const unsubscribe = onSnapshot(
      doc(db, 'app_settings', 'general'),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setSettings(docSnapshot.data() as AppSettings);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to settings:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const settingsRef = doc(db, 'app_settings', 'general');
    await setDoc(settingsRef, { ...settings, ...newSettings }, { merge: true });
  };

  return (
    <MaintenanceContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </MaintenanceContext.Provider>
  );
};
