import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Eager CSS link in the built HTML also styles prerendered math without JavaScript.
import 'katex/dist/katex.min.css';
import { excludeFromAnalytics, includeInAnalytics, isOwnerExcluded } from './lib/consent';

// Expose analytics exclusion functions globally for the site owner
// Usage in browser console:
//   excludeFromAnalytics()  - Stop tracking your visits
//   includeInAnalytics()    - Resume tracking your visits
//   isOwnerExcluded()       - Check if you're currently excluded
declare global {
  interface Window {
    excludeFromAnalytics: typeof excludeFromAnalytics;
    includeInAnalytics: typeof includeInAnalytics;
    isOwnerExcluded: typeof isOwnerExcluded;
  }
}
window.excludeFromAnalytics = excludeFromAnalytics;
window.includeInAnalytics = includeInAnalytics;
window.isOwnerExcluded = isOwnerExcluded;

// Keep metadata in the HTML for non-JS visitors, then let Helmet reconcile
// those same nodes on the first render and on client-side navigation.
const prerenderedHead = [
  'meta[name="description"]', 'meta[name="robots"]', 'meta[property^="og:"]',
  'meta[name^="twitter:"]', 'meta[name="google-site-verification"]',
  'meta[name="msvalidate.01"]', 'link[rel="canonical"]', 'link[rel="alternate"]',
  'script[type="application/ld+json"]',
];
document.head.querySelectorAll(prerenderedHead.join(',')).forEach((element) => {
  element.setAttribute('data-rh', 'true');
});

createRoot(document.getElementById('root')!).render(<App />);
