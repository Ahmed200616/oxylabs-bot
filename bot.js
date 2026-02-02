const axios = require('axios');

// 1. THE ARSENAL (15 Keys)
const SCRAPER_KEYS = [
  '0f7d434a15f1ae2a82425af683fa6d4f', '7c60083697b6c3a2a046bacf9c1f6093', 
  '6443802a2dd51f89dba20c54c76b9cf4', '003779484407b609d20f821c3ceff589', 
  '4ae18da16b92d0a68cac43175e745b96', 'f6f28237d77cd406ae4a3ee32e6ee063', 
  '019167547730d7f9088d1e9b69880647', '6fdae3429589051c49e59230c5903b1b', 
  '22d21e554bc8c21f97561ae784375824', 'a5ee6461f898bbc8e203ea9222781c38', 
  'e0689357652a846cca6f86f32bb23496', 'de246793e290b0f2ef67ada008e61b7a', 
  'b091e902e9b4fe7b70ffa1d502ac8f8a', 'dd11627ba35c316eadc5e2c1cb95baba', 
  'aeec0d8c7598cb07460cd5cc2865a69b'
];

const CONFIG = {
  OFFER_URL: 'https://top-deal.me/a/NkR2OHMOo5hRxK0',
  WEBHOOK: 'https://discord.com/api/webhooks/1466180407790670115/_B0VJ0h6v8rGGv0evpBQJUfchddXCJOWGyKQxffiUydN9gk-tBlQwskfVQhqspaTt-fg',
  TARGET: 1500
};

let currentKeyIndex = 0;
let totalHits = 0;

// ELITE STEALTH: Smart Context-Aware Fingerprinting
const VANGUARD_JS = `
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();

    // 1. SMART HARDWARE SPOOFING (Context Aware)
    // Detects if ScraperAPI gave us a Mobile UA or Desktop UA
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    Object.defineProperty(navigator, 'webdriver', {get: () => false});
    
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // 37445 = UNMASKED_VENDOR_WEBGL
      // 37446 = UNMASKED_RENDERER_WEBGL
      if (parameter === 37445) return isMobile ? 'Qualcomm' : 'Intel Inc.'; 
      if (parameter === 37446) return isMobile ? 'Adreno (TM) 640' : 'Intel(R) Iris(R) Xe Graphics'; 
      return getParameter.apply(this, [parameter]);
    };

    // 2. ORGANIC READING PATTERN
    const scrollPattern = async () => {
      const steps = Math.floor(Math.random() * 6) + 6; 
      for (let i = 0; i < steps; i++) {
        // Pauses between 2s and 5s
        const pause = Math.random() > 0.8 ? 5000 : 2000; 
        window.scrollBy({ top: Math.random() * 300 + 100, behavior: 'smooth' });
        await sleep(pause);
        
        // 15% Chance to scroll back up (Re-reading)
        if (Math.random() > 0.85) window.scrollBy({ top: -200, behavior: 'smooth' });
      }
    };
    await scrollPattern();

    // 3. INTERACTION
    const links = Array.from(document.querySelectorAll('a, button'));
    const cta = links.find(l => l.innerText.match(/Enter|Watch|Join|Match|Chat/i)) || links[0];
    if (cta) {
      // Mouseover/Touchstart simulation
      const eventType = isMobile ? 'touchstart' : 'mouseover';
      cta.dispatchEvent(new MouseEvent(eventType, { bubbles: true }));
      await sleep(Math.random() * 2000 + 1000); 
      cta.click(); 
    }

    // 4. DWELL TIME (45s - 80s)
    // Optimized for 6-hour completion
    const dwell = Math.floor(Math.random() * 35000) + 45000; 
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
        // Mix devices, but let JS handle the fingerprint match
        device_type: Math.random() > 0.5 ? 'desktop' : 'mobile', 
        js_instructions: VANGUARD_JS,
        session_number: currentKeyIndex // Sticky sessions
      },
      timeout: 180000 
    });

    totalHits++;
    const duration = Math.round((Date.now() - startTime) / 1000);
    await reportToDiscord(id, duration, totalHits);
    
  } catch (e) {
    console.log(`[T${id}] Key ${currentKeyIndex} Drop: ${e.message}`);
    // If blocked, rotate key immediately
    if (e.response?.status === 403 || e.response?.status === 429) {
      currentKeyIndex = (currentKeyIndex + 1) % SCRAPER_KEYS.length;
    }
    // Safe cool-down logic
    await new Promise(r => setTimeout(r, 45000));
  }
}

async function reportToDiscord(id, time, total) {
  const payload = {
    embeds: [{
      title: "🛡️ TACTICAL VANGUARD: HIT",
      color: 0x9b59b6, // Purple for Elite
      fields: [
        { name: "Agent", value: `Thread-${id}`, inline: true },
        { name: "Dwell Time", value: `${time}s`, inline: true },
        { name: "Progress", value: `${total} / ${CONFIG.TARGET}`, inline: true }
      ],
      footer: { text: "6-Hour Mission | Smart GPU Spoofing Active" },
      timestamp: new Date()
    }]
  };
  await axios.post(CONFIG.WEBHOOK, payload).catch(() => {});
}

async function worker(id) {
  // Stagger start: Agents launch 1 minute apart
  await new Promise(r => setTimeout(r, (id - 1) * 60000));

  while (totalHits < CONFIG.TARGET) {
    await fireAgent(id);
    
    // TACTICAL WAIT: 15s - 45s between hits
    // With 6 agents, this averages ~1 hit every 15 seconds globally
    const chillTime = Math.floor(Math.random() * 30000) + 15000; 
    console.log(`[T${id}] Cooling down for ${Math.round(chillTime/1000)}s...`);
    await new Promise(r => setTimeout(r, chillTime));
  }
}

// 6 AGENTS: Calculated for 6-Hour Completion
for (let i = 1; i <= 6; i++) {
  console.log(`🚀 Launching Agent ${i} (Tactical Mode)...`);
  worker(i);
}
