-- Issue #10: correct unsupported claims. Idempotent; only touches the strings below.

update public.projects
set full_description = replace(
  replace(
    full_description,
    ' after a challenge from my professor, Tommi Tuomola.',
    '.'
  ),
  'The repository retains earlier model experiments as historical research artifacts. Those metrics do not describe the current deployed application.',
  'The repository also keeps an earlier machine-learning forecasting experiment. Its reported error figures came from an evaluation that was not leakage-free, and its exported model was never checked against the output format the service expects, so I don''t cite them. No trained model is deployed, and I have not yet scored the projections against held-out real data.'
)
where title in (
  'NaviCast: Real-Time Maritime Intelligence Pipeline',
  'NaviCast: Live Baltic Vessel Explorer'
);

update public.projects
set full_description = replace(full_description, 'completed in 2026.', 'completed in 2025.')
where title like 'IPKE:%';

-- Title last so the statements above still match on first run.
update public.projects
set
  title = 'NaviCast: Live Baltic Vessel Explorer',
  tech_tags = array_append(
    array_append(array_remove(array_remove(tech_tags, 'predictive-modeling'), 'time-series'), 'dead-reckoning'),
    'cloudflare-workers'
  )
where title = 'NaviCast: Real-Time Maritime Intelligence Pipeline';
