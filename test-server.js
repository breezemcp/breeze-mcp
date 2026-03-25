#!/usr/bin/env node

// Simple test to verify the server can start in free tier mode (no credentials)
// This tests the free tier functionality

const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, 'dist', 'index.js');

console.log('Testing Breeze MCP server startup (free tier mode)...');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send a list_tools request to test the server
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(request) + '\n');

let output = '';
server.stdout.on('data', (data) => {
  output += data.toString();
  
  try {
    const response = JSON.parse(output.trim());
    if (response.result && response.result.tools) {
      console.log('✅ Breeze MCP server started successfully!');
      console.log(`Found ${response.result.tools.length} tools:`);
      response.result.tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description.slice(0, 80)}...`);
      });
      console.log('\n🎉 Server is ready! You can now use Breeze with your AI assistant.');
      console.log('💡 Tip: Set BREEZE_API_KEY for unlimited usage. Get one at https://breezemcp.io');
      server.kill();
      process.exit(0);
    }
  } catch (e) {
    // Not complete JSON yet
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Server failed to start');
    process.exit(1);
  }
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Server test timed out');
  server.kill();
  process.exit(1);
}, 5000);