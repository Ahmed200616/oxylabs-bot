const axios = require('axios');

// 1. THE ARSENAL (Keys are rotated automatically on 403/401)
const SCRAPER_KEYS = [
  'b492c5b9d89a3fed6c78467cb503e9a0', '71af7e1aa3d0b5dae685dcaf2d0a1a2d',
  '917cf3ace1e1927e6c94ffcdadcbe1f7', '1d239d3c205bcb53598eef82c33e48f2', 
  '4b2f348676a0f87593badc3c12b4bba6', 'c6fc97d134ab63bcd1420dd063350f3d', 
  '019167547730d7f9088d1e9b69880647', '6fdae3429589051c49e59230c5903b1b', 
  '22d21e554bc8c21f97561ae784375824', 'a5ee6461f898bbc8e203ea9222781c38', 
  'e0689357652a846cca6f86f32bb23496', 'de246793e290b0f2ef67ada008e61b7a', 
  'b091e902e9b4fe7b70ffa1d502ac8f8a', 'dd11627ba35c316eadc5e2c1cb95baba', 
  'aeec0d8c7598cb07460cd5cc2865a69b'
];

const CONFIG = {
  OFFER_URL: 'https://top-deal.me/a/NkR2OHMOo5hRxK0',
  WEBHOOK: 'https://discord.com/api/webhooks/1466180407790670115/_B0VJ0h6v8rGGv0evpBQJUfchddXCJOWGyKQxffiUydN9gk-tBlQwskfVQhqspaTt-fg',
  TARGET: 1500,
  REFERER: 'https://exclusivematch.netlify.app/' // Locked in 🔒
};

let currentKeyIndex = 0;
let totalHits = 0;

// BRAINS: Enhanced Human Simulation for MyLead Dashboard
const VANGUARD_JS = `
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    Object.defineProperty(navigator, 'webdriver', {get: () => false});

    // 🛡️ MOUSE & SCROLL JITTER
    const humanMove = async () => {
      for(let i=0; i<5; i++) {
        window.scrollBy({ top: Math.random() * 200, behavior: 'smooth' });
        await sleep(Math.random() * 2000 + 1000);
      }
    };

    await humanMove();

    // Find and Click CTA
    const links = Array.from(document.querySelectorAll('a, button'));
    const cta = links.find(l => l.innerText.match(/Enter|Watch|Join|Match|Chat|Continue/i)) || links[0];
    
    if (cta) {
      cta.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      await sleep(1500);
      cta.click(); 
    }

    // High Dwell to ensure tracker fires (60-90s)
    const dwell = Math.floor(Math.random() * 30000) + 60000; 
    const elapsed = Date.now() - start;
    if (dwell > elapsed) await sleep(dwell - elapsed);
  })();
`;

async function fireAgent(id) {
  if (totalHits >= CONFIG.TARGET) {
    console.log("🏁 MISSION COMPLETE: 1,500 HITS.");
    process.exit();
  }
  
  const key = SCRAPER_KEYS[currentKeyIndex];
  const startTime = Date.now();

  try {
    await axios.get('https://api.scraperapi.com/', {
      params: {
        api_key: key,
        url: CONFIG.OFFER_URL,
        render: 'true',
        country_code: 'us',
        premium: 'true',
        keep_headers: 'true', // 🔥 CRITICAL: Forwards the Referer to MyLead
        device_type: Math.random() > 0.5 ? 'desktop' : 'mobile', 
        js_instructions: VANGUARD_JS,
        session_number: Math.floor(Math.random() * 10000000)
      },
      headers: {
        'Referer': CONFIG.REFERER 
      },
      timeout: 180000 
    });

    totalHits++;
    const duration = Math.round((Date.now() - startTime) / 1000);
    await reportToDiscord(id, duration, totalHits);
    
  } catch (e) {
    const status = e.response?.status;
    console.log(`[T${id}] Key Index ${currentKeyIndex} Drop: Status ${status || e.message}`);
    
    if (status === 401 || status === 403 || status === 429) {
      currentKeyIndex = (currentKeyIndex + 1) % SCRAPER_KEYS.length;
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}

async function reportToDiscord(id, time, total) {
  const payload = {
    embeds: [{
      title: "🛡️ TACTICAL VANGUARD: HIT REGISTERED",
      color: 0x2ecc71,
      fields: [
        { name: "Agent", value: `Thread-${id}`, inline: true },
        { name: "Dwell Time", value: `${time}s`, inline: true },
        { name: "Global Progress", value: `${total} / ${CONFIG.TARGET}`, inline: true }
      ],
      timestamp: new Date()
    }]
  };
  await axios.post(CONFIG.WEBHOOK, payload).catch(() => {});
}

async function worker(id) {
  // Staggered launch
  await new Promise(r => setTimeout(r, Math.random() * 60000));
  
  while (totalHits < CONFIG.TARGET) {
    await fireAgent(id);
    // Faster cycle for 4-hour target (wait 15-45s between hits)
    const chillTime = Math.floor(Math.random() * 30000) + 15000; 
    await new Promise(r => setTimeout(r, chillTime));
  }
}

// 🚀 Launching 10 Agents to crush the 1.5k target in 4 hours
for (let i = 1; i <= 10; i++) {
  console.log(`🚀 Launching Agent ${i}...`);
  worker(i);
}
