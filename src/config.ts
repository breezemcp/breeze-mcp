import { ProxyConfig } from './types.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export function getConfig(): ProxyConfig {
  let apiKey = process.env.BREEZE_API_KEY || undefined;
  const gatewayUrl = process.env.BREEZE_GATEWAY_URL || 'https://api.breezemcp.xyz/v1';

  // Fallback: read from ~/.breeze/config.json
  if (!apiKey) {
    try {
      const configPath = join(homedir(), '.breeze', 'config.json');
      if (existsSync(configPath)) {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        apiKey = config.apiKey || config.api_key || undefined;
      }
    } catch {}
  }

  if (apiKey) {
    console.error(`[breeze] API key: ${apiKey.substring(0, 6)}...`);
  } else {
    console.error('[breeze] Anonymous mode (10MB free). Run breeze_signup for 50MB.');
  }

  return { apiKey, gatewayUrl };
}
