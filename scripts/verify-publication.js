import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export async function verifyPublication(marker, {
  fetchMarker = (attempt) => fetch(
    `https://imadlab.com/publication-build.txt?build=${marker}&probe=${attempt}`,
    { redirect: 'error', signal: AbortSignal.timeout(5_000) },
  ),
  attempts = 30,
  wait = () => delay(10_000),
} = {}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let published = false;
    try {
      const response = await fetchMarker(attempt);
      published = response.ok && (await response.text()).trim() === marker;
    } catch {
      // Pages may still be propagating or temporarily unreachable.
    }
    if (published) return;
    if (attempt < attempts) await wait();
  }
  throw new Error(`Build ${marker} was not observed on imadlab.com. Check the GitHub Pages deployment, then dispatch a fresh build.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const marker = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
  if (!/^\d+-\d+$/.test(marker)) throw new Error('GitHub run ID and attempt are required');
  await verifyPublication(marker);
  console.log(`Verified that build ${marker} is public.`);
}
