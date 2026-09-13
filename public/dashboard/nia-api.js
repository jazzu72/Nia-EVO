/* NIA · Capital Observatory — data layer */
const API = {
  async capital(){ try{ return await (await fetch('/api/capital/hunt')).json(); } catch { return { summary:{}, opportunities:[] }; } },
  async health(){ try{ return await (await fetch('/api/capital/health')).json(); } catch { return { ok:false }; } },
  async owner(){ try{ return await (await fetch('/api/owner/grant-drafts')).json(); } catch { return { drafts:[] }; } }
};

const LOCKS = [
  ["submissionAllowed","Submission",false],
  ["signingAllowed","Signing",false],
  ["financialExecutionAllowed","Financial writes",false],
  ["moneyMovementAllowed","Money movement",false],
  ["automaticApprovalAllowed","Auto-approval",false],
  ["ownerApprovalRequired","Owner approval",true],
  ["ownerSignatureRequired","Owner signature",true],
];

function fmtMoney(n){
  if(n==null||n===0) return '$0';
  if(n>=1e9) return '$'+(n/1e9).toFixed(2)+'B';
  if(n>=1e6) return '$'+(n/1e6).toFixed(2)+'M';
  if(n>=1e3) return '$'+(n/1e3).toFixed(1)+'K';
  return '$'+Math.round(n);
}
function fmtInt(n){ return (n==null?0:n).toLocaleString(); }
function fmtSerif(n){
  if(n==null||n===0) return '<span class="currency">$</span>0';
  if(n>=1e9) return '<span class="currency">$</span>'+(n/1e9).toFixed(2)+'B';
  if(n>=1e6) return '<span class="currency">$</span>'+(n/1e6).toFixed(2)+'M';
  if(n>=1e3) return '<span class="currency">$</span>'+(n/1e3).toFixed(1)+'K';
  return '<span class="currency">$</span>'+Math.round(n);
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function setHTML(sel,v){ document.querySelectorAll(sel).forEach(el=>{ el.innerHTML=v; }); }
function setText(sel,v){ document.querySelectorAll(sel).forEach(el=>{ el.textContent=v; }); }

let START_TIME = Date.now();

function tickClock(){
  const el = document.querySelector('[data-clock]');
  if(el){
    const d = new Date();
    const utc = d.toISOString().slice(11,19);
    el.textContent = utc;
  }
  const up = document.querySelector('[data-uptime]');
  if(up){
    const s = Math.floor((Date.now()-START_TIME)/1000);
    const h = String(Math.floor(s/3600)).padStart(2,'0');
    const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    up.textContent = `${h}:${m}:${ss}`;
  }
}

function renderTicker(s){
  const parts = [
    'NIA CAPITAL OBSERVATORY',
    `${fmtMoney(s.total_amount)} AVAILABLE`,
    `${fmtInt(s.total_opportunities)} OPPORTUNITIES`,
    `${fmtInt(s.by_lane?.grants||0)} GRANTS`,
    `${fmtInt(s.by_lane?.customer_revenue||0)} CUSTOMER REVENUE`,
    'CERTIFIED · CONTROLLED',
    'EVIDENCE GATE ENFORCED',
    'FINANCIAL WRITES BLOCKED',
  ];
  const html = parts.map(p=>`<span>${esc(p)}</span><span class="tick-sep">◆</span>`).join('');
  // Double it for seamless loop
  const track = document.querySelector('[data-ticker]');
  if(track) track.innerHTML = html + html;
}

function renderTape(opps){
  const el = document.querySelector('[data-tape]');
  if(!el) return;
  if(!opps.length){ el.innerHTML='<div class="tape-empty">No opportunities in tape</div>'; return; }

  const sorted = opps.slice().sort((a,b)=>(b.amount||0)-(a.amount||0)).slice(0,40);
  el.innerHTML = sorted.map(o=>{
    const status = (o.status||o.state||'queued').toLowerCase();
    const conf = o.probability != null ? Math.round(o.probability*100) : null;
    const entity = o.organization || o.title || 'Unnamed';
    const sub = o.source ? `${esc(o.source)} · ${esc(o.lane||'')}` : esc(o.lane||'');
    const amount = o.amount != null ? fmtMoney(o.amount) : '—';
    return `<div class="tape-row" data-status="${esc(status)}">
      <div class="tape-status-bar"></div>
      <div>
        <div class="tape-entity">${esc(entity)}</div>
        <div class="tape-entity-sub">${sub}</div>
      </div>
      <div class="tape-lane">${esc((o.lane||'').replace(/_/g,' '))}</div>
      <div class="tape-amount${o.amount? '':' dim'}">${amount}</div>
      <div class="tape-conf">${conf!=null?`<span class="tape-conf-bar" style="--w:${conf}%"></span>${conf}%`:'—'}</div>
    </div>`;
  }).join('');
}

function renderLanes(opps, byLane){
  const el = document.querySelector('[data-lanes]');
  if(!el) return;
  const allLanes = [
    'grants','customer_revenue','enterprise_sales','government_contracts',
    'corporate_sponsorships','strategic_partnerships','accelerators',
    'economic_development','research_development','strategic_financing'
  ];
  const counts = byLane || {};
  el.innerHTML = allLanes.map(lane=>{
    const count = counts[lane] || 0;
    const total = opps.filter(o=>o.lane===lane).reduce((a,o)=>a+(o.amount||0),0);
    const cls = count>0 ? 'lane-card active' : 'lane-card empty';
    return `<div class="${cls}">
      <div class="lane-name">${esc(lane.replace(/_/g,' '))}</div>
      <div class="lane-count">${count}</div>
      <div class="lane-value">${count>0 ? fmtMoney(total) : '—'}</div>
    </div>`;
  }).join('');
}

function renderLocks(owner){
  const el = document.querySelector('[data-locks]');
  if(!el) return;
  el.innerHTML = LOCKS.map(([key,label,expected])=>{
    const actual = owner?.[key];
    const ok = actual === expected;
    const cls = ok ? 'active' : 'bad';
    const glyph = ok ? '●' : '■';
    const state = actual === true ? 'ON' : actual === false ? 'OFF' : '—';
    return `<li class="lock-item ${cls}">
      <span class="lock-glyph">${glyph}</span>
      <span class="lock-name">${esc(label)}</span>
      <span class="lock-state">${state}</span>
    </li>`;
  }).join('');
}

function renderOwner(owner){
  const el = document.querySelector('[data-owner]');
  const cnt = document.querySelector('[data-owner-count]');
  const drafts = owner?.drafts || [];
  if(cnt) cnt.textContent = `${drafts.length} pending`;
  if(!el) return;
  if(!drafts.length){ el.innerHTML='<div class="tape-empty">Queue empty</div>'; return; }
  el.innerHTML = drafts.slice(0,8).map(d=>`
    <div class="owner-item">
      <div class="owner-entity">${esc((d.opportunity?.title||d.draftId||'').slice(0,64))}</div>
      <div class="owner-meta">
        <span>${esc(d.preparationStatus||'pending')}</span>
        <span class="owner-status">${esc(d.nextAction||'REVIEW')}</span>
      </div>
    </div>
  `).join('');
}

function renderPulse(health){
  const dot = document.querySelector('[data-pulse-dot]');
  const status = document.querySelector('[data-pulse-status]');
  const detail = document.querySelector('[data-pulse-detail]');
  if(health.ok){
    if(dot) dot.classList.remove('offline');
    if(status) status.textContent = 'Operational';
    if(detail) detail.textContent = `Engine · ${health.engine||'NIA'} · ${health.lanes||'?'} lanes`;
  } else {
    if(dot) dot.classList.add('offline');
    if(status) status.textContent = 'Degraded';
    if(detail) detail.textContent = 'Engine handshake failed';
  }
}

async function refresh(){
  const [capital, health, owner] = await Promise.all([API.capital(), API.health(), API.owner()]);
  const s = capital.summary || {};
  const opps = capital.opportunities || [];

  setHTML('[data-kpi="total"]', fmtSerif(s.total_amount));
  setText('[data-kpi="grants"]', fmtMoney(opps.filter(o=>o.lane==='grants').reduce((a,o)=>a+(o.amount||0),0)));
  setText('[data-kpi="opps"]', fmtInt(s.total_opportunities));
  setText('[data-kpi="pending"]', fmtInt((owner.drafts||[]).length));
  setText('[data-kpi="lanes"]', String(Object.keys(s.by_lane||{}).length));

  const meta = document.querySelector('[data-tape-meta]');
  if(meta) meta.textContent = `${opps.length} entries · live`;

  renderTicker(s);
  renderTape(opps);
  renderLanes(opps, s.by_lane);
  renderLocks(owner);
  renderOwner(owner);
  renderPulse(health);
}

document.addEventListener('DOMContentLoaded', ()=>{
  START_TIME = Date.now();
  tickClock(); setInterval(tickClock, 1000);
  refresh();
  setInterval(refresh, 20000);
});
