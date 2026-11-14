import './style.css';
import './editorial.css';
import source from '../design/quests.json';

type Progress = {scene:number;step:number;total:number;updated:number;completed:boolean};
const base=import.meta.env.BASE_URL;
const app=document.querySelector<HTMLDivElement>('#app')!;
const icon='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const lock='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" stroke="currentColor" stroke-width="1.4"/></svg>';
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function progress(week:number):Progress|null{try{return JSON.parse(localStorage.getItem(`journey-progress-${week}`)||'null')}catch{return null}}
const sceneCounts=[20,16,18,14,23,29,47,50];
const art=['cabin','cave','grove'];
const labels=['숲 속 오두막','영혼의 얼음 동굴','수확의 숲'];
const summaries=['폴더를 연결하고, 나만의 규칙을 새깁니다.','자료를 읽고 검증하는 시종을 만듭니다.','기획부터 결과물까지, 시종을 이어 갑니다.'];
let view:'all'|'records'='all';

function render(){
 const history=source.quests.map(q=>({q,p:progress(q.week)})).filter(x=>x.p).sort((a,b)=>b.p!.updated-a.p!.updated);
 const recent=history[0];
 const done=history.filter(x=>x.p!.completed).length;
 app.innerHTML=`
  <a class="skip-link" href="#journey">본문으로 바로가기</a>
  <div class="masthead"><div class="page-wrap">
   <header class="site-header">
    <a class="brand" href="./" aria-label="클로드 정복 퀘스트 홈"><img src="${base}assets/compass.svg" alt="" width="34" height="34"/><span>CLAUDE<span class="brand-sub">FIELD NOTES</span></span></a>
    <nav aria-label="주 메뉴"><button data-view="all" class="${view==='all'?'active':''}" ${view==='all'?'aria-current="page"':''}>전체 지도</button><button data-view="records" class="${view==='records'?'active':''}" ${view==='records'?'aria-current="page"':''}>나의 기록 <span class="nav-dot">${history.length?history.length:'·'}</span></button></nav>
    <span class="edition">A LEARNING EXPEDITION<span>SEASON 01 / 2026</span></span>
   </header></div></div>

   <main id="journey">
    <section class="cover-shell" aria-labelledby="hero-title"><div class="page-wrap hero-section">
     <div class="hero-copy">
      <div class="eyebrow"><span class="tiny-line"></span> SEASON 1 · 8 WEEKS</div>
      <h1 id="hero-title" aria-label="클로드 정복 퀘스트">클로드<br/>정복 <span>퀘스트</span><span class="title-period">.</span></h1>
      <p class="hero-description">장비를 갖추고, 시종을 만들고, 부대를 지휘하는<br class="desktop-break"/> 여덟 번의 여정. 나만의 탐험 기록을 펼쳐 보세요.</p>
      <div class="hero-actions"><a class="primary-link" href="${base}lessons/week-${recent?.q.week||1}.html">${recent&&!recent.p!.completed?'이어서 탐험하기':'여정 시작하기'} ${icon}</a><a class="index-shortcut" href="#quests">전체 지도 보기 ↓</a></div>
      <div class="hero-stats"><div><strong>08</strong><span>주차 개방</span></div><i></i><div><strong>03</strong><span>이야기의 막</span></div><i></i><div><strong>${String(done).padStart(2,'0')}</strong><span>마친 여정</span></div></div>
     </div>
     <figure class="hero-art"><div class="figure-label"><span>THE ADVENTURE BEGINS</span><span>FIG. 01</span></div><img src="${base}assets/cabin.webp" alt="숲 속 오두막과 열린 탐험 기록집, 길을 따라 이어지는 낮의 풍경" fetchpriority="high" width="1536" height="1024"/><figcaption><span>모든 여정은, 첫 장을 펼치는 것에서.</span><svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2v36M2 20h36M7 7l26 26M7 33 33 7" stroke="currentColor" stroke-width=".7"/><circle cx="20" cy="20" r="10" stroke="currentColor" stroke-width=".7"/></svg></figcaption></figure>
    </div></section>
    <div class="page-wrap content-wrap">

    <aside class="guide-note"><div class="guide-portrait"><img src="${base}assets/fairy.webp" alt="" width="88" height="75"/></div><span class="guide-name">길잡이 페어리<span>YOUR COMPANION</span></span><p>“지난 퀘스트는 전부 여기 있어요.<br class="mobile-break"/> 다시 하고 싶은 주를 골라서 들어가세요.”</p><span class="guide-spark" aria-hidden="true">✳</span></aside>

    <section class="quest-index" id="quests" aria-labelledby="index-title">
     <div class="section-heading"><div><span class="eyebrow">THE JOURNEY</span><h2 id="index-title">${view==='all'?'여정의 전체 지도':'내가 펼친 기록'}</h2></div><span class="section-count">${view==='all'?'8 / 8 주차 개방':`${history.length}개 주차의 기록`}<span class="index-line"></span></span></div>
     ${source.acts.map((act,ai)=>{
       const quests=source.quests.filter(q=>act.weeks.includes(q.week)&&(view==='all'||progress(q.week)));
       if(!quests.length)return '';
       return `<section class="act-section act-${ai}" aria-labelledby="act-${act.id}"><div class="act-intro"><div class="act-kicker"><span>ACT ${act.id}</span><span>${act.range}</span></div><h3 id="act-${act.id}">${act.title}</h3><p>${summaries[ai]}</p><figure><img src="${base}assets/${art[ai]}.webp" alt="${labels[ai]}의 새로운 탐험 일러스트" loading="lazy" width="1536" height="1024"/><figcaption>${labels[ai]} <span>↗</span></figcaption></figure></div><ol class="quest-list" start="${quests[0].week}">${quests.map(q=>{
        const p=progress(q.week);const state=p?.completed?'여정 완료':p?'탐험 중':'입장';
        return `<li><a class="quest-card ${p?'visited':''} ${p?.completed?'completed':''}" href="${base}lessons/week-${q.week}.html"><span class="quest-number">${String(q.week).padStart(2,'0')}</span><div class="quest-info"><span class="quest-meta">WEEK ${String(q.week).padStart(2,'0')}<span>·</span>${q.location}</span><h4>${esc(q.title)}</h4><span class="quest-detail">${p?`${p.step} / ${p.total}장면 · ${p.completed?'마지막 장까지 도착했어요':'기록한 곳에서 이어집니다'}`:`${sceneCounts[q.week-1]}개의 장면으로 떠나는 여정`}</span>${p?`<span class="card-progress" aria-label="진행률 ${Math.round(p.step/p.total*100)}%"><i style="width:${Math.min(100,p.step/p.total*100)}%"></i></span>`:''}</div><span class="quest-enter">${state}<span class="enter-arrow">${p?.completed?'✓':icon}</span></span></a></li>`
       }).join('')}</ol></section>`;
     }).join('')}
     ${view==='records'&&!history.length?`<div class="empty-records"><img src="${base}assets/compass.svg" alt="" width="44" height="44"/><h3>아직 펼치지 않은 여정</h3><p>첫 주차에 입장하면 이곳에 탐험 기록이 남습니다.</p><a href="${base}lessons/week-1.html">첫 장 펼치기 →</a></div>`:''}
    </section>
    ${view==='all'?`<section class="final-quest" aria-labelledby="final-title"><span class="final-symbol">${lock}</span><div><span class="eyebrow">THE FINAL QUEST</span><h3 id="final-title">${esc(source.finalQuest.title)}</h3><p>${source.finalQuest.subtitle}</p></div><span class="locked-tag">잠김 ${lock}</span></section>`:''}
    <div class="closing-line"><span>한 주씩, 한 장씩. 나의 일이 되는 클로드.</span><img src="${base}assets/compass.svg" alt="" width="24" height="24"/></div>
    </div>
   </main>
   <div class="page-wrap">
   <footer class="site-footer"><span>CLAUDE / FIELD NOTES</span><span>SEASON 01 · THE COMPLETE JOURNEY</span><a href="#journey" aria-label="맨 위로">BACK TO TOP ↑</a></footer>
  </div>`;
 for(const button of app.querySelectorAll<HTMLButtonElement>('[data-view]'))button.addEventListener('click',()=>{view=button.dataset.view as typeof view;render();document.getElementById('quests')?.scrollIntoView({behavior:'smooth'})});
}
render();
window.addEventListener('pageshow',event=>{if(event.persisted)render()});
window.addEventListener('storage',render);
