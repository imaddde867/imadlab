import type { ReactNode } from 'react';

export function StaticPublicationNotice({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-white/70">
      {children}{' '}
      <a
        href="https://github.com/imaddde867/imadlab/actions/workflows/deploy.yml"
        target="_blank"
        rel="noreferrer"
        className="text-white underline"
      >
        Open website rebuild in GitHub
      </a>
    </p>
  );
}
