/// <reference types="vite/client" />

declare global {
  interface Window {
    __PRERENDERED_DATA__?: Record<string, unknown>;
  }
}
