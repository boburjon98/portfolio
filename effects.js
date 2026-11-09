/* Decorative effects respect motion preferences and pause outside the viewport. */
(function(){
  'use strict';
  const root=document.getElementById('site-root');
  if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const progress=root.querySelector('.reading-progress');
  const updateProgress=()=>{if(progress){const distance=document.documentElement.scrollHeight-innerHeight;progress.style.width=(distance>0?scrollY/distance*100:0)+'%';}};
  addEventListener('scroll',updateProgress,{passive:true});updateProgress();
  root.querySelectorAll('.expertise-card').forEach(card=>card.addEventListener('pointermove',event=>{if(reduced.matches)return;const bounds=card.getBoundingClientRect();card.style.setProperty('--card-x',event.clientX-bounds.left+'px');card.style.setProperty('--card-y',event.clientY-bounds.top+'px');}));
  const output=root.querySelector('.typed-code');
  const commands=['from ideas import intelligence','model = load_model("local-model")','context = knowledge.retrieve(query)','response = model.generate(context)','deploy(ai, privacy="local")'];
  let timer,command=0,letter=0,deleting=false;
  function type(){
    if(!output||reduced.matches)return;
    if(document.hidden){timer=setTimeout(type,800);return;}
    const value=commands[command];letter+=deleting?-1:1;output.textContent=value.slice(0,letter);
    let delay=deleting?28:55;
    if(!deleting&&letter===value.length){deleting=true;delay=2300;}
    else if(deleting&&letter===0){deleting=false;command=(command+1)%commands.length;delay=350;}
    timer=setTimeout(type,delay);
  }
  if(output&&!reduced.matches){output.textContent='';type();}
  const canvas=root.querySelector('.neural-background');
  if(!canvas||reduced.matches)return;
  const context=canvas.getContext('2d');if(!context)return;
  let width=0,height=0,points=[],frame=0,last=0;
  const pointer={x:-1000,y:-1000};
  function resize(){width=root.clientWidth;height=Math.min(1050,innerHeight+300);const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;canvas.style.height=height+'px';context.setTransform(ratio,0,0,ratio,0,0);points=Array.from({length:width<700?24:55},()=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22}));}
  addEventListener('resize',resize,{passive:true});
  root.addEventListener('pointermove',event=>{const bounds=root.getBoundingClientRect();pointer.x=event.clientX-bounds.left;pointer.y=event.clientY-bounds.top;},{passive:true});
  root.addEventListener('pointerleave',()=>{pointer.x=-1000;pointer.y=-1000;});
  function draw(time){
    frame=requestAnimationFrame(draw);
    if(document.hidden||scrollY>height||time-last<33||reduced.matches)return;last=time;
    context.clearRect(0,0,width,height);const light=root.dataset.theme==='light';
    points.forEach((p,index)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>width)p.vx*=-1;if(p.y<0||p.y>height)p.vy*=-1;
      context.fillStyle=light?'rgba(24,117,96,.35)':'rgba(132,235,199,.45)';context.beginPath();context.arc(p.x,p.y,1.5,0,Math.PI*2);context.fill();
      for(let j=index+1;j<points.length;j++){const q=points[j],distance=Math.hypot(p.x-q.x,p.y-q.y);if(distance<155){context.strokeStyle=light?'rgba(24,117,96,'+(1-distance/155)*.16+')':'rgba(132,200,235,'+(1-distance/155)*.19+')';context.beginPath();context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.stroke();}}
      const distance=Math.hypot(p.x-pointer.x,p.y-pointer.y);if(distance<190){context.strokeStyle='rgba(125,226,198,'+(1-distance/190)*.4+')';context.beginPath();context.moveTo(p.x,p.y);context.lineTo(pointer.x,pointer.y);context.stroke();}
    });
  }
  resize();frame=requestAnimationFrame(draw);
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);clearTimeout(timer);},{once:true});
})();
