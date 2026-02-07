import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin token from header
    const adminToken = req.headers.get('x-admin-token');
    if (!adminToken) {
      return new Response(
        JSON.stringify({ error: 'Admin authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all support emails
    const { data: supportEmails, error } = await supabase
      .from('support_emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support emails:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch support emails' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profiles to get email info
    const userIds = [...new Set(supportEmails?.map(e => e.user_id) || [])];
    
    let profilesMap: Record<string, { display_name: string | null; business_name: string | null }> = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, business_name')
        .in('user_id', userIds);
      
      profiles?.forEach(p => {
        profilesMap[p.user_id] = { display_name: p.display_name, business_name: p.business_name };
      });
    }

    // Combine data
    const enrichedEmails = supportEmails?.map(email => ({
      ...email,
      user_display_name: profilesMap[email.user_id]?.display_name || 'Unknown User',
      user_business_name: profilesMap[email.user_id]?.business_name || null,
    }));

    return new Response(
      JSON.stringify({ data: enrichedEmails }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin support emails error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
