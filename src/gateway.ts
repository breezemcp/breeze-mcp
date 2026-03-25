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

    if (requiresAuth && !this.config.apiKey) {
      throw new Error('API key required for this operation. Run breeze_signup to get a free API key');
    }
    if (this.config.apiKey) {
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
    return await this.makeRequest<string>('fetch', params);
  }

  async search(params: {
    query: string;
    country?: string;
    num_results?: number;
    session_id?: string;
  }): Promise<any[]> {
    return await this.makeRequest<any[]>('search', params);
  }

  async batch(params: {
    urls: string[];
    country?: string;
    session_id?: string;
  }): Promise<any[]> {
    return await this.makeRequest<any[]>('batch', params);
  }

  async geocheck(params: {
    country: string;
    session_id?: string;
  }): Promise<any> {
    return await this.makeRequest<any>('geocheck', params);
  }

  // New gateway methods that call the Worker's API endpoints directly
  async gatewayFetch(params: {
    url: string;
    country?: string;
    region?: string;
    format?: string;
  }): Promise<any> {
    return await this.makeRequest<any>('fetch', params, 'POST', false);
  }

  async gatewaySearch(params: {
    query: string;
    country?: string;
    num_results?: number;
  }): Promise<any> {
    return await this.makeRequest<any>('search', params, 'POST', false);
  }

  async gatewayGeocheck(params: {
    country: string;
  }): Promise<any> {
    return await this.makeRequest<any>('geocheck', params, 'POST', false);
  }

  async screenshot(params: {
    url: string;
    country?: string;
    session_id?: string;
  }): Promise<string> {
    return await this.makeRequest<string>('screenshot', params);
  }

  async createSession(params: {
    country: string;
    duration_minutes?: number;
    region?: string;
  }): Promise<any> {
    return await this.makeRequest<any>('session', params);
  }

  async signup(params: {
    email?: string;
  } = {}): Promise<SignupResult> {
    return await this.makeRequest<SignupResult>('signup', params, 'POST', false);
  }

  async usage(): Promise<UsageResult> {
    return await this.makeRequest<UsageResult>('usage', null, 'GET', true);
  }

  async topup(params: {
    plan?: 'starter' | 'pro' | 'business' | 'paygo';
    amount?: number;
  } = {}): Promise<TopupResult> {
    return await this.makeRequest<TopupResult>('topup', params, 'POST', true);
  }

  async authorize(params: {
    tool: string;
    params: any;
  }): Promise<{ authorized: boolean }> {
    return await this.makeRequest<any>('authorize', params, 'POST', true);
  }
}