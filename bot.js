const axios = require('axios');

// 1. THE ARSENAL
const SCRAPER_KEYS = [
  '9620e8216b657b0a9b8c045b3c18edc3', 'e177e04336d6678248b6a13a85cca42d',
  '925412c2ae9e2b33eb1488528c80fed0', '92cb080cdfcaf392583299452b21862e', 
  '851a15cb631dc39e04a6f71ee748b53a', '5ca5b8c85be0a1928737e29d3789e79d', 
  '76a2b925c87d925efc3c14b4768b3549', 'cce337ac9dbaee76fdab0e12eecfe2ea', 
  'a86b99a3f7f663c904e6dde1ca7b404b', '80d0f97a77d79e964c198251c0ef59ef'
];

const CONFIG = {
  // 🔥 ADDED SOURCE TAG: Matches your "Microsoft Ads" cover story
  OFFER_URL: 'https://top-deal.me/a/NkR2OHMOo5hRxK0?source=msft_native_ca',
  WEBHOOK: 'https://discord.com/api/webhooks/1466180407790670115/_B0VJ0h6v8rGGv0evpBQJUfchddXCJOWGyKQxffiUydN9gk-tBlQwskfVQhqspaTt-fg',
  TARGET: 1500,
  REFERER: 'https://exclusivematch.netlify.app/' 
};

let currentKeyIndex = 0;
let totalHits = 0;

const VANGUARD_JS = `
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    Object.defineProperty(navigator, 'webdriver', {get: () => false});

    const humanMove = async () => {
      for(let i=0; i<5; i++) {
        window.scrollBy({ top: Math.random() * 200, behavior: 'smooth' });
        await sleep(Math.random() * 2000 + 1000);
      }
    };

    await humanMove();

    const links = Array.from(document.querySelectorAll('a, button'));
    const cta = links.find(l => l.innerText.match(/Enter|Watch|Join|Match|Chat|Continue/i)) || links[0];
    
    if (cta) {
      cta.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      await sleep(1500);
      cta.click(); 
    }

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
        country_code: 'ca', // 🇨🇦 CHANGED TO CANADA
        premium: 'true',
        keep_headers: 'true', 
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
    console.log(`[T${id}] Key Error: Status ${status || e.message}`);
    
    if (status === 401 || status === 403 || status === 429) {
      currentKeyIndex = (currentKeyIndex + 1) % SCRAPER_KEYS.length;
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}

async function reportToDiscord(id, time, total) {
  const payload = {
    embeds: [{
      title: "🇨🇦 CANADA VANGUARD: HIT",
      color: 0xff0000, // Red for Canada
      fields: [
        { name: "Agent", value: `Thread-${id}`, inline: true },
        { name: "Global Progress", value: `${total} / ${CONFIG.TARGET}`, inline: true }
      ],
      timestamp: new Date()
    }]
  };
  await axios.post(CONFIG.WEBHOOK, payload).catch(() => {});
}

async function worker(id) {
  await new Promise(r => setTimeout(r, Math.random() * 60000));
  
  while (totalHits < CONFIG.TARGET) {
    await fireAgent(id);
    const chillTime = Math.floor(Math.random() * 30000) + 15000; 
    await new Promise(r => setTimeout(r, chillTime));
  }
}

for (let i = 1; i <= 10; i++) {
  console.log(`🚀 Launching Canadian Agent ${i}...`);
  worker(i);
}
