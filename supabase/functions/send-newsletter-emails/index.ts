import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { BlogPostEmailData, ProjectEmailData } from '../shared/email-templates.ts'

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
  status: string | null;
  unsubscribe_token: string;
}

interface BlogPostContent {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_date: string | null;
  created_at: string;
  tags: string[] | null;
}

interface ProjectContent {
  id: string;
  title: string;
  description: string | null;
  tech_tags: string[] | null;
  image_url: string | null;
  repo_url: string | null;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://imadlab.com'
    const { generateBlogPostEmail, generateProjectEmail } = await import('../shared/email-templates.ts')

    let queueIds: string[] | undefined
    let recipientEmails: string[] | undefined
    if (req.headers.get('content-type')?.includes('application/json')) {
      const payload = await req.json().catch(() => null)
      if (payload && Array.isArray(payload.queueIds)) {
        queueIds = payload.queueIds.filter((value): value is string => typeof value === 'string' && value.length > 0)
      }
      if (payload && Array.isArray(payload.recipientEmails)) {
        recipientEmails = payload.recipientEmails
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
          .map((value) => value.toLowerCase())
      }
    }

    if (recipientEmails && recipientEmails.length > 0 && (!queueIds || queueIds.length !== 1)) {
      return new Response(
        JSON.stringify({ error: 'recipientEmails requires exactly one queueId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get pending email queue items
    let queueQuery = supabaseClient
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('scheduled_at', { ascending: true })
      .limit(50) // Process in batches

    if (queueIds && queueIds.length > 0) {
      queueQuery = queueQuery.in('id', queueIds)
    }

    const { data: queueItems, error: queueError } = await queueQuery

    if (queueError) {
      throw new Error(`Failed to fetch queue items: ${queueError.message}`)
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ message: queueIds?.length ? 'No matching queue items to process' : 'No pending emails to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from('newsletter_subscribers')
      .select('id, email, unsubscribe_token, status')
      .or('status.eq.active,status.is.null')

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`)
    }

    let activeSubscribers = subscribers ?? []
    if (recipientEmails && recipientEmails.length > 0) {
      const recipientSet = new Set(recipientEmails)
      activeSubscribers = activeSubscribers.filter((subscriber) =>
        recipientSet.has(subscriber.email.toLowerCase())
      )
    }

    if (!activeSubscribers || activeSubscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: recipientEmails?.length ? 'No matching active recipients found' : 'No active subscribers found' }),
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
        let contentData: BlogPostContent | ProjectContent | null = null
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
        const emailPromises = activeSubscribers.map(async (subscriber: NewsletterSubscriber) => {
          try {
            let emailHtml = ''
            let subject = ''

            if (queueItem.content_type === 'blog_post') {
              const blogContent = contentData as BlogPostContent
              const emailData: BlogPostEmailData = {
                subscriberEmail: subscriber.email,
                unsubscribeToken: subscriber.unsubscribe_token,
                siteUrl,
                post: {
                  title: blogContent.title,
                  excerpt: blogContent.excerpt ?? '',
                  slug: blogContent.slug,
                  publishedDate: blogContent.published_date ?? blogContent.created_at,
                  tags: blogContent.tags ?? []
                }
              }
              emailHtml = generateBlogPostEmail(emailData)
              subject = `New Blog Post: ${blogContent.title}`
            } else {
              const projectContent = contentData as ProjectContent
              const emailData: ProjectEmailData = {
                subscriberEmail: subscriber.email,
                unsubscribeToken: subscriber.unsubscribe_token,
                siteUrl,
                project: {
                  title: projectContent.title,
                  description: projectContent.description ?? '',
                  techTags: projectContent.tech_tags ?? [],
                  imageUrl: projectContent.image_url ?? undefined,
                  repoUrl: projectContent.repo_url ?? undefined,
                  id: projectContent.id
                }
              }
              emailHtml = generateProjectEmail(emailData)
              subject = `New Project: ${projectContent.title}`
            }

            // Send email via Resend
                        
            const emailPayload = {
              from: 'imadlab <onboarding@resend.dev>',
              to: [subscriber.email],
              subject: subject,
              html: emailHtml,
              headers: {
                'List-Unsubscribe': `<${siteUrl}/functions/v1/handle-unsubscribe?token=${subscriber.unsubscribe_token}>`,
              }
            }
            
                        
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailPayload),
            })

                        
            if (!emailResponse.ok) {
              const errorText = await emailResponse.text()
              console.error('Resend API error:', errorText)
              throw new Error(`Resend API error (${emailResponse.status}): ${errorText}`)
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
            const message = error instanceof Error ? error.message : 'Unknown error'
            console.error(`Failed to send email to ${subscriber.email}:`, error)
            return { success: false, email: subscriber.email, error: message }
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
          totalSubscribers: activeSubscribers.length
        })

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to process queue item ${queueItem.id}:`, error)
        
        await supabaseClient
          .from('email_queue')
          .update({ 
            status: 'failed',
            retry_count: queueItem.retry_count + 1,
            error_message: message
          })
          .eq('id', queueItem.id)

        results.push({
          queueItemId: queueItem.id,
          error: message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Email processing completed',
        results,
        processedItems: queueItems.length,
        totalSubscribers: activeSubscribers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Email sending function error:', error)
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
