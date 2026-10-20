export function selectHomeProjects<
  T extends { id: string; featured?: boolean | null; created_at: string },
>(projects: readonly T[]): T[];
