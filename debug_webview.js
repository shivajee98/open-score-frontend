const { WebSocket } = require('ws');
const PAGE_ID = process.argv[2] || '632DA4E793FCD60D64CC28ED5664F748';
const ws = new WebSocket(`ws://localhost:9333/devtools/page/${PAGE_ID}`);

ws.on('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(async () => {
        try {
          // Test 1: Basic Capacitor bridge test
          const cap = window.Capacitor;
          const bridgeTest = {
            exists: !!cap,
            isNative: cap?.isNativePlatform?.(),
            platform: cap?.getPlatform?.(),
            pluginList: Object.keys(cap?.Plugins || {}),
            bridgeReady: typeof cap?.bridge !== 'undefined',
            nativeBridge: typeof cap?.nativeBridge !== 'undefined',
          };
          
          // Test 2: Try a simple plugin call (Preferences.get is simple and reliable)
          try {
            const Prefs = cap.Plugins.Preferences;
            await Prefs.set({ key: 'test_push_debug', value: 'hello' });
            const result = await Prefs.get({ key: 'test_push_debug' });
            bridgeTest.preferencesWork = result.value === 'hello';
          } catch (e) {
            bridgeTest.preferencesError = e.message;
          }

          // Test 3: Try PushNotifications.checkPermissions (doesn't trigger registration)
          try {
            const PN = cap.Plugins.PushNotifications;
            const perm = await PN.checkPermissions();
            bridgeTest.pushPermission = perm.receive;
            bridgeTest.pushPluginWorks = true;
          } catch (e) {
            bridgeTest.pushPluginError = e.message;
          }
          
          // Test 4: Try calling register directly via the native bridge
          try {
            const registerResult = await cap.Plugins.PushNotifications.register();
            bridgeTest.registerCallResult = JSON.stringify(registerResult);
          } catch (e) {
            bridgeTest.registerCallError = e.message;
          }
          
          return JSON.stringify(bridgeTest);
        } catch (e) {
          return JSON.stringify({exception: e.message, stack: e.stack});
        }
      })()`,
      returnByValue: true,
      awaitPromise: true
    }
  }));
});

ws.on('message', (data) => {
  const r = JSON.parse(data.toString());
  const val = r.result?.result?.value;
  console.log('=== CAPACITOR BRIDGE DIAGNOSTICS ===');
  if (val) {
    try { console.log(JSON.stringify(JSON.parse(val), null, 2)); }
    catch { console.log(val); }
  } else {
    console.log(JSON.stringify(r.result?.result, null, 2));
  }
  ws.close();
  process.exit(0);
});

ws.on('error', (e) => { console.error('WS Error:', e.message); process.exit(1); });
setTimeout(() => { console.error('Timeout'); process.exit(1); }, 10000);
