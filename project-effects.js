/* Pointer effects use animation frames; touch and reduced-motion retain static cards. */
(function(){
 'use strict';
 const root=document.getElementById('site-root');if(!root)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const header=root.querySelector('.header'),top=root.querySelector('.scroll-top');
 let scrollFrame=0;
 const paintScroll=()=>{scrollFrame=0;header?.classList.toggle('is-scrolled',window.scrollY>30);if(top){const total=document.documentElement.scrollHeight-window.innerHeight;const progress=total>0?Math.min(1,Math.max(0,window.scrollY/total)):0;top.style.setProperty('--scroll-angle',progress*360+'deg');}};
 const onScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paintScroll);};
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});paintScroll();
 root.querySelectorAll('.project-card').forEach(card=>{
  let frame=0,px=.5,py=.5;
  function reset(){cancelAnimationFrame(frame);frame=0;card.classList.remove('is-tilting');card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');card.style.removeProperty('--image-x');card.style.removeProperty('--image-y');}
  card.addEventListener('pointermove',event=>{
   if(reduced.matches||!fine.matches)return;
   const bounds=card.getBoundingClientRect();px=Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width));py=Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height));
   if(frame)return;frame=requestAnimationFrame(()=>{frame=0;card.classList.add('is-tilting');card.style.setProperty('--tilt-x',(0.5-py)*5+'deg');card.style.setProperty('--tilt-y',(px-0.5)*5+'deg');card.style.setProperty('--image-x',px*100+'%');card.style.setProperty('--image-y',py*100+'%');});
  });
  card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset);reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
 });
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>entry.target.classList.toggle('art-in-view',entry.isIntersecting));},{threshold:.15});root.querySelectorAll('.project-art-image').forEach(art=>observer.observe(art));}
 window.addEventListener('pagehide',()=>cancelAnimationFrame(scrollFrame),{once:true});
})();
