import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source=readFileSync('public-demo/public/assets/js/theme-toggle.js','utf8');
const wpSource=readFileSync('wordpress/wp-content/themes/reservechain/assets/js/theme-toggle.js','utf8');

function boot({ saved=null, prefersLight=false, denyStorage=false }={}) {
  const events={}, records={ value:saved, writes:[] }, icon={textContent:''}, label={textContent:''};
  const button={
    attrs:{},
    setAttribute(key,value){this.attrs[key]=value;},
    querySelector(selector){if(selector==='[data-theme-icon]')return icon;if(selector==='[data-theme-label]')return label;return null;}
  };
  const image={
    dataset:{lightSrc:'/logo-white.svg',darkSrc:'/logo-blue.svg'},
    src:'/logo-blue.svg',
    getAttribute(){return this.src;},
    setAttribute(key,value){if(key==='src')this.src=value;}
  };
  const meta={content:null,setAttribute(key,value){if(key==='content')this.content=value;}};
  const document={
    documentElement:{dataset:{},style:{}},
    querySelector(selector){return selector==='meta[name="theme-color"]'?meta:null;},
    querySelectorAll(selector){if(selector==='button[data-theme-toggle]')return [button];if(selector==='img[data-theme-logo]')return [image];return [];},
    addEventListener(name,callback){events[name]=callback;}
  };
  const localStorage={
    getItem(){if(denyStorage)throw new Error('Blocked');return records.value;},
    setItem(key,value){if(denyStorage)throw new Error('Blocked');records.writes.push({key,value});records.value=value;}
  };
  const window={matchMedia:()=>({matches:prefersLight})};
  runInNewContext(source,{document,localStorage,window,Set});
  return {events,document,window,button,image,icon,label,meta,records};
}
test('same toggle used for WordPress and public demo',()=>assert.equal(source,wpSource));
test('OS light preference activates soft white and swaps logo',()=>{
  const s=boot({prefersLight:true});
  assert.equal(s.document.documentElement.dataset.theme,'light');
  assert.equal(s.image.src,'/logo-white.svg');
  assert.equal(s.label.textContent,'Blue glass');
  assert.equal(s.meta.content,'#f6f9fd');
  assert.equal(s.button.attrs['aria-label'],'Switch to blue glass theme');
});
test('toggle switches modes and saves user preference',()=>{
  const s=boot({prefersLight:true});
  s.events.click({target:{closest:()=>s.button}});
  assert.equal(s.document.documentElement.dataset.theme,'dark');
  assert.equal(s.label.textContent,'Soft white');
  assert.equal(s.image.src,'/logo-blue.svg');
  assert.deepEqual(s.records.writes,[{key:'reservechain.theme',value:'dark'}]);
});
test('stored preference wins over OS setting',()=>{
  assert.equal(boot({saved:'dark',prefersLight:true}).document.documentElement.dataset.theme,'dark');
  assert.equal(boot({saved:'light',prefersLight:false}).document.documentElement.dataset.theme,'light');
});
test('works with private-browsing storage restrictions',()=>{
  const s=boot({denyStorage:true});
  s.window.ReserveChainTheme.set('light');
  s.window.ReserveChainTheme.refresh();
  assert.equal(s.document.documentElement.dataset.theme,'light');
  assert.equal(s.records.writes.length,0);
});
test('HTML loads toggle before styles and includes soft-white stylesheet',()=>{
  const html=readFileSync('public-demo/public/index.html','utf8');
  assert.ok(html.indexOf('theme-toggle.js') < html.indexOf('app.css'));
  assert.ok(html.includes('soft-white.css'));
});
test('navigation rerender reapplies preferred theme',()=>{
  const app=readFileSync('public-demo/public/assets/js/app.js','utf8');
  assert.ok(app.includes('window.ReserveChainTheme?.refresh()'));
  assert.ok(app.includes('data-theme-toggle'));
});
