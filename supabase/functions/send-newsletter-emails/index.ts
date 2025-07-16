import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailQueueItem {
  id: string;
  content_type: 'blog_post' | 'project';
  content_id: string;
  status: string;
  retry_count: number;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  unsubscribe_token: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }

    // Get pending email queue items
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('scheduled_at', { ascending: true })
      .limit(50) // Process in batches

    if (queueError) {
      throw new Error(`Failed to fetch queue items: ${queueError.message}`)
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from('newsletter_subscribers')
      .select('id, email, unsubscribe_token')
      .eq('status', 'active')

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`)
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscribers found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    // Process each queue item
    for (const queueItem of queueItems as EmailQueueItem[]) {
      try {
        // Mark as processing
        await supabaseClient
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', queueItem.id)

        // Get content data
        let contentData
        if (queueItem.content_type === 'blog_post') {
          const { data: post } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', queueItem.content_id)
            .single()
          contentData = post
        } else if (queueItem.content_type === 'project') {
          const { data: project } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('id', queueItem.content_id)
            .single()
          contentData = project
        }

        if (!contentData) {
          throw new Error(`Content not found for ${queueItem.content_type} with id ${queueItem.content_id}`)
        }

        // Send emails to all subscribers
        const emailPromises = subscribers.map(async (subscriber: NewsletterSubscriber) => {
          try {
            const emailData = {
              subscriberEmail: subscriber.email,
              unsubscribeToken: subscriber.unsubscribe_token,
              siteUrl: Deno.env.get('SITE_URL') || 'https://imadlab.com',
              [queueItem.content_type === 'blog_post' ? 'post' : 'project']: {
                ...contentData,
                publishedDate: contentData.published_date || contentData.created_at,
                techTags: contentData.tech_tags || [],
                tags: contentData.tags || []
              }
            }

            // Import email template function
            const { generateBlogPostEmail, generateProjectEmail } = await import('../shared/email-templates.ts')
            
            const emailHtml = queueItem.content_type === 'blog_post' 
              ? generateBlogPostEmail(emailData as any)
              : generateProjectEmail(emailData as any)

            const subject = queueItem.content_type === 'blog_post'
              ? `New Blog Post: ${contentData.title}`
              : `New Project: ${contentData.title}`

            // Send email via Resend
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'imadlab <newsletter@imadlab.com>',
                to: [subscriber.email],
                subject: subject,
                html: emailHtml,
                headers: {
                  'List-Unsubscribe': `<${Deno.env.get('SITE_URL')}/api/unsubscribe?token=${subscriber.unsubscribe_token}>`,
                }
              }),
            })

            if (!emailResponse.ok) {
              const errorText = await emailResponse.text()
              throw new Error(`Resend API error: ${errorText}`)
            }

            const emailResult = await emailResponse.json()

            // Record analytics
            await supabaseClient
              .from('email_analytics')
              .insert({
                email_queue_id: queueItem.id,
                subscriber_email: subscriber.email,
                sent_at: new Date().toISOString()
              })

            return { success: true, email: subscriber.email, emailId: emailResult.id }
          } catch (error) {
            console.error(`Failed to send email to ${subscriber.email}:`, error)
            return { success: false, email: subscriber.email, error: error.message }
          }
        })

        const emailResults = await Promise.allSettled(emailPromises)
        const successCount = emailResults.filter(result => 
          result.status === 'fulfilled' && result.value.success
        ).length

        // Update queue item status
        if (successCount > 0) {
          await supabaseClient
            .from('email_queue')
            .update({ 
              status: 'sent', 
              sent_at: new Date().toISOString() 
            })
            .eq('id', queueItem.id)
        } else {
          // All emails failed, increment retry count
          await supabaseClient
            .from('email_queue')
            .update({ 
              status: 'failed',
              retry_count: queueItem.retry_count + 1,
              error_message: 'All email sends failed'
            })
            .eq('id', queueItem.id)
        }

        results.push({
          queueItemId: queueItem.id,
          contentType: queueItem.content_type,
          contentTitle: contentData.title,
          successCount,
          totalSubscribers: subscribers.length
        })

      } catch (error) {
        console.error(`Failed to process queue item ${queueItem.id}:`, error)
        
        // Update queue item with error
        await supabaseClient
          .from('email_queue')
          .update({ 
            status: 'failed',
            retry_count: queueItem.retry_count + 1,
            error_message: error.message
          })
          .eq('id', queueItem.id)

        results.push({
          queueItemId: queueItem.id,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Email processing completed',
        results,
        processedItems: queueItems.length,
        totalSubscribers: subscribers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Email sending function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})