// NIA Dashboard — API layer for certified backend routes
const API = {
  async capital(){ try{ return await (await fetch('/api/capital/hunt')).json(); } catch { return { summary:{}, opportunities:[] }; } },
  async health(){ try{ return await (await fetch('/api/capital/health')).json(); } catch { return { ok:false }; } },
  async owner(){ try{ return await (await fetch('/api/owner/grant-drafts')).json(); } catch { return { drafts:[] }; } }
};

function fmtMoney(n){
  if(n==null||n===0) return '$0';
  if(n>=1e9) return '$'+(n/1e9).toFixed(2)+'B';
  if(n>=1e6) return '$'+(n/1e6).toFixed(2)+'M';
  if(n>=1e3) return '$'+(n/1e3).toFixed(1)+'K';
  return '$'+Math.round(n);
}
function fmtInt(n){ return (n==null?0:n).toLocaleString(); }
function setText(sel,v){ document.querySelectorAll(sel).forEach(el=>{ el.textContent = v; }); }

function tick(){
  const el = document.querySelector('[data-clock]');
  if(el) el.textContent = new Date().toISOString().slice(11,19)+' UTC';
}

async function refreshDashboard(){
  const [capital, health, owner] = await Promise.all([API.capital(), API.health(), API.owner()]);
  const s = capital.summary || {};
  const opps = capital.opportunities || [];
  const byLane = s.by_lane || {};

  setText('[data-kpi="available-capital"]', fmtMoney(s.total_amount));
  const grantsTotal = opps.filter(o=>o.lane==='grants').reduce((a,o)=>a+(o.amount||0),0);
  setText('[data-kpi="grant-pipeline"]', fmtMoney(grantsTotal));
  setText('[data-kpi="opportunities"]', fmtInt(s.total_opportunities));
  setText('[data-kpi="active-deals"]', fmtInt((owner.drafts||[]).length));

  const statusEl = document.querySelector('[data-sync-status]');
  if(statusEl) statusEl.textContent = health.ok ? 'Live' : 'Offline';

  const ptable = document.querySelector('[data-pipeline]');
  if(ptable){
    const rows = Object.entries(byLane).sort((a,b)=>b[1]-a[1]).map(([lane,count])=>{
      const total = opps.filter(o=>o.lane===lane).reduce((a,o)=>a+(o.amount||0),0);
      return `<tr><td>${lane.replace(/_/g,' ')}</td><td class="num">${count}</td><td class="num">${fmtMoney(total)}</td></tr>`;
    });
    ptable.innerHTML = rows.join('') || '<tr><td colspan="3" class="muted">No pipeline data</td></tr>';
  }
  setText('[data-pipeline-meta]', Object.keys(byLane).length + ' lanes');

  const dtable = document.querySelector('[data-drafts]');
  if(dtable){
    dtable.innerHTML = (owner.drafts||[]).slice(0,8).map(d=>`
      <tr>
        <td>${(d.opportunity?.title||d.draftId||'').slice(0,48)}</td>
        <td class="status-cell"><span class="tag warn">${(d.preparationStatus||'pending').toLowerCase()}</span></td>
      </tr>`).join('') || '<tr><td colspan="2" class="muted">No drafts pending</td></tr>';
  }
  setText('[data-owner-meta]', (owner.drafts||[]).length + ' pending');
}

document.addEventListener('DOMContentLoaded', ()=>{
  tick(); setInterval(tick, 1000);
  refreshDashboard();
  setInterval(refreshDashboard, 30000);
});
