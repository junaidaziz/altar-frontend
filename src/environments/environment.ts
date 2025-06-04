// Allow using process.env without adding Node types globally
const { API_URL, WS_URL } = process.env;

export const environment = {
  production: false, // Set to true for production build
  apiUrl: API_URL ?? "http://localhost:3000", // API base URL
  wsUrl: WS_URL ?? "ws://localhost:3000" // WebSocket server URL
};
