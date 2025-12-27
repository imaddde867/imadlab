export const POST_SUMMARY_SELECT =
  'id,title,slug,excerpt,tags,published_date,read_time,image_url';
export const POST_DETAIL_SELECT =
  'id,title,slug,body,excerpt,tags,published_date,updated_at,read_time,image_url';
export const POST_SEARCH_SELECT =
  'id,title,slug,excerpt,body,tags,published_date,read_time,image_url';
export const POST_ADMIN_SELECT =
  'id,title,slug,body,excerpt,tags,published_date,created_at,read_time,image_url';
export const POST_TITLE_SELECT = 'id,title';

export const PROJECT_LIST_SELECT =
  'id,title,description,tech_tags,image_url,repo_url,demo_url,created_at,updated_at';
export const PROJECT_DETAIL_SELECT =
  'id,title,description,full_description,image_url,tech_tags,repo_url,demo_url,created_at,updated_at';
export const PROJECT_SEARCH_SELECT =
  'id,title,description,full_description,tech_tags,image_url,repo_url,demo_url,created_at,updated_at';
export const PROJECT_ADMIN_SELECT = PROJECT_DETAIL_SELECT;
export const PROJECT_TITLE_SELECT = 'id,title';
