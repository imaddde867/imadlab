import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
}

interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced' | 'email.opened' | 'email.clicked';
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    click?: {
      ipAddress: string;
      link: string;
      timestamp: string;
      userAgent: string;
    };
    open?: {
      ipAddress: string;
      timestamp: string;
      userAgent: string;
    };
  };
}

async function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): Promise<boolean> {
  try {
    // Resend uses Svix for webhook signatures
    // The signature format is: t=timestamp,v1=signature
    const elements = signature.split(',')
    const timestampElement = elements.find(el => el.startsWith('t='))
    const signatureElement = elements.find(el => el.startsWith('v1='))
    
    if (!timestampElement || !signatureElement) {
      return false
    }
    
    const webhookTimestamp = timestampElement.split('=')[1]
    const webhookSignature = signatureElement.split('=')[1]
    
    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000)
    const webhookTime = parseInt(webhookTimestamp)
    if (Math.abs(now - webhookTime) > 300) {
      return false
    }
    
    // Create expected signature
    const signedPayload = `${webhookTimestamp}.${payload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature_bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature_bytes)))
    
    return expectedSignature === webhookSignature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET environment variable is required')
      return new Response('Webhook secret not configured', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // Get webhook headers
    const signature = req.headers.get('svix-signature')
    const timestamp = req.headers.get('svix-timestamp')
    const webhookId = req.headers.get('svix-id')

    if (!signature || !timestamp) {
      return new Response('Missing required webhook headers', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Get request body
    const payload = await req.text()
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(payload, signature, timestamp, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { 
        status: 401,
        headers: corsHeaders 
      })
    }

    // Parse webhook event
    const event: ResendWebhookEvent = JSON.parse(payload)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the email analytics record by email address and recent timestamp
    // Since we don't have the email_id mapping, we'll match by recipient email and recent sends
    const recipientEmail = event.data.to[0] // Assuming single recipient
    
    const { data: analyticsRecord, error: findError } = await supabaseClient
      .from('email_analytics')
      .select('*')
      .eq('subscriber_email', recipientEmail)
      .is('delivered_at', null) // Find undelivered emails first
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error finding analytics record:', findError)
      return new Response('Database error', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // If no undelivered email found, try to find the most recent one
    let targetRecord = analyticsRecord
    if (!targetRecord) {
      const { data: recentRecord } = await supabaseClient
        .from('email_analytics')
        .select('*')
        .eq('subscriber_email', recipientEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      targetRecord = recentRecord
    }

    if (!targetRecord) {
      console.log(`No analytics record found for email: ${recipientEmail}`)
      return new Response('Analytics record not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }

    // Update analytics based on event type
    const updateData: Partial<Record<'delivered_at' | 'opened_at' | 'clicked_at' | 'bounced_at', string>> = {}
    const eventTimestamp = new Date(event.created_at).toISOString()

    switch (event.type) {
      case 'email.delivered':
        updateData.delivered_at = eventTimestamp
        break
      case 'email.opened':
        updateData.opened_at = eventTimestamp
        break
      case 'email.clicked':
        updateData.clicked_at = eventTimestamp
        break
      case 'email.bounced':
        updateData.bounced_at = eventTimestamp
        // Also mark subscriber as inactive
        await supabaseClient
          .from('newsletter_subscribers')
          .update({ status: 'inactive' })
          .eq('email', recipientEmail)
        break
      case 'email.complained':
        // Mark as bounced and unsubscribe
        updateData.bounced_at = eventTimestamp
        await supabaseClient
          .from('newsletter_subscribers')
          .update({ status: 'unsubscribed' })
          .eq('email', recipientEmail)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
        return new Response('Event processed', { 
          status: 200,
          headers: corsHeaders 
        })
    }

    // Update analytics record
    const { error: updateError } = await supabaseClient
      .from('email_analytics')
      .update(updateData)
      .eq('id', targetRecord.id)

    if (updateError) {
      console.error('Error updating analytics:', updateError)
      return new Response('Failed to update analytics', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    console.log(`Processed ${event.type} event for ${recipientEmail}`)
    
    return new Response('Webhook processed successfully', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})