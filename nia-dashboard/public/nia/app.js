(function () {
  'use strict';

  const STAGE_ORDER = ['discovered', 'analyzed', 'recommended', 'approval_required', 'executed'];
  const STAGE_LABEL = {
    discovered: 'Discovered', analyzed: 'Analyzed', recommended: 'Recommended',
    approval_required: 'Approval Req.', executed: 'Executed', declined: 'Declined',
  };
  const ROMAN = { discovered: 'I', analyzed: 'II', recommended: 'III', approval_required: 'IV', executed: 'V' };

  let activeStageFilter = null;

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtMoney(n) { return '$' + Number(n || 0).toLocaleString('en-US'); }
  function fmtAge(ms) {
    const hours = Math.floor(ms / 3600000);
    if (hours < 1) return 'under an hour';
    if (hours === 1) return '1 hour';
    if (hours < 24) return hours + ' hours';
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day' : days + ' days';
  }
  function tickClock() {
    const d = new Date();
    const date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const el = document.getElementById('clock');
    if (el) el.textContent = date + ' · ' + time;
  }
  async function api(path, opts) {
    const res = await fetch(path, opts);
    if (!res.ok) {
      const body = await res.json().catch(function() { return {}; });
      throw new Error(body.error || ('Request failed (' + res.status + ')'));
    }
    return res.json();
  }

  function renderAttention(summary) {
    document.getElementById('attn-count').innerHTML = summary.pendingApprovalCount + '<span class="unit">Tickets</span>';
    document.getElementById('attn-value').innerHTML = fmtMoney(summary.pendingApprovalValue) + '<span class="unit">At Stake</span>';
    const meta = document.getElementById('attn-meta');
    meta.innerHTML = summary.pendingApprovalCount === 0
      ? 'The queue is clear. Nothing awaits thy hand.'
      : 'The eldest ticket has waited <b>' + fmtAge(summary.oldestApprovalAgeMs) + '</b>. Nothing is executed without thy approval.';
  }

  function renderPipelineStrip(summary) {
    const el = document.getElementById('pipeline-strip');
    el.innerHTML = STAGE_ORDER.map(function(stage) {
      return '<button class="stage-tab ' + stage + ' ' + (activeStageFilter === stage ? 'active' : '') + '" data-stage="' + stage + '">' +
        '<div class="stage-node"></div>' +
        '<div class="stage-numeral">' + ROMAN[stage] + '</div>' +
        '<div class="stage-name">' + STAGE_LABEL[stage] + '</div>' +
        '<div class="stage-count">' + (summary.counts[stage] || 0) + '</div>' +
        '</button>';
    }).join('');
    el.querySelectorAll('.stage-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const stage = btn.dataset.stage;
        activeStageFilter = activeStageFilter === stage ? null : stage;
        loadAll();
      });
    });
  }

  function renderMetrics(summary, tickets) {
    document.getElementById('metric-revenue').textContent = fmtMoney(summary.revenueThisMonth);
    document.getElementById('metric-pipeline').textContent = fmtMoney(summary.grantPipelineValue);
    const executedThisMonth = tickets.filter(function(t) { return t.stage === 'executed'; }).length;
    document.getElementById('metric-revenue-sub').textContent = executedThisMonth + ' ticket(s) executed';
  }

  function renderTierSummary(tickets) {
    const tiers = [
      { key: 'tier1', name: 'Tier I', sub: 'Client Services, Hampton Roads' },
      { key: 'tier2', name: 'Tier II', sub: 'Grant Pipeline' },
      { key: 'tier3', name: 'Tier III', sub: 'Acquisition' },
    ];
    document.getElementById('tier-summary').innerHTML = tiers.map(function(tier) {
      const pending = tickets.filter(function(t) { return t.tier === tier.key && t.stage === 'approval_required'; }).length;
      return '<div class="tier-row">' +
        '<div class="tier-name">' + tier.name + '</div>' +
        '<div class="tier-sub">' + tier.sub + '</div>' +
        '<div class="tier-count"><b>' + pending + '</b> awaiting approval</div>' +
        '</div>';
    }).join('');
  }

  function stepperHtml(ticket) {
    const idx = STAGE_ORDER.indexOf(ticket.stage);
    return '<div class="stepper">' +
      STAGE_ORDER.map(function(s, i) { return i < idx ? '<div class="step done"></div>' : i === idx ? '<div class="step current"></div>' : '<div class="step"></div>'; }).join('') +
      '</div><div class="step-labels">' +
      STAGE_ORDER.map(function(s, i) { return '<span class="' + (i === idx ? 'on' : '') + '">' + STAGE_LABEL[s] + '</span>'; }).join('') +
      '</div>';
  }

  function renderQueue(tickets) {
    const el = document.getElementById('queue');
    const pending = tickets.filter(function(t) { return t.stage === 'approval_required'; });
    if (pending.length === 0) {
      el.innerHTML = '<div class="empty-state">No tickets await approval.</div>';
      return;
    }
    el.innerHTML = pending.map(function(t) {
      const isGrant = t.id.indexOf('grant-') === 0;
      const awaitingManual = !!t.awaitingManualConfirmation;
      let actions;
      if (isGrant && awaitingManual) {
        actions = '<button class="btn small primary" data-action="open-modal" data-id="' + t.id + '">Fill Application</button>' +
                  '<button class="btn small" data-action="decline" data-id="' + t.id + '">Decline</button>';
      } else if (isGrant) {
        actions = '<button class="btn small" data-action="decline" data-id="' + t.id + '">Decline</button>' +
                  '<button class="btn small primary" data-action="approve" data-id="' + t.id + '">Approve &amp; Prepare</button>';
      } else {
        actions = '<button class="btn small" data-action="decline" data-id="' + t.id + '">Decline</button>' +
                  '<button class="btn small primary" data-action="approve" data-id="' + t.id + '">Approve</button>';
      }
      return '<div class="ticket" data-id="' + t.id + '">' +
        '<div class="ticket-top">' +
          '<div><div class="ticket-title">' + escapeHtml(t.title) + '</div><div class="ticket-sub">' + escapeHtml(t.tierLabel) + '</div></div>' +
          '<div class="ticket-value">' + (t.value ? fmtMoney(t.value) : '\u2014') + (t.valueUnit ? '<span class="unit">' + escapeHtml(t.valueUnit) + '</span>' : '') + '</div>' +
        '</div>' +
        stepperHtml(t) +
        '<div class="ticket-footer">' +
          '<div class="next-action">Next: <b>' + escapeHtml(t.nextAction) + '</b></div>' +
          '<div class="ticket-actions">' + actions + '</div>' +
        '</div>' +
        '</div>';
    }).join('');

    el.querySelectorAll('[data-action="approve"]').forEach(function(btn) {
      btn.addEventListener('click', function() { handleDecision(btn.dataset.id, 'approve', btn); });
    });
    el.querySelectorAll('[data-action="decline"]').forEach(function(btn) {
      btn.addEventListener('click', function() { handleDecision(btn.dataset.id, 'decline', btn); });
    });
    el.querySelectorAll('[data-action="open-modal"]').forEach(function(btn) {
      btn.addEventListener('click', function() { openSubmissionModal(btn.dataset.id); });
    });
  }

  function renderActivity(tickets) {
    const el = document.getElementById('activity');
    let feed = tickets.filter(function(t) { return t.stage !== 'approval_required'; });
    if (activeStageFilter) feed = feed.filter(function(t) { return t.stage === activeStageFilter; });
    feed = feed.slice().sort(function(a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); }).slice(0, 12);
    if (feed.length === 0) { el.innerHTML = '<div class="empty-state">Nothing here yet.</div>'; return; }
    el.innerHTML = feed.map(function(t) {
      return '<div class="ticket">' +
        '<div class="ticket-top">' +
          '<div><div class="ticket-title">' + escapeHtml(t.title) + '</div><div class="ticket-sub">' + escapeHtml(t.tierLabel) + '</div></div>' +
          '<div class="badge ' + t.stage + '">' + STAGE_LABEL[t.stage] + '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  async function handleDecision(id, action, btn) {
    const card = btn.closest('.ticket');
    card.querySelectorAll('button, input').forEach(function(b) { b.disabled = true; });
    try {
      await api('api/tickets/' + id + '/' + action, { method: 'POST' });
      card.classList.add('settle');
      await loadAll();
    } catch (err) {
      alert('Could not ' + action + ' ticket: ' + err.message);
      card.querySelectorAll('button, input').forEach(function(b) { b.disabled = false; });
    }
  }

  // --- Submission modal ----------------------------------------------------
  function closeSubmissionModal() {
    const overlay = document.getElementById('submission-modal');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openSubmissionModal(ticketId) {
    const overlay = document.getElementById('submission-modal');
    const content = document.getElementById('submission-modal-content');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    content.innerHTML = '<div class="modal-loading">Preparing submission dossier\u2026</div>';

    Promise.all([
      api('api/tickets/' + ticketId + '/dossier'),
      api('api/grants/' + ticketId + '/fill-plan'),
      fetch('api/grants/' + ticketId + '/bookmarklet').then(function(r) { return r.text(); })
    ]).then(function(results) {
      const dossier = results[0].dossier;
      const plan = results[1].plan;
      const bookmarklet = results[2].trim();
      renderModalContent(dossier, plan, bookmarklet, ticketId);
    }).catch(function(err) {
      content.innerHTML = '<h3 id="modal-title">Submission Unavailable</h3>' +
        '<p style="color:var(--ochre);margin-top:1rem;">' + escapeHtml(err.message) + '</p>' +
        '<p style="color:var(--ink-faded);margin-top:1rem;font-size:0.9rem;font-style:italic;">The grant pipeline may not be fully deployed yet. Check /api/health or try again in a moment.</p>';
    });
  }

  function renderModalContent(dossier, plan, bookmarklet, ticketId) {
    const content = document.getElementById('submission-modal-content');
    const required = (dossier.checklist || []).filter(function(c) { return c.required; });
    const optional = (dossier.checklist || []).filter(function(c) { return !c.required; });
    const planJson = JSON.stringify(plan);
    const checklistHtml = required.map(function(c) {
      return '<li><b>' + escapeHtml(c.item) + '</b></li>';
    }).join('') + optional.map(function(c) {
      return '<li class="optional">' + escapeHtml(c.item) + ' <span style="font-size:0.75rem;color:var(--ink-light);font-style:italic;">(optional)</span></li>';
    }).join('');

    content.innerHTML =
      '<h3 id="modal-title">' + escapeHtml(dossier.grant) + '</h3>' +
      '<div class="modal-sub">' + escapeHtml(plan.portalName) + ' \u00b7 ' + fmtMoney(plan.amount) + ' \u00b7 Submission workflow</div>' +

      '<div class="modal-step">' +
        '<div class="modal-step-num">I</div>' +
        '<div>' +
          '<h4>Review the checklist</h4>' +
          '<p>What the portal requires. Have these ready before you start.</p>' +
          '<ul class="modal-checklist">' + checklistHtml + '</ul>' +
        '</div>' +
      '</div>' +

      '<div class="modal-step">' +
        '<div class="modal-step-num">II</div>' +
        '<div>' +
          '<h4>Save the Nia Fill bookmarklet</h4>' +
          '<p>Copy this URL, add it as a bookmark in your phone browser named <b>Nia Fill</b>. It fills form fields. It never clicks submit.</p>' +
          '<div class="modal-step-actions">' +
            '<button class="btn small primary btn-copy" data-copy-text="' + escapeHtml(bookmarklet) + '">Copy Bookmarklet</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="modal-step">' +
        '<div class="modal-step-num">III</div>' +
        '<div>' +
          '<h4>Copy the fill plan</h4>' +
          '<p>This populates ' + plan.fields.length + ' fields. You\'ll paste it into the bookmarklet prompt.</p>' +
          '<div class="modal-step-actions">' +
            '<button class="btn small primary btn-copy" data-copy-text="' + escapeHtml(planJson) + '">Copy Fill Plan (' + plan.fields.length + ' fields)</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="modal-step">' +
        '<div class="modal-step-num">IV</div>' +
        '<div>' +
          '<h4>Open the portal and fill</h4>' +
          '<p>Log in with your account, navigate to the form, tap <b>Nia Fill</b>, paste the fill plan. Review every field. <b>You</b> click Submit.</p>' +
          '<div class="modal-step-actions">' +
            '<a class="btn small primary" href="' + escapeHtml(plan.portalUrl) + '" target="_blank" rel="noopener">Open ' + escapeHtml(plan.portalName) + ' \u2197</a>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="modal-step">' +
        '<div class="modal-step-num">V</div>' +
        '<div>' +
          '<h4>Record the confirmation</h4>' +
          '<p>After the portal accepts your submission, copy the confirmation ID and record it here.</p>' +
          '<div class="modal-confirm">' +
            '<input type="text" class="confirm-input" placeholder="Confirmation ID from portal\u2026" id="modal-confirm-input">' +
            '<button class="btn small primary" id="modal-confirm-btn" data-id="' + ticketId + '">Record</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    content.querySelectorAll('.btn-copy').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const text = btn.dataset.copyText;
        const done = function() {
          btn.classList.add('copied');
          const orig = btn.textContent;
          btn.textContent = '\u2713 Copied';
          setTimeout(function() {
            btn.classList.remove('copied');
            btn.textContent = orig;
          }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function(e) {
            fallbackCopy(text, done, e);
          });
        } else {
          fallbackCopy(text, done);
        }
      });
    });

    const recBtn = document.getElementById('modal-confirm-btn');
    const recInput = document.getElementById('modal-confirm-input');
    if (recBtn) {
      recBtn.addEventListener('click', async function() {
        const cid = recInput.value.trim();
        if (!cid) { recInput.focus(); return; }
        recBtn.disabled = true;
        recBtn.textContent = 'Recording\u2026';
        try {
          await api('api/tickets/' + ticketId + '/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirmationId: cid })
          });
          closeSubmissionModal();
          await loadAll();
        } catch (e) {
          alert('Record failed: ' + e.message);
          recBtn.disabled = false;
          recBtn.textContent = 'Record';
        }
      });
    }
  }

  function fallbackCopy(text, done, originalErr) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) done();
      else alert('Copy failed: ' + (originalErr ? originalErr.message : 'browser blocked clipboard'));
    } catch (e) {
      alert('Copy failed: ' + (originalErr ? originalErr.message : e.message));
    }
  }

  async function renderCompany() {
    const el = document.getElementById('company-strip');
    if (!el) return;
    try {
      const r = await api('api/company');
      const c = r.company || {};
      const parts = [];
      if (c.uei) {
        parts.push('<span><span class="label">UEI</span><span class="uei">' + escapeHtml(c.uei) + '</span></span>');
      }
      if (c.entityType) parts.push('<span>' + escapeHtml(c.entityType) + '</span>');
      if (c.city && c.state) parts.push('<span>' + escapeHtml(c.city) + ', ' + escapeHtml(c.state) + '</span>');
      if (c.ein) {
        const masked = String(c.ein).replace(/^(\d{2})\d{5}(\d{2})$/, '$1-•••••$2');
        parts.push('<span><span class="label">EIN</span>' + escapeHtml(masked) + '</span>');
      }
      el.innerHTML = parts.join('<span class="divider">·</span>') || '<span class="loading">no company data</span>';
    } catch (e) {
      el.innerHTML = '<span class="loading">company data unavailable</span>';
    }
  }

  async function loadAll() {
    try {
      const results = await Promise.all([api('api/summary'), api('api/tickets')]);
      const summary = results[0];
      const tickets = results[1].tickets;
      renderAttention(summary);
      renderPipelineStrip(summary);
      renderMetrics(summary, tickets);
      renderTierSummary(tickets);
      renderQueue(tickets);
      renderActivity(tickets);
    } catch (err) {
      const meta = document.getElementById('attn-meta');
      if (meta) meta.textContent = 'Could not load the pipeline: ' + err.message;
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    tickClock();
    setInterval(tickClock, 30000);
    loadAll();
    renderCompany();
    setInterval(loadAll, 15000);

    const queueBtn = document.getElementById('open-queue-btn');
    if (queueBtn) queueBtn.addEventListener('click', function() {
      document.getElementById('queue-sec').scrollIntoView({ behavior: 'smooth' });
    });
    const activityBtn = document.getElementById('open-activity-btn');
    if (activityBtn) activityBtn.addEventListener('click', function() {
      document.getElementById('activity-sec').scrollIntoView({ behavior: 'smooth' });
    });

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSubmissionModal);

    const overlay = document.getElementById('submission-modal');
    if (overlay) overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeSubmissionModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeSubmissionModal();
    });
  });
})();
