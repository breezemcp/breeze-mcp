import { NodeHtmlMarkdown } from 'node-html-markdown';
import * as cheerio from 'cheerio';
import { BreezeProxy } from './proxy.js';
import { BreezeGateway } from './gateway.js';
import { ProxyConfig, ProxyOptions, SearchResult, BatchResult, GeoCheckResult, SessionResult, SignupResult, UsageResult, TopupResult, PlanInfo } from './types.js';

export class BreezeTools {
  private proxy?: BreezeProxy;
  private gateway?: BreezeGateway;
  private config: ProxyConfig;
  private htmlToMarkdown: NodeHtmlMarkdown;

  constructor(config: ProxyConfig) {
    this.config = config;
    this.htmlToMarkdown = new NodeHtmlMarkdown();

    if (config.mode === 'direct') {
      this.proxy = new BreezeProxy(config);
    } else {
      this.gateway = new BreezeGateway(config);
    }
  }

  async proxyFetch(
    url: string, 
    country?: string, 
    region?: string, 
    format: 'markdown' | 'text' | 'raw' = 'markdown',
    sessionId?: string
  ): Promise<string> {
    try {
      if (this.config.mode === 'direct' && this.proxy) {
        const response = await this.proxy.fetch(url, { 
          country, 
          region, 
          session: sessionId 
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        return this.formatContent(html, format);
      } else if (this.gateway) {
        const content = await this.gateway.fetch({
          url,
          country,
          region,
          format,
          session_id: sessionId
        });
        return content;
      } else {
        throw new Error('No proxy or gateway configured');
      }
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatContent(html: string, format: 'markdown' | 'text' | 'raw'): string {
    switch (format) {
      case 'raw':
        return html;
      case 'text':
        const $ = cheerio.load(html);
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('header').remove();
        $('footer').remove();
        return $.text().replace(/\s+/g, ' ').trim();
      case 'markdown':
      default:
        return this.htmlToMarkdown.translate(html);
    }
  }

  async proxySearch(
    query: string, 
    country?: string, 
    numResults: number = 5,
    sessionId?: string
  ): Promise<SearchResult[]> {
    try {
      if (this.config.mode === 'direct' && this.proxy) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${numResults}`;
        const response = await this.proxy.fetch(searchUrl, { 
          country, 
          session: sessionId 
        });
        
        if (!response.ok) {
          throw new Error(`Google search failed: HTTP ${response.status}`);
        }

        const html = await response.text();
        return this.parseGoogleResults(html, numResults);
      } else if (this.gateway) {
        return await this.gateway.search({
          query,
          country,
          num_results: numResults,
          session_id: sessionId
        });
      } else {
        throw new Error('No proxy or gateway configured');
      }
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseGoogleResults(html: string, numResults: number): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Parse Google search results
    $('div[data-ved] h3').each((_, element) => {
      const titleEl = $(element);
      const linkEl = titleEl.closest('a');
      const snippetEl = titleEl.closest('[data-ved]').find('[data-ved] span').last();

      const title = titleEl.text().trim();
      let url = linkEl.attr('href') || '';
      const snippet = snippetEl.text().trim();

      // Clean up Google redirect URLs
      if (url.startsWith('/url?q=')) {
        url = decodeURIComponent(url.split('&')[0].substring(7));
      }

      if (title && url && !url.startsWith('#')) {
        results.push({ title, url, snippet });
      }
    });

    return results.slice(0, numResults);
  }

  async proxyBatch(
    urls: string[], 
    country?: string, 
    sessionId?: string
  ): Promise<BatchResult[]> {
    try {
      if (this.config.mode === 'direct' && this.proxy) {
        const results: BatchResult[] = [];
        
        // Process URLs sequentially to avoid overwhelming the proxy
        for (const url of urls) {
          try {
            const content = await this.proxyFetch(url, country, undefined, 'markdown', sessionId);
            results.push({
              url,
              success: true,
              content
            });
          } catch (error) {
            results.push({
              url,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
          
          // Small delay between requests to be polite
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return results;
      } else if (this.gateway) {
        return await this.gateway.batch({
          urls,
          country,
          session_id: sessionId
        });
      } else {
        throw new Error('No proxy or gateway configured');
      }
    } catch (error) {
      throw new Error(`Batch fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async proxyGeocheck(country: string, sessionId?: string): Promise<GeoCheckResult> {
    try {
      if (this.config.mode === 'direct' && this.proxy) {
        // Use a geolocation service to check our IP
        const response = await this.proxy.fetch('https://httpbin.org/ip', { 
          country, 
          session: sessionId 
        });
        
        if (!response.ok) {
          throw new Error(`Geocheck failed: HTTP ${response.status}`);
        }

        const data = await response.json() as any;
        const ip = data.origin;

        // Get more detailed geo info
        const geoResponse = await this.proxy.fetch(`https://ipapi.co/${ip}/json/`, { 
          country, 
          session: sessionId 
        });
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json() as any;
          return {
            ip,
            country: geoData.country_name || geoData.country_code || 'Unknown',
            region: geoData.region,
            city: geoData.city
          };
        } else {
          return {
            ip,
            country: 'Unknown'
          };
        }
      } else if (this.gateway) {
        return await this.gateway.geocheck({
          country,
          session_id: sessionId
        });
      } else {
        throw new Error('No proxy or gateway configured');
      }
    } catch (error) {
      throw new Error(`Geocheck failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async proxyScreenshot(url: string, country?: string, sessionId?: string): Promise<string> {
    try {
      if (this.config.mode === 'direct') {
        return 'Screenshot functionality is coming soon for direct mode. This feature will allow taking screenshots of web pages through Breeze residential proxies.';
      } else if (this.gateway) {
        return await this.gateway.screenshot({
          url,
          country,
          session_id: sessionId
        });
      } else {
        throw new Error('No proxy or gateway configured');
      }
    } catch (error) {
      throw new Error(`Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createSession(
    country: string,
    durationMinutes: number = 10,
    region?: string
  ): Promise<SessionResult> {
    try {
      if (this.config.mode === 'direct') {
        // For direct mode, generate a session ID
        const sessionId = Math.random().toString(36).substring(7);
        const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
        
        return {
          sessionId,
          country,
          region,
          durationMinutes,
          expiresAt
        };
      } else if (this.gateway) {
        return await this.gateway.createSession({
          country,
          duration_minutes: durationMinutes,
          region
        });
      } else {
        throw new Error('No proxy or gateway configured');
      }
    } catch (error) {
      throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async signup(email?: string): Promise<SignupResult> {
    try {
      if (this.config.mode === 'direct') {
        throw new Error('Account management requires gateway mode. Please configure a gateway URL');
      } 
      
      if (!this.gateway) {
        throw new Error('Gateway not configured');
      }
      
      return await this.gateway.signup({ email });
    } catch (error) {
      throw new Error(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async usage(): Promise<UsageResult> {
    try {
      if (this.config.mode === 'direct') {
        throw new Error('Account management requires gateway mode. Please configure a gateway URL');
      } 
      
      if (!this.gateway) {
        throw new Error('Gateway not configured');
      }
      
      return await this.gateway.usage();
    } catch (error) {
      throw new Error(`Usage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async topup(plan?: 'starter' | 'pro' | 'business' | 'paygo', amount?: number): Promise<TopupResult> {
    try {
      if (this.config.mode === 'direct') {
        throw new Error('Account management requires gateway mode. Please configure a gateway URL');
      } 
      
      if (!this.gateway) {
        throw new Error('Gateway not configured');
      }
      
      return await this.gateway.topup({ plan, amount });
    } catch (error) {
      throw new Error(`Topup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getPlans(): PlanInfo[] {
    return [
      {
        name: 'Free',
        price: 'Free',
        daily_limit: '100 requests/day',
        description: 'signup required'
      },
      {
        name: 'Starter',
        price: '$9/mo',
        daily_limit: '5,000 requests/day',
        description: 'Perfect for small projects'
      },
      {
        name: 'Pro',
        price: '$29/mo',
        daily_limit: '25,000 requests/day',
        description: 'Best for growing businesses'
      },
      {
        name: 'Business',
        price: '$99/mo',
        daily_limit: '150,000 requests/day',
        description: 'Enterprise-grade usage'
      },
      {
        name: 'Pay-go',
        price: '$0.002/request',
        daily_limit: 'unlimited',
        description: 'Pay only for what you use'
      }
    ];
  }
}