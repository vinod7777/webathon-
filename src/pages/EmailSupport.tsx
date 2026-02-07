import { useState } from 'react';
import { ArrowLeft, Send, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const EmailSupport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit a support request');
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'support_emails'), {
        userId: user.uid,
        userEmail: user.email || '',
        userDisplayName: user.displayName || user.email || 'Unknown',
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('Support email saved with ID:', docRef.id);
      toast.success('Support request submitted successfully! We\'ll get back to you soon.');
      setFormData({ subject: '', message: '' });
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please ensure you are logged in.');
      } else {
        toast.error(`Failed to submit: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold">Email Support</h1>
              <p className="text-muted-foreground">Send us a message and we'll respond as soon as possible</p>
            </div>

            <div className="grid lg:grid-cols-[1fr,300px] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Support
                  </CardTitle>
                  <CardDescription>
                    Describe your issue or question in detail. Our support team typically responds within 24-48 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Your Email</Label>
                      <Input 
                        id="email"
                        value={user?.email || ''} 
                        disabled 
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        We'll respond to this email address
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please describe your issue or question in detail..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={6}
                        maxLength={2000}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        {formData.message.length}/2000 characters
                      </p>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Your message will be reviewed by our support team</li>
                    <li>• We'll respond to your email within 24-48 hours</li>
                    <li>• For urgent issues, please include "URGENT" in the subject</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EmailSupport;
