# Breeze MCP Usage Examples

## Basic Web Scraping

Fetch a webpage through a US proxy:

```json
{
  "tool": "proxy_fetch",
  "arguments": {
    "url": "https://www.amazon.com/bestsellers",
    "country": "US",
    "format": "markdown"
  }
}
```

## Location-Specific Search

Search Google from a specific country to get localized results:

```json
{
  "tool": "proxy_search",
  "arguments": {
    "query": "best pizza near me",
    "country": "IT",
    "num_results": 10
  }
}
```

## Regional Targeting

Get content from a specific region within a country:

```json
{
  "tool": "proxy_fetch",
  "arguments": {
    "url": "https://www.craigslist.org",
    "country": "US",
    "region": "california",
    "format": "text"
  }
}
```

## Batch Processing

Scrape multiple competitor websites with different IPs:

```json
{
  "tool": "proxy_batch",
  "arguments": {
    "urls": [
      "https://competitor1.com/pricing",
      "https://competitor2.com/pricing", 
      "https://competitor3.com/pricing"
    ],
    "country": "US"
  }
}
```

## Geo Verification

Check what IP address your proxy resolves to:

```json
{
  "tool": "proxy_geocheck",
  "arguments": {
    "country": "JP"
  }
}
```

This will return something like:
```json
{
  "ip": "203.168.45.123",
  "country": "Japan",
  "region": "Tokyo",
  "city": "Tokyo"
}
```

## Common Use Cases

### E-commerce Price Monitoring
Monitor prices across different regions:

```json
{
  "tool": "proxy_fetch",
  "arguments": {
    "url": "https://store.example.com/product/123",
    "country": "UK"
  }
}
```

### SEO Research
Check search rankings in different countries:

```json
{
  "tool": "proxy_search", 
  "arguments": {
    "query": "best coffee shops",
    "country": "AU",
    "num_results": 20
  }
}
```

### Content Localization Testing
Verify how your website appears in different regions:

```json
{
  "tool": "proxy_fetch",
  "arguments": {
    "url": "https://yoursite.com",
    "country": "DE",
    "region": "berlin"
  }
}
```

### Market Research
Gather data from region-specific websites:

```json
{
  "tool": "proxy_batch",
  "arguments": {
    "urls": [
      "https://local-marketplace1.com",
      "https://local-marketplace2.com"
    ],
    "country": "FR"
  }
}
```