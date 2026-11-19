const { chromium } = require('E:/work/android-toolchain/ui-audit/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-first-run', '--disable-extensions', '--disable-background-networking']
  });
  const paths = ['/login', '/register', '/forgot-password'];
  for (const path of paths) {
    for (const width of [320, 360, 393, 430]) {
      const context = await browser.newContext({ viewport: { width, height: 740 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
      await context.addInitScript(() => document.documentElement.classList.add('capacitor-android'));
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:4173' + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(500);
      const scan = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = doc.clientWidth;
        const nodes = [...document.querySelectorAll('body *')];
        const overflowing = nodes.filter(el => {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed' && el.getAttribute('aria-hidden') === 'true') return false;
          if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none') return false;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1 || r.width > 2000) return false;
          return r.left < -2 || r.right > vw + 2;
        }).slice(0, 10).map(el => {
          const r = el.getBoundingClientRect();
          return { tag: el.tagName, classes: String(el.className).slice(0,90), left: Math.round(r.left), right: Math.round(r.right) };
        });
        return { width: vw, scrollWidth: doc.scrollWidth, overflow: overflowing };
      });
      console.log(JSON.stringify({ path, width, scan }));
      await context.close();
    }
  }
  await browser.close();
})().catch(err => { console.error(String(err)); process.exit(1); });
