#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { getConfig } from './config.js';
import { BreezeTools } from './tools.js';

class BreezeMCPServer {
  private server: Server;
  private tools: BreezeTools;

  constructor() {
    this.server = new Server(
      {
        name: 'breeze-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize tools with config
    const config = getConfig();
    this.tools = new BreezeTools(config);

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'proxy_fetch',
            description: 'Fetch any URL through Breeze residential proxies from 248 countries. Bypasses anti-bot protection, rate limits, and geo-restrictions. Returns clean content in markdown, text, or raw HTML format.',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to fetch',
                },
                country: {
                  type: 'string',
                  description: 'Country code for proxy location (e.g., US, UK, JP) - routes request through residential IP in that country',
                },
                region: {
                  type: 'string',
                  description: 'Region/state for proxy location (e.g., california, london, tokyo) - for more precise geo-targeting',
                },
                format: {
                  type: 'string',
                  enum: ['markdown', 'text', 'raw'],
                  description: 'Output format (default: markdown)',
                  default: 'markdown',
                },
                session_id: {
                  type: 'string',
                  description: 'Optional session ID for sticky sessions (maintains same IP across requests)',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'proxy_search',
            description: 'Search Google through Breeze residential proxies to avoid captchas and get localized results. Ideal for market research, SEO analysis, and accessing geo-restricted search results.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                country: {
                  type: 'string',
                  description: 'Country code for proxy location - affects search results localization',
                },
                num_results: {
                  type: 'number',
                  description: 'Number of results to return (default: 5)',
                  default: 5,
                  minimum: 1,
                  maximum: 20,
                },
                session_id: {
                  type: 'string',
                  description: 'Optional session ID for sticky sessions',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'proxy_batch',
            description: 'Batch fetch multiple URLs through different Breeze residential IPs. Each URL gets a different IP address for maximum anonymity and parallel processing.',
            inputSchema: {
              type: 'object',
              properties: {
                urls: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of URLs to fetch',
                },
                country: {
                  type: 'string',
                  description: 'Country code for proxy location (all URLs will use IPs from this country)',
                },
                session_id: {
                  type: 'string',
                  description: 'Optional session ID for sticky sessions',
                },
              },
              required: ['urls'],
            },
          },
          {
            name: 'proxy_geocheck',
            description: 'Verify the IP address and location of Breeze residential proxy for a specific country. Useful for confirming geo-targeting is working correctly.',
            inputSchema: {
              type: 'object',
              properties: {
                country: {
                  type: 'string',
                  description: 'Country code to check proxy location for',
                },
                session_id: {
                  type: 'string',
                  description: 'Optional session ID for sticky sessions',
                },
              },
              required: ['country'],
            },
          },
          {
            name: 'proxy_screenshot',
            description: 'Take high-quality screenshots of web pages through Breeze residential proxies. Captures pages as they appear from different geographic locations.',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to screenshot',
                },
                country: {
                  type: 'string',
                  description: 'Country code for proxy location',
                },
                session_id: {
                  type: 'string',
                  description: 'Optional session ID for sticky sessions',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'proxy_session',
            description: 'Create a sticky session with Breeze residential proxy. Session maintains the same IP address across multiple requests for consistent browsing behavior.',
            inputSchema: {
              type: 'object',
              properties: {
                country: {
                  type: 'string',
                  description: 'Country code for proxy location',
                },
                duration_minutes: {
                  type: 'number',
                  description: 'Session duration in minutes (default: 10, max: 60)',
                  default: 10,
                  minimum: 1,
                  maximum: 60,
                },
                region: {
                  type: 'string',
                  description: 'Optional region/state for more precise targeting',
                },
              },
              required: ['country'],
            },
          },
          {
            name: 'breeze_signup',
            description: 'Create a free Breeze account. Get 100 requests/day. Optionally provide email to recover your key later.',
            inputSchema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  description: 'Optional email address for account recovery',
                },
              },
              required: [],
            },
          },
          {
            name: 'breeze_usage',
            description: 'Check your Breeze account usage and remaining daily quota.',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'breeze_topup',
            description: 'Get a payment link or crypto address to upgrade your Breeze plan.',
            inputSchema: {
              type: 'object',
              properties: {
                plan: {
                  type: 'string',
                  enum: ['starter', 'pro', 'business', 'paygo'],
                  description: 'Plan to upgrade to',
                },
                amount: {
                  type: 'number',
                  description: 'Amount in USD for pay-go plan',
                  minimum: 1,
                },
              },
              required: [],
            },
          },
          {
            name: 'breeze_plans',
            description: 'View available Breeze plans and pricing.',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'proxy_fetch': {
            const { url, country, region, format, session_id } = args as {
              url: string;
              country?: string;
              region?: string;
              format?: 'markdown' | 'text' | 'raw';
              session_id?: string;
            };
            
            const content = await this.tools.proxyFetch(url, country, region, format, session_id);
            
            return {
              content: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            };
          }

          case 'proxy_search': {
            const { query, country, num_results, session_id } = args as {
              query: string;
              country?: string;
              num_results?: number;
              session_id?: string;
            };
            
            const results = await this.tools.proxySearch(query, country, num_results, session_id);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };
          }

          case 'proxy_batch': {
            const { urls, country, session_id } = args as {
              urls: string[];
              country?: string;
              session_id?: string;
            };
            
            const results = await this.tools.proxyBatch(urls, country, session_id);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };
          }

          case 'proxy_geocheck': {
            const { country, session_id } = args as {
              country: string;
              session_id?: string;
            };
            
            const result = await this.tools.proxyGeocheck(country, session_id);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'proxy_screenshot': {
            const { url, country, session_id } = args as {
              url: string;
              country?: string;
              session_id?: string;
            };

            const result = await this.tools.proxyScreenshot(url, country, session_id);
            
            return {
              content: [
                {
                  type: 'text',
                  text: result,
                },
              ],
            };
          }

          case 'proxy_session': {
            const { country, duration_minutes, region } = args as {
              country: string;
              duration_minutes?: number;
              region?: string;
            };
            
            const result = await this.tools.createSession(country, duration_minutes, region);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'breeze_signup': {
            const { email } = args as {
              email?: string;
            };
            
            const result = await this.tools.signup(email);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Success! Your API key: ${result.api_key}\n\nDaily limit: ${result.daily_limit} requests\n\n${result.message}\n\nPlease save your API key securely. Add it to your environment as BREEZE_API_KEY to use authenticated endpoints.`,
                },
              ],
            };
          }

          case 'breeze_usage': {
            const result = await this.tools.usage();
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Account Usage:\n\n• Plan: ${result.plan}\n• Daily used: ${result.daily_used}/${result.daily_limit} requests\n• Total requests: ${result.total_requests}\n• Remaining today: ${result.daily_limit - result.daily_used}\n\n${result.daily_used >= result.daily_limit ? 'Daily limit reached! Upgrade at https://breezemcp.xyz' : 'Looking good! 🚀'}`,
                },
              ],
            };
          }

          case 'breeze_topup': {
            const { plan, amount } = args as {
              plan?: 'starter' | 'pro' | 'business' | 'paygo';
              amount?: number;
            };
            
            const result = await this.tools.topup(plan, amount);
            
            let message = `Upgrade to ${result.plan_details.name}\n\n`;
            message += `Plan: ${result.plan_details.name}\n`;
            message += `Price: ${result.plan_details.price}\n`;
            message += `Daily Limit: ${result.plan_details.daily_limit}\n`;
            message += `Description: ${result.plan_details.description}\n\n`;
            
            if (result.payment_url) {
              message += `💳 Payment Link: ${result.payment_url}\n`;
            }
            
            if (result.crypto_address) {
              message += `₿ Crypto Address (USDC): ${result.crypto_address}\n`;
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: message,
                },
              ],
            };
          }

          case 'breeze_plans': {
            const plans = this.tools.getPlans();
            
            let message = 'Breeze MCP Plans:\n\n';
            
            plans.forEach((plan, index) => {
              message += `${index + 1}. **${plan.name}**: ${plan.price}\n`;
              message += `   • ${plan.daily_limit}\n`;
              message += `   • ${plan.description}\n\n`;
            });
            
            message += 'Ready to upgrade? Use `breeze_topup` with your preferred plan!';
            
            return {
              content: [
                {
                  type: 'text',
                  text: message,
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(ErrorCode.InternalError, errorMessage);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Run the server
if (require.main === module) {
  const server = new BreezeMCPServer();
  server.run().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}