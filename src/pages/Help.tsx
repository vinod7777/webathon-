import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/inventory/AppSidebar';
import { Header } from '@/components/inventory/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I add a new product?',
    answer: 'Click the "Add Product" button in the header or on the Products page. Fill in the product details including name, SKU, category, quantity, and pricing information.',
  },
  {
    question: 'What do the stock alerts mean?',
    answer: 'Stock alerts notify you when products are running low or out of stock. Low stock means the quantity is at or below your minimum stock threshold. Out of stock means the quantity is zero.',
  },
  {
    question: 'How do I record a sale?',
    answer: 'Go to the Products page or Dashboard, find the product you want to sell, and click the "Sell" button. Enter the quantity sold and confirm. The sale will be recorded and stock will be automatically updated.',
  },
  {
    question: 'Can I edit product information?',
    answer: 'Yes, click the edit icon (pencil) next to any product to modify its details including name, price, quantity, and minimum stock levels.',
  },
  {
    question: 'How is inventory value calculated?',
    answer: 'Inventory value is calculated by multiplying the quantity of each product by its cost price, then summing all products together.',
  },
  {
    question: 'How do I change my minimum stock threshold?',
    answer: 'You can set a default threshold in Settings, or edit individual products to set custom thresholds for each item.',
  },
];

const Help = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <Header onAddProduct={() => {}} />

          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Help & Support</h1>
              <p className="text-muted-foreground">Find answers and get assistance</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Quick Links */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Book className="mr-2 h-4 w-4" />
                      Getting Started Guide
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Video Tutorials
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Contact Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Live Chat
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Support available Mon-Fri, 9am-5pm EST
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Common questions about using StockFlow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Help;
