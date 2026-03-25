# Breeze MCP

> Breeze through the web — the internet access layer for AI agents.

AI agents need to access the web but get blocked by anti-bot systems, rate limits, and geo-restrictions. Breeze routes requests through residential IPs in **248 countries**.

No captchas. No blocks. Just data.

## Quick Start

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "breeze-mcp": {
      "command": "npx",
      "args": ["-y", "breeze-mcp"]
    }
  }
}
```

Restart Claude Desktop. That's it — **10MB free bandwidth, no signup required.**

Want more? Run `breeze_signup` in Claude to get **50MB free**.

## Setup with API Key

After running `breeze_signup`, add your key to the config:

```json
{
  "mcpServers": {
    "breeze-mcp": {
      "command": "npx",
      "args": ["-y", "breeze-mcp"],
      "env": {
        "BREEZE_API_KEY": "bz_your_api_key"
      }
    }
  }
}
```

## Cursor / Windsurf

Same config format. Add to your MCP settings:

```json
{
  "mcpServers": {
    "breeze-mcp": {
      "command": "npx",
      "args": ["-y", "breeze-mcp"],
      "env": {
        "BREEZE_API_KEY": "bz_your_api_key"
      }
    }
  }
}
```

## Tools

### `breeze_fetch`
Fetch any URL through residential IPs. Returns clean content.

```
"Fetch https://example.com using a US IP"
"Get the content of this page from Japan"
```

Parameters:
- `url` (required) — URL to fetch
- `country` — 2-letter country code (US, JP, DE, etc.)
- `region` — State/city for precise targeting
- `format` — `markdown` (default), `text`, or `raw`

### `breeze_search`
Search Google without captchas or blocks.

```
"Search Google for 'best AI tools 2026' from the US"
```

Parameters:
- `query` (required) — Search query
- `country` — Country for localized results
- `num_results` — Number of results (default: 5)

### `breeze_batch`
Fetch multiple URLs at once, each with a different IP.

```
"Fetch these 5 competitor pages and compare their pricing"
```

Parameters:
- `urls` (required) — Array of URLs
- `country` — Country for all requests

### `breeze_geocheck`
Verify the IP address and location for a country.

```
"Check what IP I get from Germany"
```

### `breeze_signup`
Create a free account for 50MB bandwidth (vs 10MB anonymous).

```
"Sign me up for Breeze"
"Create a Breeze account with my email hello@example.com"
```

### `breeze_usage`
Check your remaining bandwidth and usage stats.

```
"How much Breeze bandwidth do I have left?"
```

### `breeze_plans`
View available plans and pricing.

## Quota

| Tier | Bandwidth | Requirement |
|------|-----------|-------------|
| Anonymous | 10 MB | None — just use it |
| Free | 50 MB | Run `breeze_signup` |
| Paid | Coming soon | Open beta |

Bandwidth is measured by response size. A typical webpage is 50-200 KB, so 10 MB ≈ 50-200 pages.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BREEZE_API_KEY` | Your API key from `breeze_signup` | None (anonymous mode) |
| `BREEZE_GATEWAY_URL` | Custom gateway URL | `https://api.breezemcp.xyz/v1` |

## How It Works

```
Your AI → Breeze MCP → Breeze Gateway → Residential IP → Target Website
```

All requests are routed through real residential IPs. Your AI sees the web exactly as a human user would from that location.

## Links

- Website: [breezemcp.xyz](https://breezemcp.xyz)
- GitHub: [github.com/breezemcp](https://github.com/breezemcp)
- npm: [npmjs.com/package/breeze-mcp](https://www.npmjs.com/package/breeze-mcp)

## License

MIT
