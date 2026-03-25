# Breeze MCP - Account Management Update

## New Features Added

### Account Management Tools

4 new tools have been added for account management:

#### `breeze_signup`
- Create a free Breeze account
- Get 100 requests/day
- Optional email for account recovery
- **Parameters**: `email` (optional string)

#### `breeze_usage`
- Check your account usage and remaining quota
- **Parameters**: none (uses API key from environment)

#### `breeze_topup`
- Get payment links or crypto addresses for plan upgrades
- **Parameters**: `plan` (optional: starter/pro/business/paygo), `amount` (optional number for paygo)

#### `breeze_plans`
- View all available plans and pricing
- **Parameters**: none

### Usage

1. **Get a free account**:
   ```json
   {
     "tool": "breeze_signup",
     "arguments": {
       "email": "your@email.com"
     }
   }
   ```

2. **Set your API key**:
   ```bash
   export BREEZE_API_KEY="bz_your_generated_key"
   ```

3. **Check usage**:
   ```json
   {
     "tool": "breeze_usage",
     "arguments": {}
   }
   ```

4. **Upgrade plan**:
   ```json
   {
     "tool": "breeze_topup",
     "arguments": {
       "plan": "starter"
     }
   }
   ```

### Configuration

The MCP server now requires a gateway URL for account management features:

```bash
export BREEZE_GATEWAY_URL="https://your-worker.your-subdomain.workers.dev"
```

Account management tools will only work in gateway mode, not direct proxy mode.