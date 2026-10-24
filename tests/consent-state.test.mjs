import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const input = fs.readFileSync(new URL('../src/lib/consent.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(input, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
let actualCookie = '';
let cookieBlocked = false;
const store = new Map();
const localStorage = {
  getItem(k) {
    return store.get(k) ?? null;
  },
  setItem(k, v) {
    store.set(k, v);
  },
  removeItem(k) {
    store.delete(k);
  },
};
const document = {
  get cookie() {
    return actualCookie;
  },
  set cookie(s) {
    if (cookieBlocked) throw Error('blocked');
    actualCookie = s.split(';')[0];
  },
};
const listeners = new Map();
const window = {
  dispatchEvent() {},
  addEventListener(name, cb) {
    listeners.set(name, cb);
  },
  removeEventListener(name, cb) {
    if (listeners.get(name) === cb) listeners.delete(name);
  },
};
const sandbox = {
  require() {
    return { logger: { warn() {}, debug() {} } };
  },
  exports: {},
  document,
  localStorage,
  window,
  CustomEvent: class {
    constructor(a, opts) {
      this.type = a;
      this.detail = opts.detail;
    }
  },
  console,
  Date,
};
vm.runInNewContext(js.outputText, sandbox);
const api = sandbox.exports;
const decode = () => JSON.parse(decodeURIComponent(store.get('imadlab_consent')));
assert.equal(api.getConsent(), null);
api.rejectAll();
assert.equal(api.isAllowed('analytics'), false);
assert.equal(decode().functional, false);
assert.equal(decode().marketing, false);
api.acceptAll();
assert.equal(api.isAllowed('analytics'), true);
assert.equal(decode().functional, false);
assert.equal(decode().marketing, false);
const stale = {
  version: 1,
  essential: true,
  analytics: true,
  marketing: false,
  functional: true,
  timestamp: Date.now() - 181 * 86400000,
};
store.set('imadlab_consent', encodeURIComponent(JSON.stringify(stale)));
actualCookie = '';
assert.equal(api.getConsent(), null, 'localStorage backup expires after 180d');
const oldCookie = { ...stale, timestamp: Date.now() - 100000 };
actualCookie = 'imadlab_consent=' + encodeURIComponent(JSON.stringify(oldCookie));
cookieBlocked = true;
api.rejectAll();
assert.equal(
  api.isAllowed('analytics'),
  false,
  'newer localStorage revocation overrides stale cookie'
);
assert.equal(api.getConsent().functional, false);

store.set('imadlab_consent', 'not-json');
actualCookie = '';
assert.equal(api.getConsent(), null, 'malformed localStorage is ignored');
const future = { ...oldCookie, timestamp: Date.now() + 10 * 60 * 1000 };
actualCookie = 'imadlab_consent=' + encodeURIComponent(JSON.stringify(future));
assert.equal(api.getConsent(), null, 'far-future timestamp is rejected');
actualCookie = '';
api.acceptAll();

let latest;
const unsubscribe = api.onConsentChange((state) => {
  latest = state;
});
let isolated;
const unsubscribeThrowing = api.onConsentChange(() => {
  throw Error('subscriber failure');
});
const unsubscribeGood = api.onConsentChange((state) => {
  isolated = state;
});
assert.ok(listeners.has('storage'), 'storage listener installed for cross-tab updates');
const otherTab = {
  version: 1,
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
  timestamp: Date.now() + 10,
};
store.set('imadlab_consent', encodeURIComponent(JSON.stringify(otherTab)));
listeners.get('storage')({ key: 'imadlab_consent' });
assert.equal(latest.analytics, false, 'cross-tab withdrawal reaches subscribers');
assert.equal(isolated.analytics, false, 'a throwing subscriber does not block others');
const otherGrant = { ...otherTab, analytics: true, functional: true, timestamp: Date.now() + 20 };
store.set('imadlab_consent', encodeURIComponent(JSON.stringify(otherGrant)));
listeners.get('storage')({ key: 'imadlab_consent' });
assert.equal(latest.analytics, true, 'cross-tab grant reaches subscribers');
store.clear();
actualCookie = '';
listeners.get('storage')({ key: null });
assert.equal(latest.analytics, false, 'cleared storage revokes');
unsubscribe();
unsubscribeThrowing();
unsubscribeGood();
assert.ok(!listeners.has('storage'), 'storage listener is cleaned up');
console.log(
  'PASS consent defaults, preferences, expiry, fallback, cross-tab changes and subscriber isolation'
);
