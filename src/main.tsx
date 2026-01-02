import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import 'katex/dist/katex.min.css';
import './index.css';
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

createRoot(document.getElementById('root')!).render(<App />);
