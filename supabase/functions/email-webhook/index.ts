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
    const _webhookId = req.headers.get('svix-id')

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
    
    // For different event types, use different matching strategies
    let targetRecord = null
    
    if (event.type === 'email.delivered') {
      // For delivered events, find the most recent sent email without delivery confirmation
      const { data: analyticsRecord } = await supabaseClient
        .from('email_analytics')
        .select('*')
        .eq('subscriber_email', recipientEmail)
        .not('sent_at', 'is', null)
        .is('delivered_at', null)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      targetRecord = analyticsRecord
    } else if (event.type === 'email.opened') {
      // For opened events, find the most recent delivered email without open confirmation
      const { data: analyticsRecord } = await supabaseClient
        .from('email_analytics')
        .select('*')
        .eq('subscriber_email', recipientEmail)
        .not('delivered_at', 'is', null)
        .is('opened_at', null)
        .order('delivered_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      targetRecord = analyticsRecord
    } else if (event.type === 'email.clicked') {
      // For clicked events, find the most recent delivered email without click confirmation
      const { data: analyticsRecord } = await supabaseClient
        .from('email_analytics')
        .select('*')
        .eq('subscriber_email', recipientEmail)
        .not('delivered_at', 'is', null)
        .is('clicked_at', null)
        .order('delivered_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      targetRecord = analyticsRecord
    } else {
      // For bounced/complained, find the most recent sent email
      const { data: analyticsRecord } = await supabaseClient
        .from('email_analytics')
        .select('*')
        .eq('subscriber_email', recipientEmail)
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      targetRecord = analyticsRecord
    }

    if (!targetRecord) {
      console.log(`No analytics record found for ${event.type} event for email: ${recipientEmail}`)
      return new Response(JSON.stringify({ 
        message: 'Analytics record not found',
        eventType: event.type,
        recipientEmail 
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update analytics based on event type
    const updateData: Partial<Record<'delivered_at' | 'opened_at' | 'clicked_at' | 'bounced_at', string>> = {}
    const eventTimestamp = new Date(event.created_at).toISOString()

    console.log(`Processing ${event.type} event for ${recipientEmail}, analytics record ID: ${targetRecord.id}`)

    switch (event.type) {
      case 'email.delivered':
        updateData.delivered_at = eventTimestamp
        console.log(`Marking email as delivered at ${eventTimestamp}`)
        break
      case 'email.opened':
        updateData.opened_at = eventTimestamp
        console.log(`Marking email as opened at ${eventTimestamp}`)
        break
      case 'email.clicked':
        updateData.clicked_at = eventTimestamp
        console.log(`Marking email as clicked at ${eventTimestamp}`)
        break
      case 'email.bounced':
        updateData.bounced_at = eventTimestamp
        console.log(`Marking email as bounced at ${eventTimestamp}`)
        // Also mark subscriber as inactive
        await supabaseClient
          .from('newsletter_subscribers')
          .update({ status: 'inactive' })
          .eq('email', recipientEmail)
        console.log(`Marked subscriber ${recipientEmail} as inactive`)
        break
      case 'email.complained':
        // Mark as bounced and unsubscribe
        updateData.bounced_at = eventTimestamp
        console.log(`Processing spam complaint at ${eventTimestamp}`)
        await supabaseClient
          .from('newsletter_subscribers')
          .update({ status: 'unsubscribed' })
          .eq('email', recipientEmail)
        console.log(`Unsubscribed ${recipientEmail} due to spam complaint`)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
        return new Response(JSON.stringify({ 
          message: 'Event type not handled',
          eventType: event.type 
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    // Update analytics record
    const { error: updateError } = await supabaseClient
      .from('email_analytics')
      .update(updateData)
      .eq('id', targetRecord.id)

    if (updateError) {
      console.error('Error updating analytics:', updateError)
      return new Response(JSON.stringify({ 
        error: 'Failed to update analytics',
        details: updateError.message 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Successfully processed ${event.type} event for ${recipientEmail}`)
    
    return new Response(JSON.stringify({ 
      message: 'Webhook processed successfully',
      eventType: event.type,
      recipientEmail,
      analyticsId: targetRecord.id,
      timestamp: eventTimestamp
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    console.error('Webhook processing error:', errorMessage)
    console.error('Stack trace:', errorStack)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})