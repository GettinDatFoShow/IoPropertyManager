const fs = require('fs');
const playwright = require('playwright');

(async () => {
  const url = process.env.URL || 'http://localhost:4200';
  const out = {
    url,
    console: [],
    errors: [],
    snapshots: {},
  };

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    out.console.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    out.errors.push(String(err));
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500); // let client render

    // helper to grab outerHTML safely
    const grab = async (selector) => {
      const exists = await page.$(selector);
      if (!exists) return null;
      return page.evaluate((s) => {
        const el = document.querySelector(s);
        return el ? el.outerHTML : null;
      }, selector);
    };

    out.snapshots.initial = {
      splitPane: await grab('ion-split-pane'),
      menu: await grab('ion-menu'),
      routerOutlet: await grab('ion-router-outlet'),
      tabBar: await grab('ion-tab-bar[slot="bottom"]'),
    };

    // Try clicking a side-menu item (dashboard)
    const menuSelector = 'ion-menu ion-item[routerlink="/tabs/dashboard"], ion-menu ion-item[href="/tabs/dashboard"]';
    // ensure the menu is open so items are clickable
    try {
      await page.evaluate(() => {
        const m = document.querySelector('ion-menu');
        if (m && m.open) {
          // some Ionic versions expose an open() method
          try { m.open(); } catch (e) {}
        }
      });
    } catch (e) {
      // ignore
    }

    let menuItem = null;
    try {
      await page.waitForSelector(menuSelector, { state: 'visible', timeout: 3000 });
      menuItem = await page.$(menuSelector);
    } catch (e) {
      // not visible
    }

    if (menuItem) {
      try {
        await menuItem.click({ timeout: 5000 });
        await page.waitForTimeout(500);
        out.snapshots.afterMenuClick = {
          url: page.url(),
          routerOutlet: await grab('ion-router-outlet'),
        };
      } catch (errClick) {
        out.snapshots.afterMenuClick = { error: 'click-failed', detail: String(errClick) };
      }
    } else {
      out.snapshots.afterMenuClick = { error: 'menu item selector not found or not visible' };
    }

    // Try clicking a bottom tab button. Wait for it to be visible (tabs might be hidden on wide screens)
    const tabSelector = 'ion-tab-button[routerlink="/tabs/dashboard"], ion-tab-button[tab="dashboard"]';
    let tabBtn = null;
    try {
      await page.waitForSelector(tabSelector, { state: 'visible', timeout: 3000 });
      tabBtn = await page.$(tabSelector);
    } catch (e) {
      // not visible
    }

    if (tabBtn) {
      try {
        await tabBtn.click({ timeout: 5000 });
        await page.waitForTimeout(500);
        out.snapshots.afterTabClick = {
          url: page.url(),
          routerOutlet: await grab('ion-router-outlet'),
        };
      } catch (errClick) {
        out.snapshots.afterTabClick = { error: 'click-failed', detail: String(errClick) };
      }
    } else {
      out.snapshots.afterTabClick = { error: 'tab button selector not found or not visible' };
    }

  } catch (err) {
    out.errors.push(String(err));
  } finally {
    await browser.close();
    try {
      fs.writeFileSync('tools/inspect-output.json', JSON.stringify(out, null, 2));
      console.log('INSPECTOR: wrote tools/inspect-output.json');
    } catch (e) {
      console.error('INSPECTOR: failed to write output file', e);
      console.log(JSON.stringify(out, null, 2));
    }
  }
})();
