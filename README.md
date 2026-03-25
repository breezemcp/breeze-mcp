# Breeze MCP

The internet access layer for AI agents. Route AI requests through residential IPs in 248 countries.

## Features

- **Residential Proxy Network**: Access the web through real residential IPs
- **Global Coverage**: 248+ countries and regions available
- **Anti-Bot Bypass**: Circumvent captchas, rate limits, and geo-restrictions
- **Multiple Formats**: Get content as markdown, text, or raw HTML
- **Account Management**: Free tier with optional API key for more requests

## Installation

```bash
npm install breeze-mcp
```

## Quick Start

1. **Install the package**:
   ```bash
   npm install breeze-mcp
   ```

2. **Get a free API key** (optional, for more requests):
   ```json
   {
     "tool": "breeze_signup",
     "arguments": {
       "email": "your@email.com"
     }
   }
   ```

3. **Set your API key** (if you got one):
   ```bash
   export BREEZE_API_KEY="bz_your_generated_key"
   ```

4. **Start using the tools**:
   ```json
   {
     "tool": "proxy_fetch",
     "arguments": {
       "url": "https://example.com",
       "country": "US",
       "format": "markdown"
     }
   }
   ```

## Available Tools

### Core Proxy Tools

- **`proxy_fetch`**: Fetch any URL through residential proxies
- **`proxy_search`**: Search Google with geo-targeting
- **`proxy_batch`**: Fetch multiple URLs in parallel
- **`proxy_geocheck`**: Verify proxy location and IP
- **`proxy_screenshot`**: Take screenshots of web pages
- **`proxy_session`**: Create sticky sessions for consistent browsing

### Account Management

- **`breeze_signup`**: Create a free account (100 requests/day)
- **`breeze_usage`**: Check your usage and remaining quota
- **`breeze_topup`**: Get payment links for plan upgrades
- **`breeze_plans`**: View available plans and pricing

## Configuration

You can customize the gateway URL if needed:

```bash
export BREEZE_GATEWAY_URL="https://api.breezemcp.xyz/v1"
```

## Usage Modes

- **Anonymous Mode**: No configuration needed, limited requests
- **API Key Mode**: Sign up for more requests and better rate limits

## Examples

### Fetch a webpage

```json
{
  "tool": "proxy_fetch",
  "arguments": {
    "url": "https://news.ycombinator.com",
    "country": "US",
    "format": "markdown"
  }
}
```

### Search Google from Japan

```json
{
  "tool": "proxy_search",
  "arguments": {
    "query": "best ramen Tokyo",
    "country": "JP",
    "num_results": 10
  }
}
```

### Check account usage

```json
{
  "tool": "breeze_usage",
  "arguments": {}
}
```

## Support

- 🌐 **Website**: [breezemcp.xyz](https://breezemcp.xyz)
- 📧 **Email**: Support available through website
- 🐛 **Issues**: Report on GitHub

## License

MIT License - see LICENSE file for details.