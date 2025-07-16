import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Testing database connection...')

    // Test 1: Check if newsletter_subscribers table exists and get all data
    const { data: allSubscribers, error: allError } = await supabaseClient
      .from('newsletter_subscribers')
      .select('*')

    console.log('All subscribers:', allSubscribers)
    console.log('Error:', allError)

    // Test 2: Check if we can access the table at all
    let tableAccessible = true
    try {
      await supabaseClient.from('newsletter_subscribers').select('count').limit(1)
    } catch (e) {
      tableAccessible = false
      console.log('Table access error:', e)
    }

    // Test 3: Try to get active subscribers
    const { data: activeSubscribers, error: activeError } = await supabaseClient
      .from('newsletter_subscribers')
      .select('*')
      .eq('status', 'active')

    console.log('Active subscribers:', activeSubscribers)
    console.log('Active error:', activeError)

    // Test 4: Check email queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('email_queue')
      .select('*')
      .limit(5)

    console.log('Queue items:', queueItems)
    console.log('Queue error:', queueError)

    return new Response(
      JSON.stringify({
        success: true,
        tests: {
          allSubscribers: {
            count: allSubscribers?.length || 0,
            data: allSubscribers,
            error: allError?.message
          },
          activeSubscribers: {
            count: activeSubscribers?.length || 0,
            data: activeSubscribers,
            error: activeError?.message
          },
          emailQueue: {
            count: queueItems?.length || 0,
            data: queueItems,
            error: queueError?.message
          },
          environment: {
            supabaseUrl: Deno.env.get('SUPABASE_URL'),
            hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
            hasResendKey: !!Deno.env.get('RESEND_API_KEY'),
            siteUrl: Deno.env.get('SITE_URL')
          }
        }
      }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Test function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})