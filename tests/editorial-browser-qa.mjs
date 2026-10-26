import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base=(process.env.RC_SITE_URL || 'https://industrial-metal-backed-rwa.vercel.app').replace(/\/$/, '');
await mkdir('artifacts/visual-qa',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const failures=[];
async function audit(name,fn){try{await fn();console.log('PASS: '+name);}catch(e){failures.push(name+': '+e.message);console.error('FAIL: '+name+': '+e.stack);}}

await audit('dark desktop 1440px',async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await context.addInitScript(()=>{ if(!localStorage.getItem('reservechain.theme')) localStorage.setItem('reservechain.theme','dark'); });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',x=>errors.push(x.message));
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.locator('.rcv-future-grid').waitFor();
  assert.equal(await page.locator('.rcv-program-bar .rcv-metrics>div').count(),4);
  assert.equal(await page.locator('.rcv-pillar').count(),5);
  assert.equal(await page.locator('.rcv-future-card').count(),4);
  assert.equal(await page.locator('.rcv-step').count(),6);
  assert.equal(await page.locator('.rcv-evidence-grid').count(),1);
  assert.equal(await page.locator('.rcv-split-asset').count(),2);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
  for(const image of await page.locator('.rcv-future-grid img, .rcv-scene img, .rcv-split-asset img').all()){
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img=>new Promise((resolve,reject)=>{
      if(img.complete) return img.naturalWidth>0?resolve():reject(new Error('Missing '+img.src));
      img.addEventListener('load',()=>resolve(),{once:true});
      img.addEventListener('error',()=>reject(new Error('Image load failed: '+img.src)),{once:true});
    }));
  }
  await page.screenshot({path:'artifacts/visual-qa/home-dark-desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);
  await context.close();
});

await audit('soft white desktop theme toggle and persistence',async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(()=>{ if(!localStorage.getItem('reservechain.theme')) localStorage.setItem('reservechain.theme','dark'); });
  const page=await context.newPage();
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.locator('button[data-theme-toggle]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
  assert.equal(await page.evaluate(()=>localStorage.getItem('reservechain.theme')),'light');
  await page.screenshot({path:'artifacts/visual-qa/home-soft-white-desktop.png',fullPage:true});
  await page.locator('.rcv-future-grid').waitFor();
  await page.goto(base+'/copper-powder',{waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
  assert.equal(await page.locator('.rcv-page-hero-grid').count(),1);
  await page.screenshot({path:'artifacts/visual-qa/copper-soft-white.png',fullPage:true});
  await context.close();
});

await audit('390px mobile navigation, editorial cards and no overflow',async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await context.addInitScript(()=>{ if(!localStorage.getItem('reservechain.theme')) localStorage.setItem('reservechain.theme','dark'); });
  const page=await context.newPage();
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.locator('.rcv-future-grid').waitFor();
  assert.equal(await page.locator('.rcv-future-card').count(),4);
  const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,vw:window.innerWidth}));
  assert.ok(overflow.doc<=overflow.vw+2,'horizontal overflow: '+JSON.stringify(overflow));
  await page.locator('.mobile-toggle').click();
  assert.equal(await page.locator('.mobile-toggle').getAttribute('aria-expanded'),'true');
  await page.locator('.mobile-toggle').click();
  await page.screenshot({path:'artifacts/visual-qa/home-dark-mobile.png',fullPage:true});
  await page.locator('button[data-theme-toggle]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
  await page.screenshot({path:'artifacts/visual-qa/home-soft-white-mobile.png',fullPage:true});
  await context.close();
});
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('VISUAL_BROWSER_QA=PASS');
