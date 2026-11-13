import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import pngjs from 'pngjs';
const { PNG } = pngjs;

const base=(process.env.RC_SITE_URL || 'https://industrial-metal-backed-rwa.vercel.app').replace(/\/$/, '');
await mkdir('artifacts/visual-qa',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const failures=[];

async function assertNoHeroCaption(page, contextLabel){
  assert.equal(await page.locator('.rcv-scene .rcv-hero-caption').count(),0,
    contextLabel+': unwanted caption overlay exists');
  const scene=page.locator('.rcv-scene');
  assert.equal(await scene.locator('.rcv-hero-composite img').count(),1,
    contextLabel+': hero photo missing');
  await scene.locator('.rcv-hero-composite img').evaluate(async img=>{
    await img.decode();
    if(img.naturalWidth < 1200 || img.naturalHeight < 650){
      throw new Error('Full-resolution hero image failed to decode');
    }
  });
  // elementFromPoint is viewport-relative; image loops above may have scrolled
  // the hero off-screen. Bring it into view before testing visual stacking.
  await scene.scrollIntoViewIfNeeded();
  const lowerImageVisible=await scene.evaluate(host=>{
    const image=host.querySelector('.rcv-hero-composite img');
    const rect=host.getBoundingClientRect();
    const pointX=rect.left+rect.width*.50;
    const pointY=rect.top+rect.height*.87;
    const atPoint=document.elementFromPoint(pointX,pointY);
    return atPoint===image || image.contains(atPoint);
  });
  assert.ok(lowerImageVisible,contextLabel+': lower hero image obscured by an overlay');
}

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
  const visibleText=await page.locator('body').innerText();
  assert.doesNotMatch(visibleText,/Gold Bullion|Energy Assets|Real Estate|Art & Collectibles|Precious Metals|Gemstones/i);
  const allImg=await page.locator('img').evaluateAll(images=>images.map(x=>x.getAttribute('src')||''));
  assert.ok(allImg.every(src=>!/gold-bullion|energy-assets|real-estate|art-collectibles|hero-industrial-still-life/i.test(src)),allImg.join(','));
  assert.ok(allImg.some(src=>src.includes('copper-powder.webp')));
  assert.ok(allImg.some(src=>src.includes('nickel-wire.webp')));
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
  const exactPhotos=['hero-copper-nickel-dark.webp','copper-assay-lab.webp','copper-custody-canister.webp','nickel-wire-micrometer.webp','nickel-passport-bobbins.webp'];
  const imageUrls=await page.locator('.rcv-scene img, .rcv-future-grid img, .rcv-passport-photo img').evaluateAll(images=>images.map(img=>img.currentSrc));
  for(const name of exactPhotos)assert.ok(imageUrls.some(url=>url.endsWith('/'+name)), 'Expected original editorial photo, not a fallback: '+name);
  for(const [path,address] of [
    ['/copper-powder','0xE67f6301eb05A9B5eF8E6b43d0a8b7137d4DEcFB'],
    ['/nickel-wire','0xDd22f3E82dAc3647a705E4786a48F25969e20c01'],
    ['/asset-passport/RC-DAP-CU-03K07-DEMO','0xE67f6301eb05A9B5eF8E6b43d0a8b7137d4DEcFB'],
    ['/asset-passport/RC-DAP-NI-120NP1-DEMO','0xDd22f3E82dAc3647a705E4786a48F25969e20c01']
  ]){
    const tab=await context.newPage();
    await tab.goto(base+path,{waitUntil:'networkidle'});
    const link='https://sepolia.etherscan.io/address/'+address;
    assert.ok(await tab.locator('a[href="'+link+'"]').count()>0,'Canonical Sepolia link missing at '+path);
    await tab.close();
  }
  for(const image of await page.locator('.rcv-future-grid img, .rcv-scene img, .rcv-split-asset img').all()){
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img=>new Promise((resolve,reject)=>{
      if(img.complete) return img.naturalWidth>0?resolve():reject(new Error('Missing '+img.src));
      img.addEventListener('load',()=>resolve(),{once:true});
      img.addEventListener('error',()=>reject(new Error('Image load failed: '+img.src)),{once:true});
    }));
  }
  await assertNoHeroCaption(page,'dark desktop');
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
  await page.locator('.rcv-future-grid').waitFor();
  const lightHero=page.locator('.rcv-hero-composite img');
  await lightHero.evaluate(async img => { await img.decode(); });
  const lightState=await lightHero.evaluate(img=>({src:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight}));
  assert.ok(lightState.src.endsWith('/hero-copper-nickel-light.webp'),'Light hero unexpectedly fell back: '+lightState.src);
  assert.ok(lightState.width>=1200 && lightState.height>=650,'Light hero not decoded at full resolution: '+JSON.stringify(lightState));
  const diagnostic=await lightHero.evaluate(img=>{
    const summary=(n)=>{ if(!n)return null;const c=getComputedStyle(n),r=n.getBoundingClientRect();return {
      tag:n.tagName,cls:n.className,rect:{w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)},
      display:c.display,visibility:c.visibility,opacity:c.opacity,zIndex:c.zIndex,
      background:c.backgroundColor,filter:c.filter,mask:c.maskImage,transform:c.transform,position:c.position
    };};
    const scene=img.closest('.rcv-scene');
    const r=img.getBoundingClientRect();
    const elementAtCenter=document.elementFromPoint(r.x+r.width/2,r.y+r.height*0.4);
    return {img:summary(img),composite:summary(img.parentElement),still:summary(img.parentElement?.parentElement),scene:summary(scene),
      overlay:getComputedStyle(scene,'::before').cssText,
      center:elementAtCenter?.className,
      theme:document.documentElement.dataset.theme};
  });
  console.log('LIGHT_HERO_CSS_DIAG='+JSON.stringify(diagnostic));
  const frame=PNG.sync.read(await page.locator('.rcv-scene').screenshot({path:'artifacts/visual-qa/hero-soft-white-visual-gate.png'}));
  const samples=[];
  for(let y=Math.floor(frame.height*.12);y<Math.floor(frame.height*.69);y+=12){
    for(let x=Math.floor(frame.width*.12);x<Math.floor(frame.width*.88);x+=12){
      const i=(y*frame.width+x)*4;
      samples.push((frame.data[i]*.299+frame.data[i+1]*.587+frame.data[i+2]*.114));
    }
  }
  const avg=samples.reduce((a,b)=>a+b,0)/samples.length;
  const contrast=Math.sqrt(samples.reduce((sum,v)=>sum+(v-avg)**2,0)/samples.length);
  console.log('LIGHT_HERO_PAINT_CONTRAST='+contrast.toFixed(2));
  assert.ok(contrast>=18,'Soft-white hero screenshot is visually blank although the image decoded; contrast='+contrast.toFixed(2));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await assertNoHeroCaption(page,'soft-white desktop');
  await page.screenshot({path:'artifacts/visual-qa/home-soft-white-desktop.png',fullPage:true});

  const lightEvidence=await page.locator('.rcv-future-grid img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,width:i.naturalWidth})));
  for(const file of ['copper-assay-lab.webp','copper-custody-canister.webp','nickel-wire-micrometer.webp','nickel-passport-bobbins.webp']){
    const target=lightEvidence.find(i=>i.src.endsWith('/'+file));
    assert.ok(target,'Light evidence image unavailable: '+file);
  }
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
  await assertNoHeroCaption(page,'dark mobile');
  await page.screenshot({path:'artifacts/visual-qa/home-dark-mobile.png',fullPage:true});
  await page.locator('button[data-theme-toggle]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
  await page.locator('.rcv-hero-composite img').evaluate(async img=>{
    await img.decode();
    if(img.naturalWidth<1200)throw new Error('Mobile soft-white hero photograph did not decode');
  });
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await assertNoHeroCaption(page,'soft-white mobile');
  await page.screenshot({path:'artifacts/visual-qa/home-soft-white-mobile.png',fullPage:true});
  await context.close();
});
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('VISUAL_BROWSER_QA=PASS');
