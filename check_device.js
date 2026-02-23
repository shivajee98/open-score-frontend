const { WebSocket } = require('ws');
const http = require('http');

async function checkToken() {
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
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: 'JSON.stringify({fcmToken: localStorage.getItem("fcm_token_temp"), fcmSynced: localStorage.getItem("fcm_token_synced"), platform: localStorage.getItem("fcm_token_platform")})',
          returnByValue: true
        }
      }));
    });

    ws.on('message', (data) => {
      const r = JSON.parse(data.toString());
      console.log('=== DEVICE TOKEN STATUS ===');
      console.log(r.result?.result?.value);
      ws.close();
      process.exit(0);
    });

    ws.on('error', (e) => {
      console.error('WS Error:', e.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkToken();
