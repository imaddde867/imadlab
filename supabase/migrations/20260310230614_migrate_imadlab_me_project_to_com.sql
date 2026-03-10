update public.projects
set title = 'imadlab.com: Research Portfolio Platform',
    demo_url = 'https://imadlab.com/',
    updated_at = timezone('utc'::text, now())
where id = '5cf746e6-934f-400d-b51b-62e0daa4a183'
  and (
    title ilike '%imadlab.me%'
    or demo_url ilike '%imadlab.me%'
  );
