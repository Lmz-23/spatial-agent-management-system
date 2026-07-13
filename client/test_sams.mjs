import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});
page.on('pageerror', err => errors.push(err.message));

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Check if the canvas is present
  const canvas = await page.$('canvas');
  console.log('Canvas found:', !!canvas);
  
  // Check page title or any text
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for login screen (since no auth)
  const loginText = await page.textContent('body');
  console.log('Has login screen:', loginText.includes('Login') || loginText.includes('login'));
  
  if (errors.length > 0) {
    console.log('Console errors:', JSON.stringify(errors, null, 2));
  } else {
    console.log('No console errors detected');
  }
  
} catch (e) {
  console.log('Error during test:', e.message);
} finally {
  await browser.close();
}
