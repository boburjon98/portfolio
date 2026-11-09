import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const port=9238;
const chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--remote-debugging-port='+port,'--user-data-dir='+resolve('.browser-review/cdp'),'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket;
try{
 let targets;
 for(let i=0;i<60;i++){try{targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();if(targets.some(t=>t.type==='page'))break;}catch{}await delay(200);}
 const target=targets.find(t=>t.type==='page');socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
 const pending=new Map();let id=0;
 socket.addEventListener('message',event=>{const value=JSON.parse(event.data);if(value.id&&pending.has(value.id)){const {resolve,reject}=pending.get(value.id);pending.delete(value.id);value.error?reject(new Error(JSON.stringify(value.error))):resolve(value.result);}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const number=++id;pending.set(number,{resolve,reject});socket.send(JSON.stringify({id:number,method,params}));});
 const evaluate=async expression=>{const value=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(value.exceptionDetails)throw new Error(JSON.stringify(value.exceptionDetails));return value.result.value;};
 await send('Page.enable');await send('Runtime.enable');mkdirSync('.review',{recursive:true});
 for(const [name,width,height]of [['desktop',1440,1080],['mobile',390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:name==='mobile'});
  await send('Page.navigate',{url:pathToFileURL(resolve('index.html')).href});await delay(1200);
  assert.equal(await evaluate(`document.querySelectorAll('.language-select option').length`),3);
  for(const lang of ['uz','ru','en']){await evaluate(`(()=>{const s=document.querySelector('.language-select');s.value='${lang}';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);await delay(80);assert.equal(await evaluate(`document.documentElement.lang`),lang);}
  await evaluate(`document.querySelector('.project-card .tags [data-tech="LLM"]').click()`);assert.equal(await evaluate(`document.querySelector('.tag-dialog').open`),true);assert.equal(await evaluate(`document.querySelector('.tag-full-name').textContent`),'Large Language Model');assert.equal(await evaluate(`document.querySelector('.modal-backdrop').hidden`),true);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});assert.equal(await evaluate(`document.querySelector('.tag-dialog').open`),false);
  await evaluate(`document.querySelector('.project-card .project-open').click()`);await delay(60);assert.equal(await evaluate(`document.querySelector('.modal-backdrop').hidden`),false);await evaluate(`document.querySelector('.modal-tags [data-tech="LLM"]').click()`);assert.equal(await evaluate(`document.querySelector('.tag-dialog').open`),true);await evaluate(`document.querySelector('.tag-dialog-done').click()`);assert.equal(await evaluate(`document.querySelector('.modal-backdrop').hidden`),false);await evaluate(`document.querySelector('.modal-close').click()`);
  await evaluate(`document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:document.querySelector('#work').getBoundingClientRect().top+window.scrollY-100,behavior:'instant'});`);await delay(900);
  await evaluate(`Promise.all([...document.querySelectorAll('.project-cover')].map(image=>{image.loading='eager';return image.decode().catch(()=>{})}))`);
  const metrics=await evaluate(`JSON.stringify({headerTop:document.querySelector('.header').getBoundingClientRect().top,topVisible:!document.querySelector('.scroll-top').hidden,topRight:document.querySelector('.scroll-top').getBoundingClientRect().right,viewport:window.innerWidth,documentWidth:document.documentElement.scrollWidth,covers:document.querySelectorAll('.project-cover').length,loaded:[...document.querySelectorAll('.project-cover')].filter(image=>image.naturalWidth>0).length,projects:document.querySelectorAll('.project-card').length})`);
  console.log(name,metrics);const checked=JSON.parse(metrics);assert.equal(checked.headerTop,0);assert.equal(checked.topVisible,true);assert.equal(checked.projects,11);assert.equal(checked.covers,11);assert.equal(checked.loaded,11);assert.ok(checked.documentWidth<=checked.viewport);
  assert.equal(await evaluate(`document.querySelector('.header').classList.contains('is-scrolled')`),true);
  assert.equal(await evaluate(`document.querySelector('.nav-container').getBoundingClientRect().height`),name==='desktop'?66:64);
  assert.ok(parseFloat(await evaluate(`document.querySelector('.scroll-top').style.getPropertyValue('--scroll-angle')`))>0);
  if(name==='desktop'){
   const supportsHover=await evaluate(`matchMedia('(hover: hover) and (pointer: fine)').matches`);
   if(supportsHover){await evaluate(`(()=>{const c=document.querySelector('.project-card'),r=c.getBoundingClientRect();c.dispatchEvent(new PointerEvent('pointermove',{clientX:r.left+r.width*.8,clientY:r.top+r.height*.3}));})()`);await delay(100);assert.equal(await evaluate(`document.querySelector('.project-card').classList.contains('is-tilting')`),true);await evaluate(`document.querySelector('.project-card').dispatchEvent(new PointerEvent('pointerleave'))`);assert.equal(await evaluate(`document.querySelector('.project-card').classList.contains('is-tilting')`),false);}
   await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await delay(100);assert.equal(await evaluate(`getComputedStyle(document.querySelector('.project-cover')).transitionDuration`),'0s');await send('Emulation.setEmulatedMedia',{features:[]});
  }
  const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(`.review/projects-${name}.png`,Buffer.from(screenshot.data,'base64'));
  await evaluate(`document.querySelector('.scroll-top').click()`);await delay(1000);assert.equal(await evaluate(`window.scrollY`),0);
 }
 console.log('PASS: desktop/mobile dropdown languages, LLM descriptions, Escape, nested dialogs, fixed header, scroll effects, images and no horizontal overflow.');
 await send('Browser.close');
}finally{socket?.close();chrome.kill();}
