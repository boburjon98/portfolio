import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {parse}=require('next/dist/compiled/node-html-parser');
const dom=parse(readFileSync('_markup.html','utf8'));
const root=dom.querySelector('#site-root');
const events=new WeakMap();
for(const element of root.querySelectorAll('*')){
 element.dataset={category:element.getAttribute('data-category'),filter:element.getAttribute('data-filter')};
 element.addEventListener=(type,fn)=>{const map=events.get(element)||{};(map[type]??=[]).push(fn);events.set(element,map);};
 element.hidden=element.hasAttribute('hidden');
}
const html={lang:'en'};
const windowEvents={};let scrollOptions;
const window={scrollY:0,addEventListener:(name,fn)=>{windowEvents[name]=fn;},scrollTo:options=>{scrollOptions=options;}};
runInNewContext(readFileSync('presentation.js','utf8'),{window,matchMedia:()=>({matches:false}),document:{getElementById:id=>id==='site-root'?root:null,documentElement:html},MutationObserver:class{observe(){}},navigator:{}});
const search=root.querySelector('#project-search');
const cards=root.querySelectorAll('.project-card');
const count=()=>cards.filter(c=>!c.hidden).length;
const fire=(el,type)=>{for(const fn of events.get(el)?.[type]||[])fn();};
const choose=category=>fire(root.querySelector(`[data-filter="${category}"]`),'click');
assert.equal(cards.length,11);assert.equal(count(),11);assert.equal(root.querySelector('.project-empty').hidden,true);
for(const [category,expected]of Object.entries({multimodal:1,voice:1,vision:4,infra:1,documents:1,search:2,analytics:1})){choose(category);assert.equal(count(),expected,category);}
choose('all');search.value='qdrant';fire(search,'input');assert.equal(count(),2);
search.value='no-such-project';fire(search,'input');assert.equal(count(),0);assert.equal(root.querySelector('.project-empty').hidden,false);
choose('all');assert.equal(search.value,'');assert.equal(count(),11);assert.equal(root.querySelector('.project-empty').hidden,true);
console.log('PASS: 11 projects, all 7 categories, keyword search, empty state and All projects reset.');
const top=root.querySelector('.scroll-top');
assert.ok(top);assert.equal(top.hidden,true);window.scrollY=150;windowEvents.scroll();assert.equal(top.hidden,false);fire(top,'click');assert.equal(scrollOptions.top,0);assert.equal(scrollOptions.behavior,'smooth');window.scrollY=0;windowEvents.scroll();assert.equal(top.hidden,true);
console.log('PASS: back-to-top appears after scroll, scrolls to top and hides at the top.');
