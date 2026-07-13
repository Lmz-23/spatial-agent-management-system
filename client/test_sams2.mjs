import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('Browser launched, creating context...');
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
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('Page loaded, waiting for content...');
    await page.waitForTimeout(3000);
    
    // Check if the canvas is present
    const canvas = await page.$('canvas');
    console.log('Canvas found:', !!canvas);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check body text
    const bodyText = await page.textContent('body');
    console.log('Body contains "SAMS":', bodyText.includes('SAMS'));
    console.log('Body contains "Office":', bodyText.includes('Office') || bodyText.includes('office'));
    
    if (errors.length > 0) {
      console.log('Console errors:', JSON.stringify(errors, null, 2));
    } else {
      console.log('No console errors detected');
    }
    
  } catch (e) {
    console.log('Error during test:', e.message);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

main();
