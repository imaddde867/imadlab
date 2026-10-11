-- Unpublish coursework-grade or overclaiming projects (Oct 5 audit); republish once fixed.
update public.projects set published = false, featured = false
where title in (
  'Term Deposit Subscription Prediction (Tabular ML Benchmark)',
  'Spotify Recommendation Pipeline (Content-Based Clustering)',
  'Spiral Untangler: From-Scratch Neural Network in NumPy',
  'ClearBox: Secure Messaging Platform Prototype',
  'Vehicle Detection and Stylization Benchmark (GAN-CNN)',
  'imadlab.com: Research Portfolio Platform'
);

-- NaviCast stays public but unfeatured until its evaluation is repaired.
update public.projects set featured = false
where title = 'NaviCast: Real-Time Maritime Intelligence Pipeline';

update public.projects
set full_description = replace(
  full_description,
  'median ≈ 0.011 km',
  'median ≈ 0.011 km (row-random split; not leakage-free deployment evidence, a held-out time/vessel evaluation against a dead-reckoning baseline is in progress)'
)
where title = 'NaviCast: Real-Time Maritime Intelligence Pipeline';
