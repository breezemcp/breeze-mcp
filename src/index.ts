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
            name: 'breeze_fetch',
            description: 'Fetch any URL through residential IPs in 248 countries. Works immediately with no API key — 10MB free bandwidth included. Bypasses anti-bot, rate limits, and geo-restrictions. Returns markdown, text, or raw HTML.',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to fetch',
                },
                country: {
                  type: 'string',
                  description: 'Country code (e.g., US, UK, JP) - routes request through residential IP in that country',
                },
                region: {
                  type: 'string',
                  description: 'Region/state (e.g., california, london, tokyo) - for more precise geo-targeting',
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
            name: 'breeze_search',
            description: 'Search Google through residential IPs — no captchas, no blocks. Works immediately without signup. Get localized results from any country.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                country: {
                  type: 'string',
                  description: 'Country code - affects search results localization',
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
            name: 'breeze_batch',
            description: 'Batch fetch multiple URLs, each through a different residential IP. Works without signup. Great for research and comparison tasks.',
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
                  description: 'Country code (all URLs will use IPs from this country)',
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
            name: 'breeze_geocheck',
            description: 'Verify the IP address and location of Breeze IP for a specific country. Useful for confirming geo-targeting is working correctly.',
            inputSchema: {
              type: 'object',
              properties: {
                country: {
                  type: 'string',
                  description: 'Country code to verify IP location for',
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
            name: 'breeze_screenshot',
            description: 'Take high-quality screenshots of web pages through Breeze IPs. Captures pages as they appear from different geographic locations.',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to screenshot',
                },
                country: {
                  type: 'string',
                  description: 'Country code',
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
            name: 'breeze_session',
            description: 'Create a sticky session with Breeze IP. Session maintains the same IP address across multiple requests for consistent browsing behavior.',
            inputSchema: {
              type: 'object',
              properties: {
                country: {
                  type: 'string',
                  description: 'Country code',
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
            description: 'Optional: create a free account for 50MB quota (vs 10MB anonymous). Only needed if you run out of free bandwidth. No credit card required.',
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
            description: 'Check your remaining bandwidth quota and usage stats.',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'breeze_topup',
            description: 'Upgrade your quota. Paid plans coming soon during open beta.',
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
          case 'breeze_fetch': {
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

          case 'breeze_search': {
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

          case 'breeze_batch': {
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

          case 'breeze_geocheck': {
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

          case 'breeze_screenshot': {
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

          case 'breeze_session': {
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
                  text: `Success! Your API key: ${result.api_key}\n\nQuota: ${result.quota_mb || 50}MB free bandwidth\n\n${result.message}\n\nAdd BREEZE_API_KEY=${result.api_key} to your environment.`,
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
                  text: `Breeze Usage:\n\n• Plan: ${result.plan}\n• Used: ${result.used_mb || 0}MB / ${result.quota_mb || 50}MB\n• Remaining: ${result.remaining_mb || 50}MB\n• Requests: ${result.total_requests || 0}\n\n${(result.remaining_mb || 50) <= 0 ? 'Quota exhausted! Upgrade at breezemcp.xyz' : 'Looking good! 🚀'}`,
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
            
            let message = result.message || 'Paid plans coming soon during open beta.';
            if (result.note) {
              message += `\n\n${result.note}`;
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
              message += `   • ${plan.quota}\n`;
              message += `   • ${plan.description}\n\n`;
            });
            
            message += '🎉 Breeze is currently in open beta. Enjoy free access!';
            
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
// Auto-run when executed directly
{
  const server = new BreezeMCPServer();
  server.run().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}