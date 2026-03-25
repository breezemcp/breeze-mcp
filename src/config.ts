import { ProxyConfig } from './types.js';

export function getConfig(): ProxyConfig {
  const apiKey = process.env.BREEZE_API_KEY || undefined;
  const gatewayUrl = process.env.BREEZE_GATEWAY_URL || 'https://api.breezemcp.xyz/v1';

  // Debug: log to stderr (won't interfere with MCP stdio)
  if (apiKey) {
    console.error(`[breeze] API key configured: ${apiKey.substring(0, 6)}...`);
  } else {
    console.error('[breeze] No API key - running in anonymous mode (10MB free)');
  }

  return {
    apiKey,
    gatewayUrl
  };
}
