import fetch, { Response } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ProxyConfig, ProxyOptions } from './types.js';

export class BreezeProxy {
  private config: ProxyConfig;

  constructor(config: ProxyConfig) {
    this.config = config;
  }

  private createUsername(options: ProxyOptions = {}): string {
    if (!this.config.userId) {
      throw new Error('User ID not configured for direct mode');
    }

    let username = this.config.userId;
    
    if (options.country) {
      username += `-loc-${options.country.toUpperCase()}`;
      if (options.region) {
        // Support underscore format for region: US_California
        const region = options.region.includes('_') 
          ? options.region 
          : `${options.country.toUpperCase()}_${options.region}`;
        username += `_${region}`;
      }
    }

    // Add sticky session support
    if (options.session) {
      const duration = options.sessionDuration || 10;
      username += `-t-${duration}-s-${options.session}`;
    }
    
    return username;
  }

  private createProxyUrl(options: ProxyOptions = {}): string {
    const username = this.createUsername(options);
    return `http://${username}:${this.config.password}@${this.config.host}:${this.config.port}`;
  }

  async fetch(url: string, options: ProxyOptions = {}): Promise<Response> {
    if (this.config.mode !== 'direct') {
      throw new Error('Direct proxy fetch only available in direct mode');
    }

    const proxyUrl = this.createProxyUrl(options);
    const agent = new HttpsProxyAgent(proxyUrl);
    
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        agent,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}