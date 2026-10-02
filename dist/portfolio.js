(() => {
  'use strict';
  const companies=JSON.parse(document.querySelector('#portfolio-data').textContent);
  const story=document.querySelector('.scroll-story'),stage=document.querySelector('.story-stage'),deck=document.querySelector('.deck');
  const cards=[...document.querySelectorAll('.company-card')],links=cards.map(card=>card.querySelector('.card-link'));
  const copy=document.querySelector('#active-copy'),activeLink=document.querySelector('#active-link');
  const controls=[...document.querySelectorAll('[data-goto]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),printing=matchMedia('print');
  const lifetime=new AbortController(),options={signal:lifetime.signal};
  let motion=false,active=-1,travel=0,frame=0,resizeFrame=0,layoutFrame=0,touch=null,suppressTouchUntil=0,layoutWidth=0,layoutHeight=0;
  const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
  window.__portfolio={mode:'list',index:0,active:companies[0].id,progress:0,travel:0,companies};
  companies.forEach((company,i)=>{
    links[i].href=company.url;
    cards[i].querySelector('.company-link').href=company.url;
  });
  function updateCopy(index){
    if(index===active)return;
    const previous=active,moveFocus=previous>=0&&cards[previous].contains(document.activeElement);active=index;
    const company=companies[index];
    document.querySelector('#active-number').textContent='0'+(index+1)+' / 04';
    document.querySelector('#active-name').textContent=company.name;
    const description=document.querySelector('#active-description'),paragraphs=[];
    for(const [className,text] of [['company-context',company.context],['project-description',company.description],['project-note',company.note]]){
      if(!text)continue;const p=document.createElement('p');p.className=className;p.textContent=text;paragraphs.push(p);
    }
    description.replaceChildren(...paragraphs);
    copy.scrollTop=0;
    activeLink.href=company.url;activeLink.textContent=company.linkLabel;
    activeLink.setAttribute('aria-label',company.linkLabel.replace(' ↗','')+': '+company.name+'. Abre en otra pestaña.');
    controls.forEach(button=>{if(Number(button.dataset.goto)===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    cards.forEach((card,i)=>{
      card.inert=motion&&i!==index;
      if(motion)card.setAttribute('aria-hidden',String(i!==index));else card.removeAttribute('aria-hidden');
      links[i].style.pointerEvents=motion&&i!==index?'none':'';
    });
    if(moveFocus)links[index].focus({preventScroll:true});
    if(motion&&!reduced.matches){copy.classList.remove('copy-enter');void copy.offsetWidth;copy.classList.add('copy-enter');}
    window.__portfolio.index=index;window.__portfolio.active=company.id;
  }
  function paint(){
    frame=0;if(!motion)return;
    const progress=clamp(-story.getBoundingClientRect().top/travel)*(cards.length-1);
    const index=Math.min(cards.length-1,Math.floor(progress+.5));updateCopy(index);
    // Reduced motion keeps the same gallery, with discrete card changes.
    const visualProgress=reduced.matches?index:progress;
    const mobile=innerWidth<=900,depth=mobile?26:58;
    cards.forEach((card,i)=>{
      const distance=i-visualProgress;
      let y,scale,opacity;
      if(distance>=0){y=-distance*depth;scale=Math.pow(.88,distance);opacity=1;}
      else {const exit=-distance;y=exit*(deck.clientHeight*.95+Math.min(deck.clientHeight,deck.clientWidth*.563)*.35);scale=1+Math.min(exit,1)*.05;opacity=clamp((1-exit)/.42);}
      card.style.transform='translate3d(0,'+y.toFixed(2)+'px,0) scale('+scale.toFixed(4)+')';
      card.style.opacity=String(opacity);card.style.visibility=opacity>.005?'visible':'hidden';
    });
    window.__portfolio.progress=progress;window.__portfolio.reducedMotion=reduced.matches;
  }
  function requestPaint(){if(motion&&!frame)frame=requestAnimationFrame(paint);if(touch)touch.moved=true;}
  function listMode(reason){
    motion=false;document.body.classList.remove('story-motion');story.style.removeProperty('--story-height');
    cards.forEach((card,i)=>{card.removeAttribute('aria-hidden');card.inert=false;card.style.removeProperty('transform');card.style.removeProperty('opacity');card.style.removeProperty('visibility');links[i].style.removeProperty('pointer-events');links[i].style.removeProperty('width');});
    window.__portfolio.mode='list';window.__portfolio.reason=reason;window.__portfolio.travel=0;
  }
  function configure(){
    resizeFrame=0;
    const wasMotion=motion,previousProgress=window.__portfolio.progress;
    const previousTop=story.getBoundingClientRect().top;
    const inStory=wasMotion&&previousTop<=0&&-previousTop<=travel+2;
    if(printing.matches){listMode('print');return;}
    motion=true;document.body.classList.add('story-motion');
    // The CSS viewport stays stable as a mobile browser's address bar moves.
    layoutWidth=innerWidth;layoutHeight=stage.clientHeight;
    travel=(cards.length-1)*Math.max(480,layoutHeight*.9);
    story.style.setProperty('--story-height',(layoutHeight+travel)+'px');
    if(!wasMotion){const current=active<0?0:active;active=-1;updateCopy(current);}
    links.forEach(link=>link.style.width=Math.min(deck.clientWidth,deck.clientHeight*1672/941)+'px');
    window.__portfolio.mode='scroll';window.__portfolio.reason='';window.__portfolio.travel=travel;window.__portfolio.layoutHeight=layoutHeight;
    if(inStory){const top=scrollY+story.getBoundingClientRect().top;scrollTo({top:top+travel*previousProgress/(cards.length-1),behavior:'instant'});}
    paint();
    // WebKit can settle viewport units one frame after the scene class changes.
    // Recheck the measured stage instead of keeping the initial list's height.
    cancelAnimationFrame(layoutFrame);
    layoutFrame=requestAnimationFrame(()=>{
      layoutFrame=0;
      if(motion&&(stage.clientHeight!==layoutHeight||innerWidth!==layoutWidth))configure();
    });
  }
  function resize(){
    cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{
      resizeFrame=0;
      if(innerWidth===layoutWidth&&stage.clientHeight===layoutHeight){requestPaint();return;}
      configure();
    });
  }
  controls.forEach(button=>button.addEventListener('click',()=>{
    if(!motion)return;const top=scrollY+story.getBoundingClientRect().top;
    scrollTo({top:top+travel*Number(button.dataset.goto)/(cards.length-1),behavior:reduced.matches?'instant':'smooth'});
  },options));
  links.forEach((link,i)=>{
    link.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touch={x:e.clientX,y:e.clientY,moved:false};},{...options,passive:true});
    link.addEventListener('pointermove',e=>{if(touch&&Math.hypot(e.clientX-touch.x,e.clientY-touch.y)>8)touch.moved=true;},{...options,passive:true});
    link.addEventListener('pointercancel',()=>{if(touch){suppressTouchUntil=performance.now()+500;touch=null;}},options);
    link.addEventListener('pointerup',()=>{if(touch?.moved)suppressTouchUntil=performance.now()+500;touch=null;},options);
    link.addEventListener('click',e=>{if((motion&&i!==active)||(e.detail!==0&&performance.now()<suppressTouchUntil))e.preventDefault();},options);
  });
  addEventListener('scroll',requestPaint,{...options,passive:true});addEventListener('resize',resize,options);
  reduced.addEventListener('change',configure,options);printing.addEventListener('change',configure,options);
  addEventListener('pagehide',event=>{
    cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);cancelAnimationFrame(layoutFrame);frame=0;resizeFrame=0;layoutFrame=0;
    if(!event.persisted)lifetime.abort();
  },options);
  addEventListener('pageshow',event=>{if(event.persisted)configure();},options);
  addEventListener('load',configure,options);
  updateCopy(0);configure();
})();
