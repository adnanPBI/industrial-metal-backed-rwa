(() => {
  const menu=document.querySelector('.rc-menu'), nav=document.querySelector('.rc-nav');
  if(menu&&nav)menu.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',o?'true':'false')});
  document.querySelectorAll('.rc-waitlist-form').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault(); if(!form.reportValidity())return; const s=form.querySelector('.rc-formstatus'); const fd=new FormData(form); const x=Object.fromEntries(fd.entries()); ['consent_updates','privacy_ack','no_offer_ack'].forEach(k=>x[k]=fd.has(k)); s.textContent='Submitting...';
    try{const r=await fetch(RC_THEME.api+'/waitlist',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(x)});const d=await r.json();if(!r.ok||d.code)throw new Error(d.message||'Registration failed.');s.className='rc-formstatus ok';s.textContent='Registration received. Please check your email to verify your address.';form.reset();}catch(err){s.className='rc-formstatus err';s.textContent=err.message;}
  }));
})();
