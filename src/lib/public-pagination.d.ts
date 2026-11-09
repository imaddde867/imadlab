export type PublicPage<T> = {
  data: T[] | null;
  error: { message: string } | null;
  count: number | null;
};
export type PublicCount = { count: number | null; error: { message: string } | null };
export declare const PUBLIC_PAGE_SIZE: number;
export declare function fetchAllById<T extends { id: string }>(
  loadPage: (cursor: string | null, pageSize: number) => PromiseLike<PublicPage<T>>,
  loadTotal: () => PromiseLike<PublicCount>,
  options?: { label?: string; pageSize?: number },
): Promise<T[]>;
