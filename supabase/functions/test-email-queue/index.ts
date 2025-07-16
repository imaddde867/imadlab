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

    // First, let's get a blog post to test with
    const { data: posts, error: postsError } = await supabaseClient
      .from('posts')
      .select('*')
      .limit(1)

    if (postsError || !posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No blog posts found to test with' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const testPost = posts[0]

    // Create a test email queue item
    const { data: queueItem, error: queueError } = await supabaseClient
      .from('email_queue')
      .insert({
        content_type: 'blog_post',
        content_id: testPost.id,
        status: 'pending'
      })
      .select()
      .single()

    if (queueError) {
      return new Response(
        JSON.stringify({ error: `Failed to create queue item: ${queueError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test email queue item created',
        queueItem,
        testPost: {
          id: testPost.id,
          title: testPost.title,
          slug: testPost.slug
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Test queue function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})