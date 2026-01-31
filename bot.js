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

// 2. THE FINAL BOSS BEHAVIOR (Plain String - No Base64 to avoid Oxylabs 400 errors)
const STEALTH_JS = `
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();
    
    // Humanly movements: Random Scrolling
    for (let i = 0; i < 4; i++) {
      window.scrollBy({top: Math.random() * 500 + 200, behavior: 'smooth'});
      await sleep(Math.floor(Math.random() * 2000) + 1000);
    }

    // Attempt Click
    const links = Array.from(document.querySelectorAll('a, button'));
    const cta = links.find(l => l.innerText.match(/Enter|Watch|Join|Match|Chat/i)) || links[0];
    
    if (cta) { 
      cta.click(); 
      await sleep(15000); // Wait for the click to process
    }
    
    // Create a physical marker in the HTML for the scraper to detect success
    const marker = document.createElement('div');
    marker.id = 'BOSS_COMPLETE_SIGNAL';
    marker.innerText = 'MISSION_ACCOMPLISHED';
    document.body.appendChild(marker);
  })();
`;

async function sendOxylabsHit(threadId) {
  if (currentAccIndex >= OXY_ACCOUNTS.length) {
    console.log("🏁 MISSION SUCCESS: ALL ELITE HITS EXHAUSTED.");
    process.exit();
  }

  const auth = OXY_ACCOUNTS[currentAccIndex];
  // Oxylabs Realtime API typically prefers 'desktop' or 'mobile' tags
  const uaType = Math.random() > 0.4 ? 'desktop' : 'mobile';

  const payload = {
    source: 'universal',
    url: OFFER_URL,
    geo_location: 'United States',
    render: 'html',
    user_agent_type: uaType,
    js_snippet: STEALTH_JS // Plain string is more stable for Oxylabs Universal
  };

  try {
    const res = await axios.post('https://realtime.oxylabs.io/v1/queries', payload, {
      auth: { username: auth.user, password: auth.pass },
      timeout: 180000, // 3-minute timeout
      headers: { 
        'Content-Type': 'application/json',
        'Referer': SPOOF_REFERER 
      }
    });

    currentAccHits++;
    
    // Check if our marker exists in the returned content
    const responseData = JSON.stringify(res.data);
    const success = responseData.includes("BOSS_COMPLETE_SIGNAL");
    
    await sendDiscordReport(threadId, auth.user, success, currentAccHits, uaType);
    
    if (currentAccHits >= MAX_HITS_PER_ACC) {
      currentAccIndex++;
      currentAccHits = 0;
    }
  } catch (e) {
    const errorMsg = e.response?.data?.message || e.message;
    console.log(`[T${threadId}] API Drop: ${errorMsg}`);
  }
}

async function sendDiscordReport(threadId, user, success, count, ua) {
  const payload = {
    embeds: [{
      title: success ? "🛡️ FINAL BOSS SHIELD ACTIVE" : "⚠️ SHIELD BREACHED",
      color: success ? 0x00ff00 : 0xff0000,
      fields: [
        { name: "Agent", value: `Thread ${threadId}`, inline: true },
        { name: "Account", value: user, inline: true },
        { name: "Device", value: ua, inline: true },
        { name: "Ammo Left", value: `${MAX_HITS_PER_ACC - count} / ${MAX_HITS_PER_ACC}`, inline: true }
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

    // NIGHT MODE: 11 PM to 5 AM UTC
    if (hour >= 23 || hour <= 5) {
      waitMultiplier = 3; 
    }

    await sendOxylabsHit(id);
    
    // Random delay between 90s and 240s
    const baseWait = Math.floor(Math.random() * 150000) + 90000;
    const finalWait = baseWait * waitMultiplier;
    
    console.log(`[T${id}] Waiting ${Math.round(finalWait/1000)}s for next hit...`);
    await new Promise(r => setTimeout(r, finalWait));
  }
}

// Start 3 threads for the Blitz
for (let i = 1; i <= 3; i++) {
  console.log(`🚀 Launching Agent ${i}...`);
  worker(i);
}
