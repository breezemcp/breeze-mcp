import fetch from 'node-fetch';
import { ProxyConfig, GatewayResponse, SignupResult, UsageResult, TopupResult } from './types.js';

export class BreezeGateway {
  private config: ProxyConfig;

  constructor(config: ProxyConfig) {
    this.config = config;
  }

  private async makeRequest<T>(endpoint: string, params: any, method: 'POST' | 'GET' = 'POST', requiresAuth: boolean = false): Promise<T> {
    const url = `${this.config.gatewayUrl}/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Breeze-MCP/0.1.0'
    };

    if (requiresAuth || this.config.apiKey) {
      if (!this.config.apiKey) {
        throw new Error('API key required for this operation. Run breeze_signup to get a free API key');
      }
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const requestOptions: any = {
        method,
        headers,
        timeout: 60000
      };

      if (method === 'POST' && params) {
        requestOptions.body = JSON.stringify(params);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        
        switch (response.status) {
          case 401:
            throw new Error('Invalid API key. Get one at https://breezemcp.xyz');
          case 402:
            throw new Error('Payment required. Your account has insufficient credits. Visit https://breezemcp.xyz to add credits');
          case 429:
            throw new Error('Rate limit exceeded. Upgrade your plan at https://breezemcp.xyz for higher limits');
          case 403:
            throw new Error('Access denied. Check your API key permissions');
          default:
            throw new Error(`Gateway error ${response.status}: ${errorText}`);
        }
      }

      const result: GatewayResponse<T> = await response.json() as any;
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'Gateway request failed');
      }

      return result.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Gateway request failed: ${error}`);
    }
  }

  async fetch(params: {
    url: string;
    country?: string;
    region?: string;
    format?: string;
    session_id?: string;
  }): Promise<string> {
    return await this.makeRequest<string>('proxy_fetch', params);
  }

  async search(params: {
    query: string;
    country?: string;
    num_results?: number;
    session_id?: string;
  }): Promise<any[]> {
    return await this.makeRequest<any[]>('proxy_search', params);
  }

  async batch(params: {
    urls: string[];
    country?: string;
    session_id?: string;
  }): Promise<any[]> {
    return await this.makeRequest<any[]>('proxy_batch', params);
  }

  async geocheck(params: {
    country: string;
    session_id?: string;
  }): Promise<any> {
    return await this.makeRequest<any>('proxy_geocheck', params);
  }

  async screenshot(params: {
    url: string;
    country?: string;
    session_id?: string;
  }): Promise<string> {
    return await this.makeRequest<string>('proxy_screenshot', params);
  }

  async createSession(params: {
    country: string;
    duration_minutes?: number;
    region?: string;
  }): Promise<any> {
    return await this.makeRequest<any>('proxy_session', params);
  }

  async signup(params: {
    email?: string;
  } = {}): Promise<SignupResult> {
    return await this.makeRequest<SignupResult>('v1/signup', params, 'POST', false);
  }

  async usage(): Promise<UsageResult> {
    return await this.makeRequest<UsageResult>('v1/usage', null, 'GET', true);
  }

  async topup(params: {
    plan?: 'starter' | 'pro' | 'business' | 'paygo';
    amount?: number;
  } = {}): Promise<TopupResult> {
    return await this.makeRequest<TopupResult>('v1/topup', params, 'POST', true);
  }

  async authorize(params: {
    tool: string;
    params: any;
  }): Promise<{ authorized: boolean; proxy_user?: string; proxy_pass?: string; proxy_host?: string; proxy_port?: string }> {
    return await this.makeRequest<any>('v1/authorize', params, 'POST', true);
  }
}