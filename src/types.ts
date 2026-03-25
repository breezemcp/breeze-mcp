export interface ProxyConfig {
  apiKey?: string;
  gatewayUrl: string;
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
  quota_mb: number;
  message: string;
}

export interface UsageResult {
  used_bytes: number;
  used_mb: number;
  quota_bytes: number;
  quota_mb: number;
  remaining_bytes: number;
  remaining_mb: number;
  total_requests: number;
  plan: string;
}

export interface TopupResult {
  message: string;
  current_plan?: string;
  note?: string;
}

export interface PlanInfo {
  name: string;
  price: string;
  quota: string;
  description: string;
}
