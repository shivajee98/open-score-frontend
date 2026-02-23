const { WebSocket } = require('ws');
const PAGE_ID = process.argv[2];
if (!PAGE_ID) { console.error('Missing PAGE_ID'); process.exit(1); }
const ws = new WebSocket(`ws://localhost:9333/devtools/page/${PAGE_ID}`);

const steps = [
    // Step 1: Request OTP
    {
        id: 1,
        label: 'Request OTP',
        expr: `(async () => {
      const resp = await fetch('https://api.msmeloan.sbs/api/auth/otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({mobile_number: '9430083275'})
      });
      return JSON.stringify(await resp.json());
    })()`
    },
    // Step 2: Verify OTP and login
    {
        id: 2,
        label: 'Verify OTP & Login',
        exprFn: (prevResult) => {
            const otp = JSON.parse(prevResult).otp_debug;
            return `(async () => {
        const resp = await fetch('https://api.msmeloan.sbs/api/auth/verify', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({mobile_number: '9430083275', otp: '${otp}'})
        });
        const data = await resp.json();
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('hasSeenOnboarding', 'true');
          window.dispatchEvent(new Event('auth-login'));
          // In local mode, navigation might be different
          window.location.href = '/customer';
        }
        return JSON.stringify({loggedIn: !!data.access_token, token: data.access_token ? 'OK' : 'FAIL'});
      })()`;
        }
    },
    // Step 3: Wait and check if NotificationHandler does its job
    {
        id: 3,
        label: 'Wait & Check Token Sync (15s)',
        delay: 15000,
        expr: `JSON.stringify({
      fcmToken: localStorage.getItem("fcm_token_temp"),
      fcmSynced: localStorage.getItem("fcm_token_synced"),
      fcmPlatform: localStorage.getItem("fcm_token_platform"),
      currentURL: window.location.href
    })`
    }
];

let stepIdx = 0;
let prevResult = null;

function runStep() {
    const step = steps[stepIdx];
    console.log(`\n=== ${step.label} ===`);

    const expr = step.exprFn ? step.exprFn(prevResult) : step.expr;
    const awaitPromise = expr.includes('async');

    const doSend = () => {
        ws.send(JSON.stringify({
            id: step.id,
            method: 'Runtime.evaluate',
            params: { expression: expr, returnByValue: true, awaitPromise }
        }));
    };

    if (step.delay) {
        console.log(`Waiting ${step.delay / 1000}s...`);
        setTimeout(doSend, step.delay);
    } else {
        doSend();
    }
}

ws.on('open', () => runStep());

ws.on('message', (data) => {
    const r = JSON.parse(data.toString());
    const val = r.result?.result?.value;
    if (val) {
        try {
            const parsed = JSON.parse(val);
            console.log(JSON.stringify(parsed, null, 2));
            prevResult = val;
        } catch {
            console.log(val);
            prevResult = val;
        }
    } else {
        console.log('Error/Empty result:', JSON.stringify(r.result, null, 2));
    }

    stepIdx++;
    if (stepIdx < steps.length) {
        runStep();
    } else {
        ws.close();
        process.exit(0);
    }
});

ws.on('error', (e) => { console.error('WS Error:', e.message); process.exit(1); });
setTimeout(() => { console.error('Global timeout'); process.exit(1); }, 45000);
