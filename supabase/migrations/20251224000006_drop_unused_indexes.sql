-- Drop truly unused analytics and project indexes to reduce write overhead.
DROP INDEX IF EXISTS public.projects_featured_created_at_idx;
DROP INDEX IF EXISTS public.idx_page_views_traffic_source;
DROP INDEX IF EXISTS public.idx_page_views_utm_source;
DROP INDEX IF EXISTS public.idx_page_views_utm_campaign;
DROP INDEX IF EXISTS public.idx_page_views_device_type;
DROP INDEX IF EXISTS public.idx_page_views_browser;
DROP INDEX IF EXISTS public.idx_page_views_country;
DROP INDEX IF EXISTS public.idx_visitor_sessions_device_type;
DROP INDEX IF EXISTS public.idx_visitor_sessions_country;
