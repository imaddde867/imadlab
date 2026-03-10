update public.projects
set image_url = '/images/projects/multi-view-industrial-context-tracking.gif',
    updated_at = timezone('utc'::text, now())
where title = 'Multi-View Industrial Context Tracking';
