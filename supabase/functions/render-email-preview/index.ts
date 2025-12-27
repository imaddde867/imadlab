import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateBlogPostEmail, generateProjectEmail } from '../shared/email-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ContentType = 'blog_post' | 'project'

type PreviewRequest = {
  contentType: ContentType
  contentId?: string
  mode?: 'latest'
}

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = (await req.json().catch(() => null)) as PreviewRequest | null
    if (!payload) {
      return jsonResponse({ error: 'Missing request payload' }, 400)
    }

    const contentType = payload.contentType
    if (contentType !== 'blog_post' && contentType !== 'project') {
      return jsonResponse({ error: 'Invalid contentType' }, 400)
    }

    const isLatest = payload.mode === 'latest'
    const contentId = typeof payload.contentId === 'string' ? payload.contentId : null
    if (!isLatest && !contentId) {
      return jsonResponse({ error: 'contentId is required unless mode is latest' }, 400)
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const siteUrl = Deno.env.get('SITE_URL') || 'https://imadlab.com'
    const subscriberEmail = 'preview@example.com'
    const unsubscribeToken = 'preview-token'

    if (contentType === 'blog_post') {
      const query = supabaseClient
        .from('posts')
        .select('id, title, slug, excerpt, published_date, created_at, tags, image_url')

      const { data, error } = contentId
        ? await query.eq('id', contentId).single()
        : await query.order('created_at', { ascending: false }).limit(1).maybeSingle()

      if (error || !data) {
        return jsonResponse({ error: 'Blog post not found' }, 404)
      }

      const html = generateBlogPostEmail({
        subscriberEmail,
        unsubscribeToken,
        siteUrl,
        post: {
          title: data.title,
          excerpt: data.excerpt ?? '',
          slug: data.slug,
          publishedDate: data.published_date ?? data.created_at,
          tags: data.tags ?? [],
          imageUrl: data.image_url ?? undefined,
        },
      })

      return jsonResponse({ html, title: data.title })
    }

    const query = supabaseClient
      .from('projects')
      .select('id, title, description, tech_tags, image_url, repo_url, created_at')

    const { data, error } = contentId
      ? await query.eq('id', contentId).single()
      : await query.order('created_at', { ascending: false }).limit(1).maybeSingle()

    if (error || !data) {
      return jsonResponse({ error: 'Project not found' }, 404)
    }

    const html = generateProjectEmail({
      subscriberEmail,
      unsubscribeToken,
      siteUrl,
      project: {
        title: data.title,
        description: data.description ?? '',
        techTags: data.tech_tags ?? [],
        imageUrl: data.image_url ?? undefined,
        repoUrl: data.repo_url ?? undefined,
        id: data.id,
      },
    })

    return jsonResponse({ html, title: data.title })
  } catch (error) {
    console.error('Preview function error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return jsonResponse({ error: message }, 500)
  }
})
