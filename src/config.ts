import { ProxyConfig } from './types.js';

const GATEWAY_URL = 'https://api.breezemcp.xyz/v1';

export function getConfig(): ProxyConfig {
  const apiKey = process.env.BREEZE_API_KEY;
  const userId = process.env.BREEZE_PROXY_USER;
  const password = process.env.BREEZE_PROXY_PASS;
  const host = process.env.BREEZE_PROXY_HOST || '';
  const port = parseInt(process.env.BREEZE_PROXY_PORT || '8001');

  if (apiKey) {
    return {
      mode: 'api',
      apiKey,
      gatewayUrl: GATEWAY_URL
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
    return {
      mode: 'free',
      gatewayUrl: GATEWAY_URL
    };
  }
}
