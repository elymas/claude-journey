(() => {
  const week = Number(document.body.dataset.week);
  const toc = document.getElementById('lesson-toc');
  const open = document.getElementById('toc-open');
  const close = document.getElementById('toc-close');
  const slides = [...document.querySelectorAll('section.slide')];
  const key = `journey-progress-${week}`;
  const read = () => {try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
  const previous=read();
  if(previous && Number.isInteger(previous.scene) && previous.scene>=0 && previous.scene<slides.length && !slides[previous.scene].hasAttribute('data-hidden')) window.Journey?.go(previous.scene);
  function toggle(value){toc.hidden=!value;open.setAttribute('aria-expanded',String(value));if(value)close.focus();else open.focus()}
  open.addEventListener('click',()=>toggle(toc.hidden));close.addEventListener('click',()=>toggle(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!toc.hidden){e.stopImmediatePropagation();toggle(false)}} ,true);
  toc.addEventListener('click',event=>{const button=event.target.closest('[data-scene]');if(!button)return;window.Journey?.go(Number(button.dataset.scene));toggle(false);window.scrollTo({top:0,behavior:'instant'})});
  let saved=-1;
  function update(){
    const i=slides.findIndex(s=>s.classList.contains('on'));
    if(i<0||i===saved)return;saved=i;
    for(const b of toc.querySelectorAll('[data-scene]'))b.setAttribute('aria-current',String(Number(b.dataset.scene)===i));
    for(const s of slides)s.setAttribute('aria-hidden',String(!s.classList.contains('on')));
    const flow=slides.filter(s=>!s.hasAttribute('data-hidden'));
    const hidden=slides[i].hasAttribute('data-hidden');
    document.getElementById('prev').disabled=hidden||slides[i]===flow[0];
    document.getElementById('next').disabled=hidden||slides[i]===flow[flow.length-1];
    if(!slides[i].hasAttribute('data-hidden')){
      const visible=slides.filter(s=>!s.hasAttribute('data-hidden'));
      const step=visible.indexOf(slides[i]);
      const data={scene:i,step:step+1,total:visible.length,updated:Date.now(),completed:step===visible.length-1};
      try{localStorage.setItem(key,JSON.stringify(data));localStorage.setItem('journey-last-week',String(week))}catch{}
    }
    if(innerWidth<=760)window.scrollTo({top:0,behavior:'instant'});
  }
  new MutationObserver(update).observe(document.getElementById('stage'),{subtree:true,attributes:true,attributeFilter:['class']});update();
  document.getElementById('prev').textContent='← 이전';
  document.getElementById('next').textContent='다음 →';
  document.getElementById('now').setAttribute('aria-live','polite');
  // Original exercise state is persisted; restore it without replaying combat effects.
  let checks={};try{checks=JSON.parse(localStorage.getItem(document.body.dataset.checkStorage)||'{}')}catch{}
  for(const element of document.querySelectorAll('[data-ck]')){
    const row=element.classList.contains('step')?element:element.parentNode;
    if(checks[element.dataset.ck]){row.classList.add('done');element.setAttribute('aria-pressed','true')}
  }
  window.Journey?.sync();
})();
