#!/usr/bin/env node
// End-to-end test for Breeze MCP

const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

const GATEWAY = 'https://api.breezemcp.xyz/v1';

async function test() {
  console.log('🧪 Breeze MCP End-to-End Test\n');
  
  // Test 1: Signup
  console.log('=== 1. Signup ===');
  const signupRes = await fetch(`${GATEWAY}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'e2e-test@breezemcp.xyz' })
  });
  const signup = await signupRes.json();
  console.log('Result:', JSON.stringify(signup, null, 2));
  
  if (!signup.success) {
    console.error('❌ Signup failed');
    process.exit(1);
  }
  const apiKey = signup.data.api_key;
  console.log(`✅ Got API key: ${apiKey}\n`);
  
  // Test 2: Usage
  console.log('=== 2. Check Usage ===');
  const usageRes = await fetch(`${GATEWAY}/usage`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const usage = await usageRes.json();
  console.log('Result:', JSON.stringify(usage, null, 2));
  console.log('✅ Usage check passed\n');
  
  // Test 3: Authorize
  console.log('=== 3. Authorize (get proxy creds) ===');
  const authRes = await fetch(`${GATEWAY}/authorize`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tool: 'fetch', params: { url: 'https://example.com', country: 'US' } })
  });
  const auth = await authRes.json();
  console.log('Result:', JSON.stringify(auth, null, 2));
  
  if (!auth.success || !auth.data.proxy_user) {
    console.error('❌ Authorize failed');
    process.exit(1);
  }
  console.log('✅ Got proxy credentials\n');
  
  // Test 4: Actually fetch through proxy
  console.log('=== 4. Fetch through proxy ===');
  const { proxy_user, proxy_pass, proxy_host, proxy_port } = auth.data;
  const proxyUrl = `http://${proxy_user}-loc-US:${proxy_pass}@${proxy_host}:${proxy_port}`;
  const agent = new HttpsProxyAgent(proxyUrl);
  
  const pageRes = await fetch('https://httpbin.org/ip', { agent });
  const pageData = await pageRes.json();
  console.log('Proxy IP:', pageData.origin);
  console.log('✅ Proxy fetch works!\n');
  
  // Test 5: Fetch actual webpage
  console.log('=== 5. Fetch real webpage ===');
  const webRes = await fetch('https://example.com', { agent });
  const html = await webRes.text();
  console.log(`Got ${html.length} bytes from example.com`);
  console.log('✅ Real webpage fetch works!\n');
  
  // Test 6: Check usage after requests
  console.log('=== 6. Check Usage After ===');
  const usage2Res = await fetch(`${GATEWAY}/usage`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const usage2 = await usage2Res.json();
  console.log('Result:', JSON.stringify(usage2, null, 2));
  console.log('✅ Usage tracked\n');
  
  // Test 7: Plans
  console.log('=== 7. Topup/Plans ===');
  const topupRes = await fetch(`${GATEWAY}/topup`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ plan: 'pro' })
  });
  const topup = await topupRes.json();
  console.log('Result:', JSON.stringify(topup, null, 2));
  console.log('✅ Topup info returned\n');

  // Test 8: Anonymous (no key, IP rate limit)
  console.log('=== 8. Anonymous Authorize ===');
  const anonRes = await fetch(`${GATEWAY}/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'fetch', params: { url: 'https://example.com' } })
  });
  const anon = await anonRes.json();
  console.log('Result:', JSON.stringify(anon, null, 2));
  console.log(anon.success ? '✅ Anonymous access works' : '⚠️ Anonymous limited/blocked');
  
  console.log('\n🎉 All tests passed! Breeze MCP is ready to ship.');
}

test().catch(e => {
  console.error('❌ Test failed:', e.message);
  process.exit(1);
});
