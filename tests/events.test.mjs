import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/events.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

let allowed = false;
let listener = null;
const signals = [];
const rows = [];
let release;
const held = new Promise((resolve) => {
  release = resolve;
});

const sandbox = {
  exports: {},
  require(module) {
    if (module === '@/integrations/supabase/client') {
      return {
        supabase: {
          from(table) {
            assert.equal(table, 'events');
            return {
              insert(row) {
                rows.push(row);
                return {
                  abortSignal(signal) {
                    signals.push(signal);
                    return held;
                  },
                };
              },
            };
          },
        },
      };
    }
    if (module === '@/lib/consent') {
      return {
        isAllowed: () => allowed,
        onConsentChange: (callback) => {
          listener = callback;
          return () => {};
        },
      };
    }
    throw Error(`unknown import ${module}`);
  },
  sessionStorage: { getItem: () => 'session-1' },
  window: { location: { pathname: '/search' } },
  AbortController,
};

vm.runInNewContext(compiled.outputText, sandbox);
const { logEvent } = sandbox.exports;

await logEvent('search_query', { q: 'no consent' });
assert.equal(rows.length, 0, 'no event insert without consent');

allowed = true;
const first = logEvent('search_query', { q: 'first' });
await Promise.resolve();
assert.equal(rows.length, 1);
assert.equal(rows[0].session_id, 'session-1');
assert.equal(signals[0].aborted, false);

allowed = false;
listener({ analytics: false });
assert.equal(signals[0].aborted, true, 'revocation aborts an in-flight event insert');
release({ error: null });
await first;

allowed = true;
listener({ analytics: true });
const second = logEvent('search_query', { q: 'second' });
await Promise.resolve();
assert.equal(rows.length, 2);
assert.equal(signals[1].aborted, false, 'a later opt-in gets a fresh signal');
release({ error: null });
await second;

console.log('PASS event inserts are consent-gated and aborted on withdrawal');
