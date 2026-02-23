const { WebSocket } = require('ws');
const http = require('http');

async function trigger() {
  try {
    const json = await new Promise((resolve, reject) => {
      http.get('http://localhost:9333/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
        res.on('error', reject);
      });
    });

    const wsUrl = json[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(async () => {
            try {
              console.log('[AGENT] Manual trigger starting...');
              const PN = window.Capacitor.Plugins.PushNotifications;
              if (!PN) return "No PushNotifications plugin found";
              
              let perm = await PN.checkPermissions();
              console.log('[AGENT] Native perm status:', perm.receive);
              
              if (perm.receive === 'prompt') {
                 console.log('[AGENT] Requesting perms...');
                 perm = await PN.requestPermissions();
                 console.log('[AGENT] Request result:', perm.receive);
              }
              
              if (perm.receive === 'granted') {
                 console.log('[AGENT] Registering...');
                 await PN.register();
                 return "Registration called - check registration event listeners";
              }
              return "Permission not granted: " + perm.receive;
            } catch (e) {
              return "Error: " + e.message;
            }
          })()`,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    });

    ws.on('message', (data) => {
      const r = JSON.parse(data.toString());
      if (r.id === 1) {
        console.log('Result:', r.result?.result?.value);
        ws.close();
        process.exit(0);
      }
    });
  } catch (err) { console.error(err); process.exit(1); }
}
trigger();
