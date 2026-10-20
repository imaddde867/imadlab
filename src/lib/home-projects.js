export const selectHomeProjects = (projects) =>
  [...projects]
    .sort(
      (a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        Date.parse(b.created_at) - Date.parse(a.created_at) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    )
    .slice(0, 3);
