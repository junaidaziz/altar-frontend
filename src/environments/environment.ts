// Allow using process.env without adding Node types globally
// but guard against the variable not existing in the browser
declare const process: { env: Record<string, string | undefined> } | undefined;

const API_URL =
  typeof process !== 'undefined' ? process.env['API_URL'] : undefined;
const WS_URL =
  typeof process !== 'undefined' ? process.env['WS_URL'] : undefined;

export const environment = {
  production: false, // Set to true for production build
  apiUrl: API_URL ?? "http://localhost:3000", // API base URL
  wsUrl: WS_URL ?? "ws://localhost:3000" // WebSocket server URL
};
