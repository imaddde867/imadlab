export type NavigationItem = {
  path: string;
  label: string;
};

export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  { path: '/projects', label: 'Projects' },
  { path: '/blogs', label: 'Blogs' },
  { path: '/extras', label: 'Extras' },
  { path: '/about', label: 'About' },
];

export const getAbsoluteNavUrl = (baseUrl: string, path: string) =>
  `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
