import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateUnsubscribeConfirmationPage(email: string, resubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribed - imadlab Newsletter</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 500px;
            margin: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: white;
            font-size: 24px;
        }
        h1 {
            color: #1a202c;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px 0;
        }
        .email {
            color: #4a5568;
            font-weight: 600;
            background-color: #f7fafc;
            padding: 8px 16px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 20px;
        }
        p {
            color: #718096;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .resubscribe-link {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
            transition: transform 0.2s;
        }
        .resubscribe-link:hover {
            transform: translateY(-2px);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #a0aec0;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">✓</div>
        <h1>Successfully Unsubscribed</h1>
        <div class="email">${email}</div>
        <p>You have been successfully unsubscribed from the imadlab newsletter. You will no longer receive email notifications about new blog posts and projects.</p>
        <p>Changed your mind? You can resubscribe anytime:</p>
        <a href="${resubscribeUrl}" class="resubscribe-link">Resubscribe to Newsletter</a>
        <div class="footer">
            <p>Thank you for being part of the imadlab community!</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

function generateErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - imadlab Newsletter</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 500px;
            margin: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: white;
            font-size: 24px;
        }
        h1 {
            color: #1a202c;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px 0;
        }
        p {
            color: #718096;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .home-link {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
            transition: transform 0.2s;
        }
        .home-link:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">!</div>
        <h1>Oops! Something went wrong</h1>
        <p>${message}</p>
        <a href="${Deno.env.get('SITE_URL') || 'https://imadlab.com'}" class="home-link">Return to imadlab</a>
    </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return new Response(
        generateErrorPage('Invalid unsubscribe link. The unsubscribe token is missing.'),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find subscriber by unsubscribe token
    const { data: subscriber, error: findError } = await supabaseClient
      .from('newsletter_subscribers')
      .select('*')
      .eq('unsubscribe_token', token)
      .single()

    if (findError || !subscriber) {
      return new Response(
        generateErrorPage('Invalid unsubscribe link. The token may have expired or is incorrect.'),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        }
      )
    }

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      const siteUrl = Deno.env.get('SITE_URL') || 'https://imadlab.com'
      return new Response(
        generateUnsubscribeConfirmationPage(subscriber.email, siteUrl),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        }
      )
    }

    // Update subscriber status to unsubscribed
    const { error: updateError } = await supabaseClient
      .from('newsletter_subscribers')
      .update({ 
        status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', token)

    if (updateError) {
      console.error('Failed to update subscriber status:', updateError)
      return new Response(
        generateErrorPage('Failed to process unsubscribe request. Please try again later.'),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        }
      )
    }

    // Record unsubscribe in analytics if there are any recent email sends
    const { data: recentEmails } = await supabaseClient
      .from('email_analytics')
      .select('id')
      .eq('subscriber_email', subscriber.email)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })
      .limit(1)

    if (recentEmails && recentEmails.length > 0) {
      await supabaseClient
        .from('email_analytics')
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq('id', recentEmails[0].id)
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://imadlab.com'
    
    return new Response(
      generateUnsubscribeConfirmationPage(subscriber.email, siteUrl),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      }
    )

  } catch (error) {
    console.error('Unsubscribe function error:', error)
    return new Response(
      generateErrorPage('An unexpected error occurred. Please try again later.'),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      }
    )
  }
})