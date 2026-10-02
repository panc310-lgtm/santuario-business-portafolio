(() => {
  'use strict';
  const companies=JSON.parse(document.querySelector('#portfolio-data').textContent);
  const story=document.querySelector('.scroll-story'),stage=document.querySelector('.story-stage'),deck=document.querySelector('.deck');
  const cards=[...document.querySelectorAll('.company-card')],links=cards.map(card=>card.querySelector('.card-link'));
  const copy=document.querySelector('#active-copy'),activeLink=document.querySelector('#active-link');
  const controls=[...document.querySelectorAll('[data-goto]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),printing=matchMedia('print');
  const lifetime=new AbortController(),options={signal:lifetime.signal};
  let motion=false,active=-1,travel=0,frame=0,resizeFrame=0,touch=null,suppressTouchUntil=0;
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
    const progress=clamp(-story.getBoundingClientRect().top/travel)*3;
    const index=Math.min(3,Math.floor(progress+.5));updateCopy(index);
    const mobile=innerWidth<=900,depth=mobile?26:58;
    cards.forEach((card,i)=>{
      const distance=i-progress;
      let y,scale,opacity;
      if(distance>=0){y=-distance*depth;scale=Math.pow(.88,distance);opacity=1;}
      else {const exit=-distance;y=exit*(deck.clientHeight*.95+Math.min(deck.clientHeight,deck.clientWidth*.563)*.35);scale=1+Math.min(exit,1)*.05;opacity=clamp((1-exit)/.42);}
      card.style.transform='translate3d(0,'+y.toFixed(2)+'px,0) scale('+scale.toFixed(4)+')';
      card.style.opacity=String(opacity);card.style.visibility=opacity>.005?'visible':'hidden';
    });
    window.__portfolio.progress=progress;
  }
  function requestPaint(){if(motion&&!frame)frame=requestAnimationFrame(paint);if(touch)touch.moved=true;}
  function listMode(reason){
    motion=false;document.body.classList.remove('story-motion');story.style.removeProperty('--story-height');
    cards.forEach((card,i)=>{card.removeAttribute('aria-hidden');card.inert=false;card.style.removeProperty('transform');card.style.removeProperty('opacity');card.style.removeProperty('visibility');links[i].style.removeProperty('pointer-events');links[i].style.removeProperty('max-width');});
    window.__portfolio.mode='list';window.__portfolio.reason=reason;window.__portfolio.travel=0;
  }
  function configure(){
    resizeFrame=0;
    const wasMotion=motion,previousProgress=window.__portfolio.progress;
    if(reduced.matches||printing.matches){listMode(reduced.matches?'reduced-motion':'print');return;}
    if(innerHeight<(innerWidth<=900?800:700)){listMode('short-viewport');return;}
    motion=true;document.body.classList.add('story-motion');
    travel=3*Math.max(640,innerHeight*.9);story.style.setProperty('--story-height',(innerHeight+travel)+'px');
    links.forEach(link=>link.style.maxWidth=Math.min(deck.clientWidth,deck.clientHeight*1672/941)+'px');
    // Measure the longest copy without changing the active card or its focus.
    copy.style.removeProperty('min-height');
    const measurement=copy.cloneNode(true),minimum=parseFloat(getComputedStyle(copy).minHeight)||0;
    measurement.removeAttribute('id');measurement.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'));
    measurement.classList.remove('copy-enter');measurement.inert=true;measurement.setAttribute('aria-hidden','true');
    Object.assign(measurement.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:copy.clientWidth+'px',minHeight:'0',left:'0',top:'0'});
    copy.parentElement.append(measurement);
    let maximum=minimum;
    for(const company of companies){
      measurement.querySelector('h2').textContent=company.name;
      measurement.querySelector('.company-link').textContent=company.linkLabel;
      const description=measurement.querySelector('div'),paragraphs=[];
      for(const [className,text] of [['company-context',company.context],['project-description',company.description],['project-note',company.note]]){
        if(!text)continue;const p=document.createElement('p');p.className=className;p.textContent=text;paragraphs.push(p);
      }
      description.replaceChildren(...paragraphs);maximum=Math.max(maximum,measurement.getBoundingClientRect().height);
    }
    measurement.remove();copy.style.minHeight=Math.ceil(maximum)+'px';
    const showcase=document.querySelector('.showcase'),style=getComputedStyle(showcase);
    const rows=document.querySelector('.introduction').offsetHeight+document.querySelector('.active-details').offsetHeight+(parseFloat(style.rowGap)||0);
    const padding=(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0);
    const minimumDeck=parseFloat(getComputedStyle(deck).minHeight)||0;
    const needed=innerWidth<=900?rows+minimumDeck+(parseFloat(style.rowGap)||0)+padding:Math.max(rows,minimumDeck)+padding;
    const fits=needed<=showcase.clientHeight+2;
    if(!fits){listMode('content-height');return;}
    if(!wasMotion){const current=active<0?0:active;active=-1;updateCopy(current);}
    links.forEach(link=>link.style.maxWidth=Math.min(deck.clientWidth,deck.clientHeight*1672/941)+'px');
    window.__portfolio.mode='scroll';window.__portfolio.reason='';window.__portfolio.travel=travel;
    if(wasMotion){const top=scrollY+story.getBoundingClientRect().top;scrollTo({top:top+travel*previousProgress/3,behavior:'instant'});}
    paint();
  }
  function resize(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(configure);}
  controls.forEach(button=>button.addEventListener('click',()=>{
    if(!motion)return;const top=scrollY+story.getBoundingClientRect().top;
    scrollTo({top:top+travel*Number(button.dataset.goto)/3,behavior:'smooth'});
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
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);lifetime.abort();},{once:true});
  updateCopy(0);configure();
})();
