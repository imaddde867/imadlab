-- Multi-View card: state that it was a course project. No claim about team size.
-- Idempotent: skips the row if the line is already there.
update public.projects
set full_description = 'Course project at Turku University of Applied Sciences.' || E'\n\n' || full_description,
    updated_at = timezone('utc'::text, now())
where title = 'Multi-View Industrial Context Tracking'
  and full_description not like 'Course project at Turku University of Applied Sciences.%';
