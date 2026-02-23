const { WebSocket } = require('ws');
const http = require('http');

async function readLogs() {
  try {
    const json = await new Promise((resolve, reject) => {
      http.get('http://localhost:9333/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
        res.on('error', reject);
      });
    });

    if (!json || json.length === 0) throw new Error('No pages found');
    const wsUrl = json[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('--- LIVE CONSOLE LOGS STARTING (10s) ---');
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description).join(' ');
        console.log('[BROWSER]', text);
      }
    });

    setTimeout(() => { ws.close(); process.exit(0); }, 10000);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
readLogs();
