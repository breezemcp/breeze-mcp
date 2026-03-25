export interface ProxyConfig {
  mode: 'api' | 'direct' | 'free';
  apiKey?: string;
  gatewayUrl?: string;
  userId?: string;
  password?: string;
  host?: string;
  port?: number;
}

export interface ProxyOptions {
  country?: string;
  region?: string;
  timeout?: number;
  session?: string;
  sessionDuration?: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface BatchResult {
  url: string;
  success: boolean;
  content?: string;
  error?: string;
}

export interface GeoCheckResult {
  ip: string;
  country: string;
  region?: string;
  city?: string;
}

export interface SessionResult {
  sessionId: string;
  country: string;
  region?: string;
  durationMinutes: number;
  expiresAt: string;
}

export interface GatewayResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SignupResult {
  api_key: string;
  daily_limit: number;
  message: string;
}

export interface UsageResult {
  daily_used: number;
  daily_limit: number;
  plan: string;
  total_requests: number;
}

export interface TopupResult {
  payment_url?: string;
  crypto_address?: string;
  plan_details: {
    name: string;
    price: string;
    daily_limit: number;
    description: string;
  };
}

export interface PlanInfo {
  name: string;
  price: string;
  daily_limit: number | string;
  description: string;
}