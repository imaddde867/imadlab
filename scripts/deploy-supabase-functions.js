import { spawnSync } from 'node:child_process';
import { SUPABASE_URL } from './supabase-config.js';

const resolveProjectRef = () => {
  if (process.env.SUPABASE_PROJECT_REF) return process.env.SUPABASE_PROJECT_REF;
  if (!SUPABASE_URL) return null;
  try {
    const url = new URL(SUPABASE_URL);
    const host = url.hostname;
    if (!host) return null;
    return host.split('.')[0] || null;
  } catch {
    return null;
  }
};

const main = () => {
  const projectRef = resolveProjectRef();
  if (!projectRef) {
    console.error('Supabase project ref not found. Set SUPABASE_PROJECT_REF or SUPABASE_URL.');
    process.exit(1);
  }

  const result = spawnSync(
    'supabase',
    ['functions', 'deploy', 'render-email-preview', 'send-newsletter-emails', '--project-ref', projectRef],
    { stdio: 'inherit' }
  );

  if (result.error) {
    console.error('Failed to run Supabase CLI. Is it installed and authenticated?');
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

main();
