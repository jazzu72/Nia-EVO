(function () {
  'use strict';

  const STAGE_ORDER = ['discovered', 'analyzed', 'recommended', 'approval_required', 'executed'];
  const STAGE_LABEL = {
    discovered: 'Discovered', analyzed: 'Analyzed', recommended: 'Recommended',
    approval_required: 'Approval Req.', executed: 'Executed', declined: 'Declined',
  };
  const ROMAN = { discovered: 'I', analyzed: 'II', recommended: 'III', approval_required: 'IV', executed: 'V' };

  let activeStageFilter = null;

  function fmtMoney(n) { return '$' + Number(n || 0).toLocaleString('en-US'); }

  function fmtAge(ms) {
    const hours = Math.floor(ms / 3600000);
    if (hours < 1) return 'under an hour';
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day' : `${days} days`;
  }

  function tickClock() {
    const d = new Date();
    const date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    document.getElementById('clock').textContent = `${date} · ${time}`;
  }

  async function api(path, opts) {
    const res = await fetch(path, opts);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
  }

  function renderAttention(summary) {
    document.getElementById('attn-count').innerHTML = `${summary.pendingApprovalCount}<span class="unit">Tickets</span>`;
    document.getElementById('attn-value').innerHTML = `${fmtMoney(summary.pendingApprovalValue)}<span class="unit">At Stake</span>`;
    const meta = document.getElementById('attn-meta');
    meta.innerHTML = summary.pendingApprovalCount === 0
      ? 'The queue is clear. Nothing awaits thy hand.'
      : `The eldest ticket has waited <b>${fmtAge(summary.oldestApprovalAgeMs)}</b>. Nothing is executed without thy approval.`;
  }

  function renderPipelineStrip(summary) {
    const el = document.getElementById('pipeline-strip');
    el.innerHTML = STAGE_ORDER.map((stage) => `
      <button class="stage-tab ${stage} ${activeStageFilter === stage ? 'active' : ''}" data-stage="${stage}">
        <div class="stage-node"></div>
        <div class="stage-numeral">${ROMAN[stage]}</div>
        <div class="stage-name">${STAGE_LABEL[stage]}</div>
        <div class="stage-count">${summary.counts[stage] || 0}</div>
      </button>
    `).join('');
    el.querySelectorAll('.stage-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stage = btn.dataset.stage;
        activeStageFilter = activeStageFilter === stage ? null : stage;
        loadAll();
      });
    });
  }

  function renderMetrics(summary, tickets) {
    document.getElementById('metric-revenue').textContent = fmtMoney(summary.revenueThisMonth);
    document.getElementById('metric-pipeline').textContent = fmtMoney(summary.grantPipelineValue);
    const executedThisMonth = tickets.filter((t) => t.stage === 'executed').length;
    document.getElementById('metric-revenue-sub').textContent = `${executedThisMonth} ticket(s) executed`;
  }

  function renderTierSummary(tickets) {
    const tiers = [
      { key: 'tier1', name: 'Tier I', sub: 'Client Services, Hampton Roads' },
      { key: 'tier2', name: 'Tier II', sub: 'Grant Pipeline' },
      { key: 'tier3', name: 'Tier III', sub: 'Acquisition' },
    ];
    document.getElementById('tier-summary').innerHTML = tiers.map((tier) => {
      const pending = tickets.filter((t) => t.tier === tier.key && t.stage === 'approval_required').length;
      return `<div class="tier-row">
        <div class="tier-name">${tier.name}</div>
        <div class="tier-sub">${tier.sub}</div>
        <div class="tier-count"><b>${pending}</b> awaiting approval</div>
      </div>`;
    }).join('');
  }

  function stepperHtml(ticket) {
    const idx = STAGE_ORDER.indexOf(ticket.stage);
    return `
      <div class="stepper">
        ${STAGE_ORDER.map((s, i) => i < idx ? '<div class="step done"></div>' : i === idx ? '<div class="step current"></div>' : '<div class="step"></div>').join('')}
      </div>
      <div class="step-labels">
        ${STAGE_ORDER.map((s, i) => `<span class="${i === idx ? 'on' : ''}">${STAGE_LABEL[s]}</span>`).join('')}
      </div>`;
  }

  function renderQueue(tickets) {
    const el = document.getElementById('queue');
    const pending = tickets.filter((t) => t.stage === 'approval_required');
    if (pending.length === 0) {
      el.innerHTML = '<div class="empty-state">No tickets await approval.</div>';
      return;
    }
    el.innerHTML = pending.map((t) => `
      <div class="ticket" data-id="${t.id}">
        <div class="ticket-top">
          <div><div class="ticket-title">${t.title}</div><div class="ticket-sub">${t.tierLabel}</div></div>
          <div class="ticket-value">${t.value ? fmtMoney(t.value) : '—'}${t.valueUnit ? `<span class="unit">${t.valueUnit}</span>` : ''}</div>
        </div>
        ${stepperHtml(t)}
        <div class="ticket-footer">
          <div class="next-action">Next: <b>${t.nextAction}</b></div>
          <div class="ticket-actions">
            ${t.awaitingManualConfirmation ? `
              <a class="btn small" target="_blank" href="api/tickets/${t.id}/dossier">Dossier ↗</a>
              <input type="text" class="confirm-input" placeholder="Real confirmation ID…" data-id="${t.id}">
              <button class="btn small primary" data-action="confirm" data-id="${t.id}">Record</button>
            ` : `
              <button class="btn small" data-action="decline" data-id="${t.id}">Decline</button>
              <button class="btn small primary" data-action="approve" data-id="${t.id}">Approve</button>
            `}
          </div>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('[data-action="approve"], [data-action="decline"]').forEach((btn) => {
      btn.addEventListener('click', () => handleDecision(btn.dataset.id, btn.dataset.action, btn));
    });
    el.querySelectorAll('[data-action="confirm"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = el.querySelector(`.confirm-input[data-id="${btn.dataset.id}"]`);
        handleConfirm(btn.dataset.id, input ? input.value : '', btn);
      });
    });
  }

  function renderActivity(tickets) {
    const el = document.getElementById('activity');
    let feed = tickets.filter((t) => t.stage !== 'approval_required');
    if (activeStageFilter) feed = feed.filter((t) => t.stage === activeStageFilter);
    feed = feed.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 12);
    if (feed.length === 0) { el.innerHTML = '<div class="empty-state">Nothing here yet.</div>'; return; }
    el.innerHTML = feed.map((t) => `
      <div class="ticket">
        <div class="ticket-top">
          <div><div class="ticket-title">${t.title}</div><div class="ticket-sub">${t.tierLabel}</div></div>
          <div class="badge ${t.stage}">${STAGE_LABEL[t.stage]}</div>
        </div>
      </div>
    `).join('');
  }

  async function handleDecision(id, action, btn) {
    const card = btn.closest('.ticket');
    card.querySelectorAll('button, input').forEach((b) => (b.disabled = true));
    try {
      await api(`api/tickets/${id}/${action}`, { method: 'POST' });
      card.classList.add('settle');
      await loadAll();
    } catch (err) {
      alert(`Could not ${action} ticket: ${err.message}`);
      card.querySelectorAll('button, input').forEach((b) => (b.disabled = false));
    }
  }

  async function handleConfirm(id, confirmationId, btn) {
    const card = btn.closest('.ticket');
    if (!confirmationId || !confirmationId.trim()) {
      alert('Enter the real confirmation ID from the portal before recording.');
      return;
    }
    card.querySelectorAll('button, input').forEach((b) => (b.disabled = true));
    try {
      await api(`api/tickets/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationId: confirmationId.trim() }),
      });
      card.classList.add('settle');
      await loadAll();
    } catch (err) {
      alert(`Could not record confirmation: ${err.message}`);
      card.querySelectorAll('button, input').forEach((b) => (b.disabled = false));
    }
  }

  async function loadAll() {
    try {
      const [summary, ticketsRes] = await Promise.all([api('api/summary'), api('api/tickets')]);
      const tickets = ticketsRes.tickets;
      renderAttention(summary);
      renderPipelineStrip(summary);
      renderMetrics(summary, tickets);
      renderTierSummary(tickets);
      renderQueue(tickets);
      renderActivity(tickets);
    } catch (err) {
      document.getElementById('attn-meta').textContent = `Could not load the pipeline: ${err.message}`;
    }
  }

  document.getElementById('open-queue-btn').addEventListener('click', () => {
    document.getElementById('queue-sec').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('open-activity-btn').addEventListener('click', () => {
    document.getElementById('activity-sec').scrollIntoView({ behavior: 'smooth' });
  });

  tickClock();
  setInterval(tickClock, 30000);
  loadAll();
  setInterval(loadAll, 15000);
})();
