/* Portfolio navigation and project discovery. */
(function(){
 'use strict';
 const root=document.getElementById('site-root');if(!root)return;
 const topButton=root.querySelector('.scroll-top');
 const updateTop=()=>{if(topButton)topButton.hidden=window.scrollY<=0;};
 window.addEventListener('scroll',updateTop,{passive:true});updateTop();
 topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
 const strings={en:{search:'Search projects or technologies…',results:n=>`${n} projects`,empty:'No matching projects. Try another keyword or category.',copied:'Copied!',failed:'Select and copy: @bobadmi'},uz:{search:'Loyiha yoki texnologiyani qidirish…',results:n=>`${n} ta loyiha`,empty:'Mos loyiha topilmadi. Boshqa so‘z yoki bo‘limni tanlang.',copied:'Nusxalandi!',failed:'Belgilab nusxalang: @bobadmi'},ru:{search:'Поиск проектов или технологий…',results:n=>`Проектов: ${n}`,empty:'Ничего не найдено. Попробуйте другой запрос или категорию.',copied:'Скопировано!',failed:'Выделите и скопируйте: @bobadmi'}};
 const language=()=>strings[document.documentElement.lang]||strings.en;
 const search=root.querySelector('#project-search'),count=root.querySelector('.project-result-count'),empty=root.querySelector('.project-empty');
 const cards=[...root.querySelectorAll('.project-card')];let category='all';
 if(search)search.value='';
 function filter(){const query=(search?.value||'').trim().toLocaleLowerCase();let visible=0;cards.forEach(card=>{const match=(category==='all'||card.dataset.category===category)&&(!query||card.textContent.toLocaleLowerCase().includes(query));card.hidden=!match;if(match)visible++;});if(count)count.textContent=language().results(visible);if(empty){empty.hidden=visible!==0;empty.textContent=language().empty;}}
 search?.addEventListener('input',filter);
 root.querySelectorAll('.filter-chip').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;if(category==='all'&&search)search.value='';root.querySelectorAll('.filter-chip').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});filter();}));
 function translate(){if(search){search.placeholder=language().search;search.setAttribute('aria-label',language().search);}if(topButton){const label=({en:'Back to top',uz:'Yuqoriga',ru:'Наверх'})[document.documentElement.lang]||'Back to top';topButton.setAttribute('aria-label',label);topButton.title=label;}filter();}
 new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});translate();
 const copy=root.querySelector('.copy-contact'),status=root.querySelector('.copy-status');
 copy?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('@bobadmi');if(status)status.textContent=language().copied;}catch{if(status)status.textContent=language().failed;}});
 const nav=[...root.querySelectorAll('.desktop-nav a')];
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;nav.forEach(link=>{const active=link.hash==='#'+entry.target.id;if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});});},{rootMargin:'-15% 0px -65% 0px'});nav.forEach(link=>{const section=document.getElementById(link.hash.slice(1));if(section)observer.observe(section);});}
})();
