-- Create a table for support emails
CREATE TABLE public.support_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own support emails" 
ON public.support_emails 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support emails" 
ON public.support_emails 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_emails_updated_at
BEFORE UPDATE ON public.support_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();