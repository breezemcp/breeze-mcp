import { ProxyConfig } from './types.js';

export function getConfig(): ProxyConfig {
  const apiKey = process.env.BREEZE_API_KEY;
  const gatewayUrl = process.env.BREEZE_GATEWAY_URL || 'https://api.breezemcp.xyz/v1';
  const userId = process.env.BREEZE_PROXY_USER;
  const password = process.env.BREEZE_PROXY_PASS;
  const host = process.env.BREEZE_PROXY_HOST || 'p1.bytesflows.com';
  const port = parseInt(process.env.BREEZE_PROXY_PORT || '8001');

  // Auto-detection logic
  if (apiKey) {
    return {
      mode: 'api',
      apiKey,
      gatewayUrl
    };
  } else if (userId && password) {
    return {
      mode: 'direct',
      userId,
      password,
      host,
      port
    };
  } else {
    // Free tier mode - no credentials needed
    return {
      mode: 'free',
      gatewayUrl
    };
  }
}