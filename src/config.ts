import { ProxyConfig } from './types.js';

export function getConfig(): ProxyConfig {
  const apiKey = process.env.BREEZE_API_KEY;
  const gatewayUrl = process.env.BREEZE_GATEWAY_URL || 'https://api.breezemcp.xyz/v1';

  return {
    apiKey,
    gatewayUrl
  };
}