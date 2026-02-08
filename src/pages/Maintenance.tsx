import { Wrench, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

const Maintenance = () => {
  const { signOut } = useAuth();

  const handleGoBack = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
        <img src={logo} alt="StockFlow" className="h-24 mx-auto" />
        
        <div className="rounded-xl border bg-card p-8 card-shadow space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
            <Wrench className="h-8 w-8 text-warning" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">Under Maintenance</h1>
            <p className="text-muted-foreground">
              We're currently performing scheduled maintenance to improve your experience. 
              Please check back soon.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3 text-left">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">What's happening?</p>
              <p className="text-muted-foreground mt-1">
                Our team is working on updates and improvements. 
                This usually takes a few minutes to a couple of hours.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={handleGoBack} className="w-full">
            Return to Home
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Thank you for your patience!
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
