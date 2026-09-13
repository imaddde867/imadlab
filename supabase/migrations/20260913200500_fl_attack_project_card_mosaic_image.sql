-- Swap the FL-Attack project card image from a screenshot of the dashboard
-- header to a face mosaic (49 unique crops: originals plus reconstructions
-- across every method/defense, deduped by client), which reads better as a
-- general "what this project is about" thumbnail than a text-heavy screenshot.
update public.projects
set
  image_url = $img$https://raw.githubusercontent.com/imaddde867/FL-Attack/main/results/report/figures/project_card_mosaic.png$img$,
  updated_at = now()
where id = '6dd91268-b428-4803-9100-904bf51b895f';
