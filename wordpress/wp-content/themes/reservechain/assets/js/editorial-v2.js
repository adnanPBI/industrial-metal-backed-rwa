/* ReserveChain editorial enhancement | pre-launch, image-led, theme-safe.
 * Shared unchanged by public-demo and the WordPress theme.
 * Product photography is illustrative, never evidence of custody or reserves.
 */
(() => {
  "use strict";
  const scriptUrl = document.currentScript && document.currentScript.src;
  const mediaRoot = scriptUrl ? new URL("../img/editorial/", scriptUrl).pathname : "/assets/img/editorial/";
  const photo = (file, alt, opts = "") =>
    '<img src="' + mediaRoot + file + '" loading="lazy" decoding="async" alt="' + alt + '" ' + opts + ' onerror="this.hidden=true;this.parentElement.classList.add(\'rcv-image-fallback\')" />';
  const future = [
    {title:"Gold Bullion",desc:"Precious metals, subject to future program review.",img:"gold-bullion.webp",symbol:"AU"},
    {title:"Energy Assets",desc:"Industrial energy assets as a prospective category.",img:"energy-assets.webp",symbol:"EN"},
    {title:"Real Estate",desc:"Property infrastructure as a conceptual future category.",img:"real-estate.webp",symbol:"RE"},
    {title:"Art & Collectibles",desc:"Collectibles, subject to verification and legal review.",img:"art-collectibles.webp",symbol:"ART"}
  ];
  const pillars = [
    ["01","Physical assets","Industrial-material programs, documented by source"],
    ["02","Independent verification","Historical assay and evidence review"],
    ["03","Custody controls","Owner and custodian approval required"],
    ["04","Digital passports","Unit-level identity architecture"],
    ["05","Reserve discipline","No supply or coverage claim without attestation"]
  ];
  const stages = ["Physical material","Laboratory review","Custody approval","Digital passport","Reserve checks","Future tokenization"];
  const program = (name,slug,img,meta,tag) =>
    '<article class="rcv-program">' +
      '<div class="rcv-program-image">' + photo(img,name+' — illustrative industrial-metal photography') +
        '<span class="rcv-photo-label">ILLUSTRATIVE IMAGE</span></div>' +
      '<div class="rcv-program-copy"><div class="rcv-mini-label">INITIAL METAL PROGRAM</div><h3>'+name+'</h3>' +
      '<p>'+meta+'</p><span class="rcv-program-status">SOURCE ASSAY DOCUMENTED · CUSTODY PENDING</span>' +
      '<a href="/'+slug+'">Explore program <span aria-hidden="true">→</span></a></div></article>';
  function media(file,alt,klass="") {
    return '<div class="rcv-media '+klass+'">'+photo(file,alt)+'</div>';
  }
  function makePillars(){
    return '<section class="rcv-pillars" aria-label="ReserveChain core pillars"><div class="rcv-wrap">' +
    pillars.map(([n,title,desc]) => '<div class="rcv-pillar"><span>'+n+'</span><b>'+title+'</b><small>'+desc+'</small></div>').join('') +
    '</div></section>';
  }
  function metrics(){
    // Do not show marketing countdowns, discounts, presale supply, or unverifiable coverage ratios.
    return '<section class="rcv-program-bar" aria-label="Documented pre-launch facts"><div class="rcv-wrap"><div class="rcv-bar-title">' +
      '<span class="rcv-mini-label">PRE-LAUNCH · EVIDENCE FIRST</span><strong>Building a documented asset infrastructure</strong></div>' +
      '<div class="rcv-metrics">' +
      '<div><b>02</b><span>Initial programs</span></div>' +
      '<div><b>99.9999%</b><span>Copper · 2022 assay</span></div>' +
      '<div><b>0.025 mm</b><span>Nickel wire · 2021 assay</span></div>' +
      '<div><b>00</b><span>Tokens issued in this demo</span></div>' +
      '</div><a href="/waitlist" class="rcv-metric-cta">Join the waitlist</a></div></section>';
  }
  function futureSection(){
    return '<section class="rcv-section rcv-future" aria-labelledby="rcv-future-heading"><div class="rcv-wrap">' +
      '<div class="rcv-heading"><span class="rcv-mini-label">LONG-TERM ROADMAP · CONCEPTS ONLY</span>' +
      '<h2 id="rcv-future-heading">A wider world of <em>real assets.</em></h2>' +
      '<p>These categories are conceptual. No asset is held, insured, reserved, offered or tokenized by this demonstration.</p></div>' +
      '<div class="rcv-future-grid">' + future.map(x => '<article class="rcv-future-card">'+media(x.img,x.title+' — illustrative future-category photography') +
      '<div class="rcv-future-copy"><span>FUTURE CATEGORY / NOT ACTIVE</span><h3>'+x.title+'</h3><p>'+x.desc+'</p></div></article>').join('') + '</div></div></section>';
  }
  function lifecycle(){
    return '<div class="rcv-lifecycle" role="list">'+stages.map((x,i)=>'<div class="rcv-step" role="listitem"><div class="rcv-step-icon">'+String(i+1).padStart(2,'0')+'</div><b>'+x+'</b><small>'+(i===5?'Inactive / no tokens issued':'Evidence gate / illustrative process')+'</small></div>').join('')+'</div>';
  }
  function previewPair() {
    return '<section class="rcv-section rcv-evidence" aria-labelledby="rcv-evidence-title"><div class="rcv-wrap">' +
    '<div class="rcv-heading"><span class="rcv-mini-label">TRACEABILITY · NOT A CUSTODY CLAIM</span>' +
    '<h2 id="rcv-evidence-title">Evidence you can inspect. <em>Claims you can verify.</em></h2>' +
    '<p>Illustrative interfaces; production records and independent proof remain subject to documentary approval.</p></div>' +
    '<div class="rcv-evidence-grid"><article class="rcv-passport"><div class="rcv-card-head"><span>RC / DIGITAL ASSET PASSPORT</span>' +
    '<span class="rcv-demo">ILLUSTRATIVE</span></div><div class="rcv-passport-inner">'+
    media("nickel-wire.webp","Illustrative nickel wire spool","rcv-passport-photo")+
    '<div><span class="rcv-mini-label">PROPOSED IDENTITY</span><h3>Ultrafine Nickel Wire</h3>' +
    '<p>Source-stated purity 99.9807% · 0.025 mm</p><dl><div><dt>Certificate</dt><dd>IGAS 0004368</dd></div>' +
    '<div><dt>Custody</dt><dd>Pending evidence</dd></div><div><dt>Tokenization</dt><dd>Not issued</dd></div></dl></div></div>' +
    '<div class="rcv-passport-foot"><div class="rcv-qr" role="img" aria-label="Decorative QR-style placeholder, not a scannable credential"><div></div></div>' +
    '<div><strong>Sample passport preview</strong><p>Not a live QR credential, ownership record or verified asset passport.</p>' +
    '<a href="/digital-asset-passports">Explore passport architecture →</a></div></div></article>' +
    '<article class="rcv-reserves"><div class="rcv-card-head"><span>PROOF OF RESERVES / EVIDENCE GATES</span>' +
    '<span class="rcv-demo">NO LIVE RESERVE DATA</span></div><h3>Reserve readiness</h3>' +
    '<p>No audited reserve coverage ratio or current custodian status is published.</p>' +
    ['Assay documentation','Title & custody records','Unit-level inventory','Independent reconciliation'].map((x,i)=>'<div class="rcv-reserve-row"><div><span>'+x+'</span><small>'+(i===0?'Historical source provided':'Independent attestation pending')+'</small></div><div class="rcv-empty-track"><i></i></div></div>').join('') +
    '<div class="rcv-reserve-foot"><b>Verified coverage</b><strong>NOT PUBLISHED</strong><span>0 tokens issued in this demo</span></div>' +
    '<a href="/proof-of-reserves">Review reserve framework →</a></article></div></div></section>';
  }
  function addHeroImage(host) {
    host.innerHTML='<div class="rcv-still-image">'+photo("hero-industrial-still-life.webp","Illustrative 3D still life featuring copper powder and nickel wire against a global metals theme",'fetchpriority="high" loading="eager"')+'</div>' +
      '<div class="rcv-hero-globe" aria-hidden="true"></div><div class="rcv-hero-caption"><span>PHYSICAL METALS</span><b>Source → Evidence → Digital Identity</b><small>Illustrative concept, not custody evidence</small></div>';
    host.classList.add('rcv-scene');
  }
  function enhance() {
    const main=document.querySelector('#main');
    if (!main || main.dataset.rcvEnhanced==='1') return;
    const demo=Boolean(main.querySelector('.asset-orbit'));
    const wp=Boolean(main.querySelector('.rc-hero-visual'));
    if(!demo && !wp) {
      document.querySelectorAll('.asset-card .visual, .rc-asset-visual').forEach((n,i)=>{
        const type=n.classList.contains('nickel')||n.closest('.nickel')?'nickel-wire.webp':i%2?'nickel-wire.webp':'copper-powder.webp';
        n.classList.add('rcv-inline-asset');n.innerHTML=photo(type,'Illustrative industrial-metal sample');
      });
      return;
    }
    main.dataset.rcvEnhanced='1';
    const hero=main.querySelector('.hero, .rc-hero');
    hero?.insertAdjacentHTML('beforebegin',metrics());
    const scene=main.querySelector('.asset-orbit, .rc-hero-visual');
    if(scene)addHeroImage(scene);
    hero?.insertAdjacentHTML('afterend',makePillars());
    const livePrograms=main.querySelectorAll('.asset-card, .rc-card');
    livePrograms.forEach(n=>{const image=n.querySelector('.visual, .rc-asset-visual');if(image){
      const file=image.classList.contains('nickel')||n.classList.contains('nickel')?'nickel-wire.webp':'copper-powder.webp';
      image.classList.add('rcv-inline-asset');image.innerHTML=photo(file,'Illustrative '+(file.startsWith('nickel')?'nickel wire':'copper powder')+' product');}});
    const existingFuture=main.querySelector('.future-grid');
    if(existingFuture){existingFuture.closest('.section')?.remove();}
    const chain=main.querySelector('.chain, .rc-chain');
    if(chain){chain.innerHTML=lifecycle();chain.classList.add('rcv-chain-host');}
    const chainSection=chain?.closest('.section, .rc-section');
    const initial=main.querySelector('.asset-card, .rc-asset-visual')?.closest('.section, .rc-section');
    if(initial){initial.insertAdjacentHTML('afterend',futureSection());}
    if(chainSection)chainSection.insertAdjacentHTML('afterend',previewPair());
    // The previous homepage framework graph contains arbitrary decorative bar heights.
    // Hide it where the explicit "not published" evidence-status panel now replaces it.
    const oldDemoPair=main.querySelector('.framework-chart')?.closest('.section');
    if(oldDemoPair)oldDemoPair.classList.add('rcv-legacy-evidence-hidden');
  }
  window.ReserveChainEditorial={enhance};
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhance);
  else enhance();
})();