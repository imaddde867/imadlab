import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/hooks/useAnalytics.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const metadata = {
  user_agent: 'unit',
  device_type: 'desktop',
  browser: 'Chromium',
  os: 'Linux',
  screen_resolution: '1280x900',
  language: 'en',
  timezone: 'UTC',
};
const tick = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
  await new Promise((r) => setTimeout(r, 0));
};
function createHarness({
  initiallyAllowed = false,
  holdMetadata = false,
  holdSession = false,
} = {}) {
  let allowed = initiallyAllowed;
  let path = '/';
  let state = [];
  let cursor = 0;
  let scheduled = false;
  let running = false;
  const pending = [];
  const listeners = new Set();
  const calls = [];
  const signals = [];
  let releaseMetadata;
  let releaseSession;
  const heldMetadata = holdMetadata
    ? new Promise((r) => {
        releaseMetadata = r;
      })
    : Promise.resolve(metadata);
  const heldSession = holdSession
    ? new Promise((r) => {
        releaseSession = r;
      })
    : Promise.resolve({ error: null });
  const same = (a, b) => a && b && a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  const useRef = (initial) => {
    const i = cursor++;
    if (!state[i]) state[i] = { kind: 'ref', value: { current: initial } };
    return state[i].value;
  };
  const useState = (initial) => {
    const i = cursor++;
    if (!state[i])
      state[i] = { kind: 'state', value: typeof initial === 'function' ? initial() : initial };
    const setValue = (newValue) => {
      const old = state[i].value;
      const next = typeof newValue === 'function' ? newValue(old) : newValue;
      if (!Object.is(old, next)) {
        state[i].value = next;
        schedule();
      }
    };
    return [state[i].value, setValue];
  };
  const useCallback = (fn, deps) => {
    const i = cursor++;
    if (!state[i] || !same(state[i].deps, deps)) state[i] = { kind: 'callback', deps, value: fn };
    return state[i].value;
  };
  const useEffect = (fn, deps) => {
    const i = cursor++;
    const previous = state[i];
    if (!previous || !same(previous.deps, deps)) pending.push({ i, fn, deps });
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      queueMicrotask(render);
    }
  };
  const require = (mod) => {
    if (mod === 'react') return { useRef, useState, useCallback, useEffect };
    if (mod === 'react-router-dom') return { useLocation: () => ({ pathname: path }) };
    if (mod === '@/integrations/supabase/client')
      return {
        supabase: {
          rpc(name, args) {
            calls.push({ name, args });
            return {
              abortSignal(signal) {
                signals.push({ name, signal });
                return name === 'track_session' ? heldSession : Promise.resolve({ error: null });
              },
            };
          },
        },
      };
    if (mod === '@/lib/consent')
      return {
        isAllowed: () => allowed,
        onConsentChange: (fn) => {
          listeners.add(fn);
          return () => listeners.delete(fn);
        },
      };
    if (mod === '@/lib/logger')
      return {
        logger: {
          error(...args) {
            throw Error('Unexpected error: ' + args.join(' '));
          },
        },
      };
    if (mod === '@/lib/analytics-utils')
      return {
        getAnalyticsMetadata: () => heldMetadata,
        extractUTMParams: () => ({}),
        getTrafficSource: () => 'direct',
      };
    throw Error('unknown import ' + mod);
  };
  const sessionStore = new Map();
  let uuid = 0;
  const sandbox = {
    require,
    exports: {},
    sessionStorage: {
      getItem(k) {
        return sessionStore.get(k) ?? null;
      },
      setItem(k, v) {
        sessionStore.set(k, v);
      },
      removeItem(k) {
        sessionStore.delete(k);
      },
    },
    crypto: {
      randomUUID() {
        uuid += 1;
        return `uuid-${uuid}`;
      },
    },
    AbortController,
    window: { location: { hostname: 'imadlab.com', href: 'https://imadlab.com/' } },
    document: { referrer: '' },
    console,
  };
  vm.runInNewContext(compiled.outputText, sandbox);
  const useAnalytics = sandbox.exports.useAnalytics;
  function render() {
    if (running) throw Error('re-entrant');
    running = true;
    scheduled = false;
    cursor = 0;
    pending.length = 0;
    useAnalytics();
    for (const { i, fn, deps } of pending) {
      state[i]?.cleanup?.();
      state[i] = { kind: 'effect', deps, cleanup: fn() };
    }
    running = false;
  }
  return {
    render,
    calls,
    signals,
    sessionId: () => sessionStore.get('analytics_session_id') ?? null,
    grant() {
      allowed = true;
      for (const f of listeners) f({ analytics: true });
    },
    revoke() {
      allowed = false;
      for (const f of listeners) f({ analytics: false });
    },
    changePath(p) {
      path = p;
      schedule();
    },
    releaseMetadata() {
      releaseMetadata?.(metadata);
    },
    releaseSession() {
      releaseSession?.({ error: null });
    },
  };
}

for (const args of [{ initiallyAllowed: false }, { initiallyAllowed: true }]) {
  const h = createHarness(args);
  h.render();
  await tick();
  assert.equal(h.calls.length, args.initiallyAllowed ? 2 : 0);
  if (!args.initiallyAllowed) {
    h.grant();
    await tick();
    assert.deepEqual(
      h.calls.map((x) => x.name),
      ['track_session', 'track_page_view']
    );
  }
  h.revoke();
  await tick();
  const length = h.calls.length;
  h.changePath('/projects');
  await tick();
  assert.equal(h.calls.length, length);
}
{
  const h = createHarness({ holdMetadata: true });
  h.render();
  h.grant();
  await tick();
  h.revoke();
  await tick();
  h.releaseMetadata();
  await tick();
  assert.equal(h.calls.length, 0, 'withdrawal during metadata collection is safe');
  h.grant();
  await tick();
  assert.deepEqual(
    h.calls.map((x) => x.name),
    ['track_session', 'track_page_view']
  );
}
{
  const h = createHarness({ initiallyAllowed: true, holdSession: true });
  h.render();
  await tick();
  assert.deepEqual(
    h.calls.map((x) => x.name),
    ['track_session']
  );
  h.revoke();
  await tick();
  assert.equal(h.signals[0].signal.aborted, true);
  h.releaseSession();
  await tick();
  assert.deepEqual(
    h.calls.map((x) => x.name),
    ['track_session']
  );
}
{
  const h = createHarness({ initiallyAllowed: true });
  h.render();
  await tick();
  const first = h.sessionId();
  assert.ok(first, 'consented mount creates a session ID');
  h.revoke();
  await tick();
  assert.equal(h.sessionId(), null, 'revocation clears the stored session ID');
  h.grant();
  await tick();
  assert.ok(h.sessionId(), 're-opt-in creates a session ID');
  assert.notEqual(h.sessionId(), first, 're-opt-in does not reuse the withdrawn session');
}
console.log(
  'PASS useAnalytics opt-in, opt-out, async races, AbortSignals, session reset and regrant'
);
