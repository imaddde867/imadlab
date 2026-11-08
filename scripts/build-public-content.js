import { mkdir, rm, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPublicContent, INVENTORY_FILE } from './public-content.js';

const output = fileURLToPath(INVENTORY_FILE);
const temporary = output + '.' + process.pid + '.tmp';

// Never reuse a snapshot from an earlier build after a failed content query.
await rm(output, { force: true });
const inventory = await fetchPublicContent();
await mkdir(dirname(output), { recursive: true });

try {
  await writeFile(temporary, JSON.stringify(inventory), { flag: 'wx' });
  await rename(temporary, output);
} finally {
  await rm(temporary, { force: true });
}
console.log(
  'Public inventory: ' + inventory.posts.length + ' posts, ' +
  inventory.projects.length + ' projects, ' + inventory.tags.length + ' tags.'
);
