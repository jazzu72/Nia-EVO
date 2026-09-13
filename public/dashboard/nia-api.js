/* ═══════════════════════════════════════════════════════════════
   VITRUVIAN — data layer for the certified NIA Capital OS
   ═══════════════════════════════════════════════════════════════ */

const state = {
  activeTab: 'pulse',
  anatomyOpen: false,
  syncStatus: navigator.onLine ? 'SYNCED' : 'OFFLINE',
  capital: { summary: {}, opportunities: [] },
  owner: { drafts: [], count: 0 },
  health: { ok: false },
  selectedDeal: null,
};

const navItems = [
  { id:'pulse',    icon:'◉', label:'Pulse' },
  { id:'discover', icon:'⌕', label:'Discover' },
  { id:'analyze',  icon:'◈', label:'Analyze' },
  { id:'pipeline', icon:'≡', label:'Pipeline' },
  { id:'vault',    icon:'▣', label:'Vault' },
];

const api = {
  async capital(){ try{ return await (await fetch('/api/capital/hunt')).json(); } catch { return { summary:{}, opportunities:[] }; } },
  async health(){ try{ return await (await fetch('/api/capital/health')).json(); } catch { return { ok:false }; } },
  async owner(){ try{ return await (await fetch('/api/owner/grant-drafts')).json(); } catch { return { drafts:[], count:0 }; } },
};

function money(v){
  if(v==null) return '$0';
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);
}
function num(v){ return (v==null?0:v).toLocaleString(); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function topDeal(){
  const opps = state.capital.opportunities || [];
  if(!opps.length) return null;
  return opps.slice().sort((a,b)=>(b.amount||0)-(a.amount||0))[0];
}

/* ─── VIEWS ─── */

function pulseView(){
  const s = state.capital.summary || {};
  const deal = topDeal();
  const ownerCount = state.owner.count || (state.owner.drafts||[]).length || 0;
  const dealsCount = s.total_opportunities || 0;
  const grantsTotal = (state.capital.opportunities||[])
    .filter(o=>o.lane==='grants')
    .reduce((a,o)=>a+(o.amount||0),0);

  const dealCard = deal ? `
    <article class="deal-card">
      <div class="deal-topline">
        <span class="small-label">PRIORITY OPPORTUNITY</span>
        <span class="score-badge">${Math.round((deal.probability||0)*100)}<small>/100</small></span>
      </div>
      <h3>${esc(deal.organization || deal.title || 'Untitled')}</h3>
      <p class="location">${esc(deal.lane?.replace(/_/g,' ') || '')} · ${esc(deal.source || 'NIA')}</p>
      <div class="price-row">
        <div>
          <span class="small-label">Amount</span>
          <strong>${money(deal.amount)}</strong>
        </div>
        <div class="confidence">
          <span class="small-label">Confidence</span>
          <strong>${Math.round((deal.probability||0)*100)}%</strong>
        </div>
      </div>
      <div class="deal-signal positive">
        <span class="signal-icon">↗</span>
        <p>Verified by certified capital engine across ${s.total_opportunities||0} live opportunities.</p>
      </div>
      <div class="deal-signal caution">
        <span class="signal-icon">!</span>
        <p>Requires owner review and signature before submission.</p>
      </div>
      <button class="primary-button full-width" data-action="review-deal">
        Review in Analyze <span>→</span>
      </button>
    </article>
  ` : `<p class="location">No opportunities loaded.</p>`;

  return `
    <section class="screen pulse-screen">
      <div class="welcome-row">
        <div>
          <p class="eyebrow">${new Date().toLocaleDateString('en-US',{weekday:'long'})} briefing</p>
          <h2>Capital Observatory</h2>
        </div>
        <div class="date-chip">${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase()}</div>
      </div>

      <section class="system-pulse panel">
        <div class="section-heading">
          <span>System pulse</span>
          <button class="text-button" data-action="refresh">Refresh</button>
        </div>
        <div class="metric-grid">
          <article class="metric"><strong>${num(dealsCount)}</strong><span>Opportunities</span></article>
          <article class="metric"><strong>${num(ownerCount)}</strong><span>Owner queue</span></article>
          <article class="metric"><strong>${(grantsTotal/1e6).toFixed(1)}M</strong><span>Grants USD</span></article>
        </div>
      </section>

      <section class="priority-block">
        <div class="section-heading">
          <span>Highest-leverage signal</span>
          <span class="priority-status">VERIFIED</span>
        </div>
        ${dealCard}
      </section>

      <section class="action-list">
        <div class="section-heading">
          <span>Evidence chain</span>
          <span>${state.health.ok ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        <button class="action-row" data-action="review-deal">
          <span class="action-number">01</span>
          <span class="action-content"><strong>Review priority opportunity</strong><small>Owner approval required</small></span>
          <span class="row-arrow">→</span>
        </button>
        <button class="action-row" data-tab="pipeline">
          <span class="action-number">02</span>
          <span class="action-content"><strong>Open pipeline queue</strong><small>${num(ownerCount)} pending</small></span>
          <span class="row-arrow">→</span>
        </button>
        <button class="action-row" data-tab="discover">
          <span class="action-number">03</span>
          <span class="action-content"><strong>Scan new signals</strong><small>10 capital lanes active</small></span>
          <span class="row-arrow">→</span>
        </button>
      </section>
    </section>
  `;
}

function discoverView(){
  const opps = state.capital.opportunities || [];
  return `
    <section class="screen">
      <p class="eyebrow">Signal acquisition</p>
      <h2>Discover</h2>

      <section class="map-panel">
        <div class="map-grid"></div>
        <div class="map-label label-a">Hampton Roads</div>
        <div class="map-pin pin-a">${num(opps.length)}</div>
        <div class="map-overlay"><span class="live-dot"></span>${num(opps.length)} live opportunities</div>
      </section>

      <section class="filter-row">
        <button class="filter-chip active">All lanes</button>
        <button class="filter-chip">Grants</button>
        <button class="filter-chip">Revenue</button>
        <button class="filter-chip">Enterprise</button>
      </section>

      <section class="signal-list">
        ${opps.slice(0,6).map(o=>`
          <article class="signal-card">
            <span class="signal-source">${esc((o.source||'NIA').toUpperCase())} · ${esc((o.lane||'').toUpperCase())}</span>
            <h3>${esc(o.organization || o.title || 'Untitled')}</h3>
            <p>${money(o.amount)} · ${Math.round((o.probability||0)*100)}% confidence</p>
          </article>
        `).join('') || '<p class="location">No signals loaded.</p>'}
      </section>
    </section>
  `;
}

function analyzeView(){
  const deal = state.selectedDeal || topDeal();
  if(!deal) return `<section class="screen"><p class="eyebrow">Decision workspace</p><h2>Analyze</h2><p class="location">No deal selected.</p></section>`;

  const conf = Math.round((deal.probability||0)*100);
  const score = conf;
  const amount = deal.amount || 0;
  const spreadLow = Math.round(amount * 0.8);
  const spreadHigh = Math.round(amount * 1.2);

  return `
    <section class="screen analyze-screen">
      <p class="eyebrow">Decision workspace</p>
      <h2>Analyze</h2>

      <article class="analysis-summary panel">
        <div class="section-heading">
          <span>Investment assessment</span>
          <span class="score-badge">${score}<small>/100</small></span>
        </div>
        <h3>${esc(deal.organization || deal.title || 'Untitled')}</h3>
        <p class="location">${esc((deal.lane||'').replace(/_/g,' '))} · ${esc(deal.source || 'NIA')}</p>

        <div class="range-block">
          <span class="small-label">Potential spread</span>
          <strong>${money(spreadLow)}–${money(spreadHigh)}</strong>
        </div>

        <div class="bar-label"><span>Confidence</span><strong>${conf}%</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${conf}%"></div></div>

        <div class="recommendation">
          <span class="recommendation-title">NIA RECOMMENDATION</span>
          <p>Evidence-gated opportunity. All execution is blocked pending owner review, signature, and verification.</p>
        </div>

        <div class="analysis-actions">
          <button class="primary-button" data-action="open-anatomy">Anatomy of decision</button>
          <button class="secondary-button" data-action="edit-assumptions">Edit assumptions</button>
        </div>
      </article>

      <section class="scenario-grid">
        <article class="scenario-card">
          <span class="small-label">Amount</span>
          <strong>${money(amount)}</strong>
          <small>Verified estimate</small>
        </article>
        <article class="scenario-card">
          <span class="small-label">Status</span>
          <strong class="amber-text">${esc(deal.status||'QUEUED')}</strong>
          <small>Owner review required</small>
        </article>
      </section>
    </section>
  `;
}

function pipelineView(){
  const drafts = state.owner.drafts || [];
  const s = state.capital.summary || {};
  return `
    <section class="screen">
      <p class="eyebrow">Operational spine</p>
      <h2>Pipeline</h2>

      <section class="pipeline-summary panel">
        <div class="metric-grid">
          <article class="metric"><strong>${num(s.total_opportunities||0)}</strong><span>Opportunities</span></article>
          <article class="metric"><strong>${num(drafts.length)}</strong><span>Owner queue</span></article>
          <article class="metric"><strong>${num(Object.keys(s.by_lane||{}).length)}</strong><span>Active lanes</span></article>
        </div>
      </section>

      <section class="stage-list">
        ${drafts.slice(0,8).map(d=>`
          <article class="stage-card">
            <div class="stage-indicator gold"></div>
            <div>
              <span class="small-label">${esc((d.preparationStatus||'PENDING').toUpperCase())}</span>
              <h3>${esc((d.opportunity?.title||d.draftId||'').slice(0,48))}</h3>
              <p>${esc(d.nextAction||'OWNER_REVIEW')}</p>
            </div>
            <span class="row-arrow">→</span>
          </article>
        `).join('') || '<p class="location">No drafts pending.</p>'}
      </section>
    </section>
  `;
}

function vaultView(){
  return `
    <section class="screen">
      <p class="eyebrow">Institutional memory</p>
      <h2>Vault</h2>

      <section class="vault-search">
        <span>⌕</span>
        <input type="search" placeholder="Search research, leads, reports…" />
      </section>

      <section class="vault-list">
        <article class="vault-row">
          <span class="file-icon">▤</span>
          <div><h3>Capital Engine Report</h3><p>Live · ${num(state.capital.summary?.total_opportunities||0)} opportunities</p></div>
        </article>
        <article class="vault-row">
          <span class="file-icon">◫</span>
          <div><h3>Owner Review Queue</h3><p>${num(state.owner.count||0)} pending signatures</p></div>
        </article>
        <article class="vault-row">
          <span class="file-icon">◇</span>
          <div><h3>Certification Record</h3><p>Tasks 1–5 passed · controlled autonomous</p></div>
        </article>
      </section>
    </section>
  `;
}

function anatomyDrawer(){
  const deal = state.selectedDeal || topDeal();
  if(!deal) return '';
  const conf = Math.round((deal.probability||0)*100);
  return `
    <div class="drawer-backdrop" data-action="close-anatomy"></div>
    <aside class="anatomy-drawer">
      <div class="drawer-handle"></div>
      <div class="drawer-header">
        <div>
          <p class="eyebrow">Transparent intelligence</p>
          <h2>Decision anatomy</h2>
        </div>
        <button class="icon-button" data-action="close-anatomy">×</button>
      </div>

      <section class="drawer-section">
        <span class="small-label">RECOMMENDATION</span>
        <p class="drawer-lead">Evidence-gated. Owner review required.</p>
      </section>

      <section class="drawer-section">
        <span class="small-label">EVIDENCE</span>
        <ul class="evidence-list">
          <li>Opportunity sourced from ${esc(deal.source || 'certified engine')}.</li>
          <li>Amount verified at ${money(deal.amount)}.</li>
          <li>Lane: ${esc((deal.lane||'').replace(/_/g,' '))}.</li>
          <li>Engine identity: NIA_PARALLEL_CAPITAL_ENGINE.</li>
        </ul>
      </section>

      <section class="drawer-section">
        <span class="small-label">UNCERTAINTY</span>
        <ul class="evidence-list caution-list">
          <li>Confidence score: ${conf}% — not certain.</li>
          <li>Owner signature has not been applied.</li>
          <li>Financial execution remains blocked by design.</li>
        </ul>
      </section>

      <section class="drawer-section">
        <span class="small-label">ASSUMPTIONS</span>
        <div class="assumption-grid">
          <span>Confidence</span><strong>${conf}%</strong>
          <span>Amount</span><strong>${money(deal.amount)}</strong>
          <span>Lane</span><strong>${esc((deal.lane||'—').replace(/_/g,' '))}</strong>
          <span>Status</span><strong>${esc(deal.status||'QUEUED')}</strong>
        </div>
      </section>

      <div class="drawer-actions">
        <button class="secondary-button" data-action="edit-assumptions">Edit assumptions</button>
        <button class="primary-button" data-action="view-sources">View sources</button>
      </div>
    </aside>
  `;
}

function appShell(){
  return `
    <main class="app-shell">
      <header class="app-head">
        <div class="brand-lockup">
          <div class="mark">V</div>
          <div>
            <p class="eyebrow">House of Jazzu Intelligence</p>
            <h1>VITRUVIAN</h1>
          </div>
        </div>
        <div class="head-actions">
          <button class="icon-button" data-action="command">⌘</button>
          <button class="profile-button">J</button>
        </div>
      </header>

      <section class="context-strip">
        <span class="live-dot ${state.health.ok?'':'offline'}"></span>
        <span>Hampton Roads</span>
        <span class="context-separator">•</span>
        <span>${state.syncStatus}</span>
        <span class="context-separator">•</span>
        <span>${state.health.ok ? 'Certified' : 'Offline'}</span>
      </section>

      <section class="view-area">${renderView()}</section>

      <nav class="bottom-nav">
        ${navItems.map(i=>`
          <button class="nav-item ${state.activeTab===i.id?'active':''}" data-tab="${i.id}">
            <span class="nav-icon">${i.icon}</span>
            <span class="nav-label">${i.label}</span>
          </button>
        `).join('')}
      </nav>

      <div id="toast" class="toast"></div>
      ${state.anatomyOpen ? anatomyDrawer() : ''}
    </main>
  `;
}

function renderView(){
  const views = { pulse: pulseView, discover: discoverView, analyze: analyzeView, pipeline: pipelineView, vault: vaultView };
  return (views[state.activeTab] || pulseView)();
}

function render(){
  document.querySelector('#app').innerHTML = appShell();
  bindEvents();
}

function bindEvents(){
  document.querySelectorAll('[data-tab]').forEach(el=>{
    el.addEventListener('click',()=>{
      state.activeTab = el.dataset.tab;
      state.anatomyOpen = false;
      render();
    });
  });
  document.querySelectorAll('[data-action]').forEach(el=>{
    el.addEventListener('click',()=>{
      const a = el.dataset.action;
      if(a==='refresh') refreshAll();
      if(a==='review-deal'){ state.activeTab='analyze'; state.selectedDeal=topDeal(); render(); }
      if(a==='open-anatomy'){ state.anatomyOpen=true; render(); }
      if(a==='close-anatomy'){ state.anatomyOpen=false; render(); }
      if(a==='command') showToast('Command palette — connecting to NIA search.');
      if(a==='edit-assumptions') showToast('Assumption editor is the next workflow.');
      if(a==='view-sources') showToast('Source viewer ready for HUD, REIN, and local integrations.');
    });
  });
}

function showToast(msg){
  const t = document.querySelector('#toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'),3000);
}

async function refreshAll(){
  state.syncStatus = 'SYNCING'; render();
  const [capital, health, owner] = await Promise.all([api.capital(), api.health(), api.owner()]);
  state.capital = capital;
  state.health = health;
  state.owner = owner;
  state.syncStatus = navigator.onLine ? 'SYNCED' : 'OFFLINE';
  if(!state.selectedDeal) state.selectedDeal = topDeal();
  render();
}

window.addEventListener('online',()=>{state.syncStatus='SYNCED';render();});
window.addEventListener('offline',()=>{state.syncStatus='OFFLINE';render();});

refreshAll();
setInterval(refreshAll, 30000);
