import { NodeHtmlMarkdown } from 'node-html-markdown';
import * as cheerio from 'cheerio';
import { BreezeGateway } from './gateway.js';
import { ProxyConfig, ProxyOptions, SearchResult, BatchResult, GeoCheckResult, SessionResult, SignupResult, UsageResult, TopupResult, PlanInfo } from './types.js';

export class BreezeTools {
  private gateway: BreezeGateway;
  private config: ProxyConfig;
  private htmlToMarkdown: NodeHtmlMarkdown;

  constructor(config: ProxyConfig) {
    this.config = config;
    this.htmlToMarkdown = new NodeHtmlMarkdown();
    this.gateway = new BreezeGateway(config);
  }

  async proxyFetch(
    url: string, 
    country?: string, 
    region?: string, 
    format: 'markdown' | 'text' | 'raw' = 'markdown',
    sessionId?: string
  ): Promise<string> {
    try {
      const result = await this.gateway.gatewayFetch({
        url,
        country,
        region,
        format
      });
      // Extract HTML from relay response and format locally
      if (result && result.body) {
        return this.formatContent(result.body, format);
      }
      return result;
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
      // For search, we'll fetch Google search page and parse it locally
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${numResults}`;
      const result = await this.gateway.gatewayFetch({
        url: searchUrl,
        country
      });
      if (result && result.body) {
        return this.parseGoogleResults(result.body, numResults);
      }
      return [];
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
      // For batch, process URLs sequentially using gateway
      const results: BatchResult[] = [];
      
      for (const url of urls) {
        try {
          const content = await this.proxyFetch(url, country, undefined, 'markdown');
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
    } catch (error) {
      throw new Error(`Batch fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async proxyGeocheck(country: string, sessionId?: string): Promise<GeoCheckResult> {
    try {
      const result = await this.gateway.gatewayGeocheck({
        country
      });
      return result;
    } catch (error) {
      throw new Error(`Geocheck failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async proxyScreenshot(url: string, country?: string, sessionId?: string): Promise<string> {
    try {
      return await this.gateway.screenshot({
        url,
        country,
        session_id: sessionId
      });
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
      return await this.gateway.createSession({
        country,
        duration_minutes: durationMinutes,
        region
      });
    } catch (error) {
      throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async signup(email?: string): Promise<SignupResult> {
    try {
      return await this.gateway.signup({ email });
    } catch (error) {
      throw new Error(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async usage(): Promise<UsageResult> {
    try {
      return await this.gateway.usage();
    } catch (error) {
      throw new Error(`Usage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async topup(plan?: 'starter' | 'pro' | 'business' | 'paygo', amount?: number): Promise<TopupResult> {
    try {
      return await this.gateway.topup({ plan, amount });
    } catch (error) {
      throw new Error(`Topup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getPlans(): PlanInfo[] {
    return [
      {
        name: 'Anonymous',
        price: 'Free',
        quota: '10MB lifetime',
        description: 'No signup needed. 10MB free bandwidth.'
      },
      {
        name: 'Free',
        price: 'Free',
        quota: '50MB lifetime',
        description: 'Run breeze_signup for 50MB free. No credit card.'
      },
      {
        name: 'Paid plans',
        price: 'Coming soon',
        quota: 'More quota',
        description: 'Currently in open beta. Paid plans with higher limits launching soon.'
      }
    ];
  }
}