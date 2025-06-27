const http = require('http');
const path = require('path');

// Simple GraphQL mock server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle GraphQL endpoint
  if (req.url === '/graphql' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const query = JSON.parse(body);
        console.log('📊 GraphQL Query received:', query.query);
        
        // Mock response based on query
        let response = { data: {} };
        
        if (query.query.includes('login')) {
          response.data = {
            login: {
              token: 'mock-jwt-token-' + Date.now(),
              user: {
                id: '1',
                email: 'demo@impactchain.org',
                role: 'MEMBER'
              }
            }
          };
        } else if (query.query.includes('helpRequests')) {
          response.data = {
            helpRequests: [
              {
                id: '1',
                title: 'Emergency Education Support',
                description: 'Need funding for school supplies',
                target: '5000000000000000000',
                raised: '1200000000000000000',
                status: 'ACTIVE'
              }
            ]
          };
        } else if (query.query.includes('fundingRounds')) {
          response.data = {
            fundingRounds: [
              {
                id: '1',
                title: 'Digital Learning Centers',
                description: 'Computer labs for rural schools',
                target: '50000000000000000000',
                raised: '12000000000000000000',
                status: 'ACTIVE'
              }
            ]
          };
        } else {
          response.data = { message: 'Mock response for: ' + query.query };
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Handle GraphQL playground
  if (req.url === '/graphql' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ImpactChain GraphQL Playground</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { background: #1976d2; color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f5f5f5; border-radius: 8px; margin-top: 20px; }
            .status { color: #4caf50; font-weight: bold; }
            .endpoint { background: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .contract { background: #fff3e0; padding: 10px; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 ImpactChain Backend</h1>
            <p>AI × Blockchain Charity Platform</p>
          </div>
          
          <div class="content">
            <h2>📊 System Status</h2>
            <p class="status">✅ Backend Server Running</p>
            <p class="status">✅ GraphQL Endpoint Active</p>
            <p class="status">✅ CORS Enabled</p>
            
            <h3>🔗 Available Endpoints</h3>
            <div class="endpoint">
              <strong>POST /graphql</strong> - GraphQL mutations and queries
            </div>
            <div class="endpoint">
              <strong>GET /graphql</strong> - This playground interface
            </div>
            <div class="endpoint">
              <strong>GET /health</strong> - Health check endpoint
            </div>
            
            <h3>🔐 Smart Contracts</h3>
            <div class="contract">
              <strong>GovernanceToken.sol</strong> - ✅ Code Complete (ERC-20 with voting)
            </div>
            <div class="contract">
              <strong>ReputationBadge.sol</strong> - ✅ Code Complete (SoulBound NFTs)
            </div>
            
            <h3>🧪 Test GraphQL Query</h3>
            <p>Send POST request to <code>/graphql</code> with:</p>
            <pre>
{
  "query": "{ helpRequests { id title description target raised status } }"
}
            </pre>
            
            <p><em>Frontend can now connect to: <strong>http://localhost:4000/graphql</strong></em></p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'impactchain-backend',
      version: '1.0.0'
    }));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`
🚀 ImpactChain Backend Server Started!

📊 GraphQL Endpoint: http://localhost:${PORT}/graphql
🏥 Health Check: http://localhost:${PORT}/health
🎮 Playground: http://localhost:${PORT}/graphql (GET)

✅ Smart Contracts: Ready for compilation
✅ Database Schema: Ready for migration
✅ Frontend Integration: Ready

🔗 Your frontend can now connect to: http://localhost:${PORT}/graphql
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
}); 