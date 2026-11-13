/* ReserveChain editorial enhancement | pre-launch, image-led, theme-safe.
 * Shared unchanged by public-demo and the WordPress theme.
 * Product photography is illustrative, never evidence of custody or reserves.
 */
(() => {
  "use strict";
  const scriptUrl = document.currentScript && document.currentScript.src;
  const mediaRoot = scriptUrl ? new URL("../img/editorial/", scriptUrl).pathname : "/assets/img/editorial/";
  const photo = (file, alt, opts = "", fallback = "") => {
    // The fallback is a verified, already-shipped photo and prevents broken panels
    // if an optional editorial asset has not yet been uploaded to GitHub.
    const darkSrc = mediaRoot + file;
    const lightSrc = file === "hero-copper-nickel-dark.webp"
      ? mediaRoot + "hero-copper-nickel-light.webp" : darkSrc;
    const isThemeImage = file === "hero-copper-nickel-dark.webp";
    const themeProps = isThemeImage
      ? ' data-theme-logo data-dark-src="' + darkSrc + '" data-light-src="' + lightSrc + '"'
      : '';
    const active = isThemeImage && document.documentElement.dataset.theme === "light" ? lightSrc : darkSrc;
    const safeFallback = fallback ? mediaRoot + fallback : '';
    return '<img src="' + active + '"' + themeProps + ' loading="lazy" decoding="async" alt="' + alt +
      '" data-fallback="' + safeFallback + '" ' + opts + ' onerror="if(this.dataset.fallback && !this.dataset.fallbackUsed){this.dataset.fallbackUsed=\'1\';this.src=this.dataset.fallback;this.removeAttribute(\'data-theme-logo\');}else{const parent=this.parentElement;if(parent.classList.contains(\'rcv-hero-composite\'))parent.remove();else this.remove();}" />';
  };
  const evidenceCards = [
    {title:"Copper Powder · Assay",desc:"Historical IGAS analysis 0004512 (99.9999% reported purity); custody and current quantities require independent confirmation.",img:"copper-assay-lab.webp",fallback:"copper-powder.webp"},
    {title:"Copper Powder · Passport",desc:"Lot #03-K-07; canister documentation and a proposed Digital Asset Passport, subject to custody checks.",img:"copper-custody-canister.webp",fallback:"copper-powder.webp"},
    {title:"Nickel Wire · Specification",desc:"0.025 mm ultrafine wire (99.9807% reported purity); historical IGAS analysis 0004368.",img:"nickel-wire-micrometer.webp",fallback:"nickel-wire.webp"},
    {title:"Nickel Wire · Passport",desc:"Lot 120/NP1; proposed serialized bobbin record, with custody and reserve reconciliation pending.",img:"nickel-passport-bobbins.webp",fallback:"nickel-wire.webp"}
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
    // Do not show artificial urgency timers, discounts, presale supply, or unverifiable coverage ratios.
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
      '<div class="rcv-heading"><span class="rcv-mini-label">COPPER POWDER & NICKEL WIRE · DOCUMENTED SOURCES</span>' +
      '<h2 id="rcv-future-heading">Two metals. <em>One evidence-first platform.</em></h2>' +
      '<p>Explore the two initial industrial-metal programs only. Historical laboratory reports are not proof of present title, custody, insured stock or reserves.</p></div>' +
      '<div class="rcv-future-grid">' + evidenceCards.map(x => '<article class="rcv-future-card"><div class="rcv-media">' + photo(x.img,x.title+' — illustrative Copper or Nickel image',"",x.fallback) + '</div>' +
      '<div class="rcv-future-copy"><span>PRE-LAUNCH · SOURCE EVIDENCE ONLY</span><h3>'+x.title+'</h3><p>'+x.desc+'</p></div></article>').join('') + '</div></div></section>';
  }
  function lifecycle(){
    return '<div class="rcv-lifecycle" role="list">'+stages.map((x,i)=>'<div class="rcv-step" role="listitem"><div class="rcv-step-icon">'+String(i+1).padStart(2,'0')+'</div><b>'+x+'</b><small>'+(i===5?'Sepolia testnet demo · zero supply':'Evidence gate / illustrative process')+'</small></div>').join('')+'</div>';
  }
  function previewPair() {
    return '<section class="rcv-section rcv-evidence" aria-labelledby="rcv-evidence-title"><div class="rcv-wrap">' +
    '<div class="rcv-heading"><span class="rcv-mini-label">TRACEABILITY · VERIFIED SEPOLIA DEMONSTRATION</span>' +
    '<h2 id="rcv-evidence-title">Evidence you can inspect. <em>Claims you can verify.</em></h2>' +
    '<p>Illustrative interfaces and deployed Sepolia ERC-20 contracts, each with zero issued supply; documentary reserve proof and production approval remain outstanding.</p></div>' +
    '<div class="rcv-evidence-grid"><article class="rcv-passport"><div class="rcv-card-head"><span>RC / DIGITAL ASSET PASSPORT</span>' +
    '<span class="rcv-demo">ILLUSTRATIVE</span></div><div class="rcv-passport-inner">'+
    '<div class="rcv-media rcv-passport-photo">'+photo("nickel-passport-bobbins.webp","Illustrative nickel wire bobbins","","nickel-wire.webp")+'</div>'+
    '<div><span class="rcv-mini-label">PROPOSED IDENTITY</span><h3>Ultrafine Nickel Wire</h3>' +
    '<p>Source-stated purity 99.9807% · 0.025 mm</p><dl><div><dt>Certificate</dt><dd>IGAS 0004368</dd></div>' +
    '<div><dt>Sepolia ERC-20</dt><dd><a href="https://sepolia.etherscan.io/address/0xDd22f3E82dAc3647a705E4786a48F25969e20c01" target="_blank" rel="noopener noreferrer">RC-NI-T ↗</a></dd></div>' +
    '<div><dt>Custody</dt><dd>Pending evidence</dd></div><div><dt>Tokenization</dt><dd>Not issued (0 supply)</dd></div></dl></div></div>' +
    '<div class="rcv-passport-foot"><div class="rcv-qr" role="img" aria-label="Decorative QR-style placeholder, not a scannable credential"><div></div></div>' +
    '<div><strong>Sample passport preview</strong><p>Not a live QR credential, ownership record or verified asset passport.</p>' +
    '<a href="/digital-asset-passports">Explore passport architecture →</a></div></div></article>' +
    '<article class="rcv-reserves"><div class="rcv-card-head"><span>PROOF OF RESERVES & SEPOLIA TESTNET</span>' +
    '<span class="rcv-demo">NO LIVE RESERVE DATA</span></div><h3>Reserve & contract readiness</h3>' +
    '<p>No audited reserve coverage ratio or current custodian status is published. Two unbacked demo ERC-20 contracts are deployed on Sepolia with zero supply:</p>' +
    [
      ['Copper Powder ERC-20 (RC-CU-T)','0xE67f6301eb05A9B5eF8E6b43d0a8b7137d4DEcFB'],
      ['Nickel Wire ERC-20 (RC-NI-T)','0xDd22f3E82dAc3647a705E4786a48F25969e20c01'],
      ['Assay documentation','IGAS 0004512 (Cu) & IGAS 0004368 (Ni)'],
      ['Title, custody & reconciliation','Independent attestation pending']
    ].map(([label,val],i)=>'<div class="rcv-reserve-row"><div><span>'+label+'</span><small>'+(i<2?'<a href="https://sepolia.etherscan.io/address/'+val+'" target="_blank" rel="noopener noreferrer">'+val.slice(0,10)+'…'+val.slice(-6)+' ↗</a>':val)+'</small></div><div class="rcv-empty-track"><i></i></div></div>').join('') +
    '<div class="rcv-reserve-foot"><b>Verified coverage</b><strong>NOT PUBLISHED</strong><span>0 tokens issued in this demo · Sepolia testnet</span></div>' +
    '<a href="/proof-of-reserves">Review reserve framework →</a></article></div></div></section>';
  }
  function addHeroImage(host) {
    // Prefetch the opposite theme before the user toggles; never show an empty hero frame.
    const alternate = document.documentElement.dataset.theme === 'light'
      ? 'hero-copper-nickel-dark.webp' : 'hero-copper-nickel-light.webp';
    const preload = new Image();
    preload.decoding = 'async';
    preload.src = mediaRoot + alternate;
    host.innerHTML='<div class="rcv-still-image rcv-two-metals">' +
      '<div class="rcv-hero-composite">'+photo("hero-copper-nickel-dark.webp","Illustrative Copper Powder and Nickel Wire studio still life",'fetchpriority="high" loading="eager"')+'</div>' +
      '<div class="rcv-metal-hero rcv-metal-copper">' +
      photo("copper-powder.webp","Copper powder in a dark bowl — illustrative photograph",'fetchpriority="high" loading="eager"') +
      '<span>COPPER POWDER</span></div><div class="rcv-metal-hero rcv-metal-nickel">' +
      photo("nickel-wire.webp","Nickel wire wound onto a spool — illustrative photograph",'loading="eager"') +
      '<span>NICKEL WIRE · 0.025 mm</span></div></div>' +
      '<div class="rcv-hero-globe" aria-hidden="true"></div>' +
      '<div class="rcv-hero-caption" role="note" aria-label="Illustrative Copper Powder and Nickel Wire — no custody or reserve proof">' +
      '<span class="rcv-hero-caption__label">COPPER POWDER · NICKEL WIRE</span>' +
      '<b class="rcv-hero-caption__heading">Source → Assay → Custody → Sepolia demo</b>' +
      '<small class="rcv-hero-caption__note">Illustrative imagery · No custody or reserve claim</small></div>';
    host.classList.add('rcv-scene');
  }
  function decorateSecondary(main) {
    // Keep secondary pages faithful to the 51-page brief without copying text from
    // a screenshot. Preserve the working route, disclosures and content elements.
    const currentPath = (window.location?.pathname || '/').toLowerCase();
    if (/\/(admin|participant-portal|redemption-portal)/.test(currentPath)) return;
    const hero = main.querySelector('.page-hero > .container, .rc-pagehero > .rc-container');
    if (!hero || hero.classList.contains('rcv-page-hero-grid')) return;
    // Keep non-program editorial photography restricted to the two metals.
    let file = 'copper-powder.webp', fallback = 'copper-powder.webp';
    if (/nickel|wire/.test(currentPath)) file = fallback = 'nickel-wire.webp';
    else if (/verify|verification|assay/.test(currentPath)) file = 'copper-assay-lab.webp';
    else if (/custody|vault|security|reserve/.test(currentPath)) file = 'copper-custody-canister.webp';
    else if (/technology|token|infrastructure|how-it-works/.test(currentPath)) {file='nickel-wire-micrometer.webp';fallback='nickel-wire.webp';}
    else if (/passport|registry|future-asset|explore|program/.test(currentPath)) {file='nickel-passport-bobbins.webp';fallback='nickel-wire.webp';}
    const copy = document.createElement('div');
    copy.className = 'rcv-page-copy';
    while (hero.firstChild) copy.appendChild(hero.firstChild);
    hero.appendChild(copy);
    hero.insertAdjacentHTML('beforeend',
      '<div class="rcv-media rcv-page-art">'+photo(file,'Illustrative editorial image for '+document.title,'',fallback)+'</div>');
    hero.classList.add('rcv-page-hero-grid');
  }
  function enhance() {
    const main=document.querySelector('#main');
    if (!main || main.dataset.rcvEnhanced==='1') return;
    const demo=Boolean(main.querySelector('.asset-orbit'));
    const wp=Boolean(main.querySelector('.rc-hero-visual'));
    if(!demo && !wp) {
      decorateSecondary(main);
      document.querySelectorAll('.asset-card .visual, .rc-asset-visual').forEach((n,i)=>{
        const type=n.classList.contains('nickel')||n.closest('.nickel')?'nickel-wire.webp':i%2?'nickel-wire.webp':'copper-powder.webp';
        n.classList.add('rcv-inline-asset');n.innerHTML=photo(type,'Illustrative industrial-metal sample');
      });
      window.ReserveChainTheme?.refresh?.();
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
      image.classList.add('rcv-inline-asset');image.innerHTML=photo(file,'Illustrative '+(file.startsWith('nickel')?'nickel wire':'copper powder')+' product');
      if (!n.classList.contains('rcv-split-asset')) {
        const copy=document.createElement('div');
        copy.className='rcv-asset-copy';
        for (const child of Array.from(n.children)) {
          if (child !== image) copy.appendChild(child);
        }
        n.appendChild(copy);
        n.classList.add('rcv-split-asset');
      }
    }});
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
    window.ReserveChainTheme?.refresh?.();
  }
  window.ReserveChainEditorial={enhance};
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhance);
  else enhance();
})();