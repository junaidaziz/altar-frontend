// Access environment variables provided at build time.
// `globalThis.process` may not exist in the browser, so we read it safely.
const API_URL = (globalThis as any)?.process?.env?.API_URL as
  | string
  | undefined;
const WS_URL = (globalThis as any)?.process?.env?.WS_URL as
  | string
  | undefined;

export const environment = {
  production: false, // Set to true for production build
  apiUrl: API_URL ?? "http://localhost:3000", // API base URL
  wsUrl: WS_URL ?? "ws://localhost:3000" // WebSocket server URL
};
