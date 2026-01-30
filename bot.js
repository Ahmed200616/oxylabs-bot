const axios = require('axios');

// 1. OXYLABS ARMORY (Rotating Weapons)
const OXY_ACCOUNTS = [
  { user: 'test1_FPPbW', pass: 'pTlx3cwVLzh70s~X' },
  { user: 'testing_69XVH', pass: 'a15QveMGT3yt~A' },
  { user: 'zaina_lk87V', pass: 'i4CRdM_KPR~c' }
];

// MISSION CRITICAL URLS
const OFFER_URL = 'https://top-deal.me/a/NkR2OHMOo5hRxK0'; 
const SPOOF_REFERER = 'https://exclusivematch.netlify.app/'; 
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1466180407790670115/_B0VJ0h6v8rGGv0evpBQJUfchddXCJOWGyKQxffiUydN9gk-tBlQwskfVQhqspaTt-fg';

const MAX_HITS_PER_ACC = 741; 
let currentAccIndex = 0;
let currentAccHits = 0;

// 2. THE FINAL BOSS BEHAVIOR
const STEALTH_JS = Buffer.from(`
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();
    const moveMouseHumanly = async () => {
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * window.innerWidth);
        const y = Math.floor(Math.random() * window.innerHeight);
        document.dispatchEvent(new MouseEvent('mousemove', {view: window, bubbles: true, clientX: x, clientY: y}));
        await sleep(Math.floor(Math.random() * 1000) + 500);
      }
    };
    const actions = [
      async () => { window.scrollBy({top: Math.random()*500+200, behavior:'smooth'}); },
      async () => { await moveMouseHumanly(); },
      async () => { 
          const el = document.querySelectorAll('a, button')[0];
          if(el) el.dispatchEvent(new MouseEvent('mouseover', {bubbles:true}));
      },
      async () => { await sleep(Math.random()*5000+2000); }
    ];
    const sequence = actions.sort(() => Math.random() - 0.5);
    for (const action of sequence) { await action(); await sleep(Math.random()*3000+2000); }
    const links = Array.from(document.querySelectorAll('a, button'));
    const cta = links.find(l => l.innerText.match(/Enter|Watch|Join|Match|Chat/i)) || links[0];
    if (cta) { cta.click(); await sleep(5000); }
    document.title = "BOSS_COMPLETE:" + ((Date.now() - start) / 1000) + "s";
  })();
`).toString('base64');

async function sendOxylabsHit(threadId) {
  if (currentAccIndex >= OXY_ACCOUNTS.length) {
    console.log("🏁 MISSION SUCCESS: ALL 2,223 ELITE HITS EXHAUSTED.");
    process.exit();
  }

  const auth = OXY_ACCOUNTS[currentAccIndex];
  const ua = Math.random() > 0.4 ? 'desktop_chrome' : 'mobile_android';

  const payload = {
    source: 'universal',
    url: OFFER_URL,
    geo_location: 'United States',
    render: 'html',
    user_agent_type: ua,
    js_snippet: STEALTH_JS,
    browser_instructions: [{ command: 'wait', argument: 48000 }] 
  };

  try {
    const res = await axios.post('https://realtime.oxylabs.io/v1/queries', payload, {
      auth: { username: auth.user, password: auth.pass },
      timeout: 240000,
      headers: { 'Referer': SPOOF_REFERER }
    });

    currentAccHits++;
    const success = JSON.stringify(res.data).includes("BOSS_COMPLETE");
    await sendDiscordReport(threadId, auth.user, success, currentAccHits, ua);
    
    if (currentAccHits >= MAX_HITS_PER_ACC) {
      currentAccIndex++;
      currentAccHits = 0;
    }
  } catch (e) { console.log(`[T${threadId}] API Drop: ${e.message}`); }
}

async function sendDiscordReport(threadId, user, success, count, ua) {
  const payload = {
    embeds: [{
      title: success ? "🛡️ FINAL BOSS SHIELD ACTIVE" : "⚠️ SHIELD BREACHED",
      color: success ? 0x00ff00 : 0xff0000,
      fields: [
        { name: "Agent", value: `Thread ${threadId}`, inline: true },
        { name: "Device", value: ua, inline: true },
        { name: "Ammo Left", value: `${count} / ${MAX_HITS_PER_ACC}`, inline: true }
      ],
      footer: { text: "Eduvos Fee Mission | Oxylabs Resi" },
      timestamp: new Date()
    }]
  };
  await axios.post(DISCORD_WEBHOOK_URL, payload).catch(() => {});
}

async function worker(id) {
  while (currentAccIndex < OXY_ACCOUNTS.length) {
    const hour = new Date().getUTCHours(); 
    let waitMultiplier = 1;

    // NIGHT MODE: 11 PM to 5 AM UTC (Matches SAST late night/early morning)
    if (hour >= 23 || hour <= 5) {
      waitMultiplier = 3; 
    }

    await sendOxylabsHit(id);
    const baseWait = Math.floor(Math.random() * 150000) + 90000;
    const finalWait = baseWait * waitMultiplier;
    await new Promise(r => setTimeout(r, finalWait));
  }
}

// Start 3 threads for the Blitz
for (let i = 1; i <= 3; i++) worker(i);
