import { spawn } from 'child_process';
import http from 'http';

// Start the server
const server = spawn('npx', ['tsx', 'api/server.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env,
});

// Wait for server to start, then test
setTimeout(() => {
  http.get('http://localhost:3002/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('HEALTH CHECK RESULT:', data);
      server.kill();
      process.exit(0);
    });
  }).on('error', (e) => {
    console.log('HEALTH CHECK ERROR:', e.message);
    server.kill();
    process.exit(1);
  });
}, 3000);

// Timeout after 10 seconds
setTimeout(() => {
  console.log('TIMEOUT - server did not respond');
  server.kill();
  process.exit(1);
}, 10000);
