#!/data/data/com.termux/files/usr/bin/bash
# Money Munchkins 2 — landing page + internal ops dashboard installer
# Run this from ~/nia-capital-os/products/money-munchkins-2/app
# v2: fixes decorative element blocking clicks, adds live interactive
#     crew flip-cards and a real client-side mission demo.

set -e

echo "=== 1/5: creating web/index.html (landing page) ==="
mkdir -p web/dashboard
cat > web/index.html << 'LANDING_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Money Munchkins: Quantum Odyssey</title>
<meta name="description" content="A galaxy of money missions for kids — earn, save, and spend wisely with a crew of Munchkin explorers.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  :root{
    --ink-deep:#12102A;
    --ink-panel:#1B1740;
    --violet:#5B3E96;
    --gold:#FFC857;
    --nebula:#FF6FA0;
    --mint:#4ADE80;
    --paper:#F5F1E8;
    --paper-dim:#C9C4DE;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{
    background:var(--ink-deep);
    color:var(--paper);
    font-family:'Inter',sans-serif;
    overflow-x:hidden;
  }
  body::before{
    content:"";
    position:fixed;inset:0;
    background-image:
      radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,.55), transparent),
      radial-gradient(1.5px 1.5px at 70% 65%, rgba(255,255,255,.4), transparent),
      radial-gradient(2px 2px at 85% 20%, rgba(255,255,255,.5), transparent),
      radial-gradient(1px 1px at 45% 80%, rgba(255,255,255,.35), transparent),
      radial-gradient(1.5px 1.5px at 10% 90%, rgba(255,255,255,.4), transparent),
      radial-gradient(1.5px 1.5px at 92% 50%, rgba(255,255,255,.45), transparent);
    background-repeat:repeat;
    background-size:600px 600px;
    pointer-events:none;
    z-index:0;
    opacity:.7;
  }
  .display{font-family:'Space Grotesk',sans-serif;}
  .mono{font-family:'IBM Plex Mono',monospace;letter-spacing:.02em;}
  a{color:inherit;text-decoration:none;}
  .wrap{max-width:1080px;margin:0 auto;padding:0 24px;position:relative;z-index:1;}

  nav{display:flex;align-items:center;justify-content:space-between;padding:24px 0;}
  .brand{display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;}
  .brand-mark{width:28px;height:28px;border-radius:50%;background:conic-gradient(from 90deg,var(--gold),var(--nebula),var(--violet),var(--gold));box-shadow:0 0 18px rgba(255,200,87,.5);}
  nav .links{display:flex;gap:28px;font-size:14px;color:var(--paper-dim);}
  nav .links a:hover{color:var(--paper);}

  header.hero{padding:80px 0 60px;position:relative;}
  .eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;
    color:var(--gold);background:rgba(255,200,87,.1);border:1px solid rgba(255,200,87,.35);
    padding:6px 12px;border-radius:999px;margin-bottom:28px;
  }
  .eyebrow::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--mint);box-shadow:0 0 8px var(--mint);}
  h1{
    font-size:clamp(40px,7vw,74px);
    line-height:1.02;
    font-weight:700;
    letter-spacing:-.02em;
    max-width:820px;
  }
  h1 .accent{color:var(--gold);}
  .lede{max-width:520px;margin-top:24px;font-size:18px;line-height:1.6;color:var(--paper-dim);}
  .cta-row{display:flex;gap:16px;margin-top:36px;flex-wrap:wrap;}
  .btn{
    font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;
    padding:14px 26px;border-radius:12px;display:inline-flex;align-items:center;gap:8px;
    transition:transform .15s ease, box-shadow .15s ease;
  }
  .btn-primary{background:var(--gold);color:#1B1740;box-shadow:0 8px 24px rgba(255,200,87,.25);}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(255,200,87,.35);}
  .btn-ghost{border:1px solid rgba(245,241,232,.25);color:var(--paper);}
  .btn-ghost:hover{border-color:rgba(245,241,232,.55);}

  .orbit-stage{
    position:absolute;top:40px;right:-40px;width:420px;height:420px;
    display:flex;align-items:center;justify-content:center;
    pointer-events:none;
  }
  .orbit-ring{
    position:absolute;border:1px dashed rgba(245,241,232,.15);border-radius:50%;
  }
  .orbit-ring.r1{width:300px;height:300px;}
  .orbit-ring.r2{width:400px;height:400px;}
  .coin{
    width:96px;height:96px;border-radius:50%;
    background:radial-gradient(circle at 35% 30%, #FFE29A, var(--gold) 60%, #C98A1F 100%);
    box-shadow:0 0 50px rgba(255,200,87,.45);
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#1B1740;
  }
  .orbiter{
    position:absolute;width:300px;height:300px;
    animation:spin 14s linear infinite;
  }
  .orbiter .card{
    position:absolute;top:-4px;left:50%;transform:translateX(-50%);
    width:44px;height:44px;border-radius:12px;
    background:var(--nebula);
    box-shadow:0 0 24px rgba(255,111,160,.55);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }
  @keyframes spin{to{transform:rotate(360deg);}}
  @media (prefers-reduced-motion: reduce){ .orbiter{animation:none;} }
  @media (max-width:900px){ .orbit-stage{display:none;} }

  section{padding:70px 0;position:relative;}
  .section-head{max-width:560px;margin-bottom:44px;}
  .section-head .eyebrow{margin-bottom:16px;}
  .section-head h2{font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,4vw,38px);font-weight:700;letter-spacing:-.01em;}
  .section-head p{margin-top:14px;color:var(--paper-dim);font-size:16px;line-height:1.6;}

  .missions{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
  @media (max-width:820px){.missions{grid-template-columns:1fr;}}
  .mission-card{
    background:var(--ink-panel);border:1px solid rgba(245,241,232,.08);border-radius:18px;
    padding:26px;position:relative;overflow:hidden;
  }
  .mission-card::after{
    content:"";position:absolute;top:-40%;right:-30%;width:180px;height:180px;border-radius:50%;
    background:radial-gradient(circle, var(--glow,var(--violet)) 0%, transparent 70%);opacity:.5;
  }
  .mission-card .level{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--paper-dim);}
  .mission-card h3{font-family:'Space Grotesk',sans-serif;font-size:20px;margin:10px 0 10px;}
  .mission-card p{color:var(--paper-dim);font-size:14.5px;line-height:1.55;}
  .mission-card .pill{
    display:inline-block;margin-top:16px;font-family:'IBM Plex Mono',monospace;font-size:12px;
    padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:var(--gold);
  }

  .trust{
    background:var(--ink-panel);border-radius:24px;padding:48px;
    display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;
    border:1px solid rgba(245,241,232,.08);
  }
  @media (max-width:820px){.trust{grid-template-columns:1fr;padding:32px;}}
  .trust h2{font-family:'Space Grotesk',sans-serif;font-size:clamp(26px,4vw,34px);margin-bottom:16px;}
  .trust p{color:var(--paper-dim);line-height:1.65;font-size:15.5px;}
  .trust-list{margin-top:22px;display:flex;flex-direction:column;gap:14px;}
  .trust-list li{list-style:none;display:flex;gap:12px;align-items:flex-start;font-size:14.5px;color:var(--paper);}
  .check{
    flex:none;width:20px;height:20px;border-radius:6px;background:rgba(74,222,128,.15);
    color:var(--mint);display:flex;align-items:center;justify-content:center;font-size:13px;margin-top:2px;
  }
  .readout{
    background:var(--ink-deep);border:1px solid rgba(245,241,232,.08);border-radius:16px;padding:22px;
    font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--paper-dim);
  }
  .readout .row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dashed rgba(245,241,232,.08);}
  .readout .row:last-child{border-bottom:none;}
  .readout .ok{color:var(--mint);}

  .crew{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
  @media (max-width:820px){.crew{grid-template-columns:repeat(2,1fr);}}
  .flip-card{perspective:1000px;height:190px;cursor:pointer;}
  .flip-card .flip-inner{
    position:relative;width:100%;height:100%;transition:transform .55s cubic-bezier(.4,.2,.2,1);
    transform-style:preserve-3d;
  }
  .flip-card.flipped .flip-inner{transform:rotateY(180deg);}
  .flip-face{
    position:absolute;inset:0;backface-visibility:hidden;border-radius:16px;
    padding:20px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
    border:1px solid rgba(245,241,232,.08);
  }
  .flip-front{background:var(--ink-panel);}
  .flip-front .emoji{font-size:38px;margin-bottom:10px;}
  .flip-front h4{font-family:'Space Grotesk',sans-serif;font-size:16px;}
  .flip-front .tap-hint{margin-top:8px;font-size:11px;color:var(--paper-dim);font-family:'IBM Plex Mono',monospace;}
  .flip-back{
    background:linear-gradient(160deg,var(--violet),var(--ink-panel));
    transform:rotateY(180deg);
  }
  .flip-back .stat{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
  .flip-back p{font-size:13px;line-height:1.45;color:var(--paper);}

  .simulator{
    background:var(--ink-panel);border-radius:20px;padding:32px;border:1px solid rgba(245,241,232,.08);
  }
  @media (max-width:820px){.simulator{padding:22px;}}
  .sim-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:24px;}
  .sim-stardust{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;display:flex;align-items:center;gap:8px;}
  .sim-stardust .icon{color:var(--gold);}
  .sim-steps{display:flex;gap:10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--paper-dim);}
  .sim-steps .step{padding:4px 10px;border-radius:999px;border:1px solid rgba(245,241,232,.15);}
  .sim-steps .step.active{color:var(--gold);border-color:var(--gold);background:rgba(255,200,87,.08);}
  .sim-steps .step.done{color:var(--mint);border-color:var(--mint);}

  .sim-body{min-height:120px;}
  .sim-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
  .sim-btn{
    font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;
    padding:12px 20px;border-radius:10px;border:none;cursor:pointer;
    background:var(--gold);color:#1B1740;transition:transform .12s ease,opacity .12s ease;
  }
  .sim-btn:hover:not(:disabled){transform:translateY(-2px);}
  .sim-btn:disabled{opacity:.35;cursor:not-allowed;}
  .sim-btn.alt{background:transparent;border:1px solid rgba(245,241,232,.3);color:var(--paper);}
  .sim-note{font-size:13.5px;color:var(--paper-dim);margin-top:14px;line-height:1.55;min-height:20px;}

  .pod-track{background:var(--ink-deep);border-radius:999px;height:14px;overflow:hidden;margin:16px 0;border:1px solid rgba(245,241,232,.1);}
  .pod-fill{height:100%;width:0%;background:linear-gradient(90deg,var(--nebula),var(--gold));transition:width .5s ease;border-radius:999px;}
  .pod-label{display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:var(--paper-dim);}

  footer{padding:50px 0 70px;border-top:1px solid rgba(245,241,232,.08);}
  .foot-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
  .foot-links{display:flex;gap:24px;font-size:14px;color:var(--paper-dim);}
  .foot-links a:hover{color:var(--paper);}
  .foot-small{margin-top:24px;font-size:12.5px;color:rgba(245,241,232,.4);}
</style>
</head>
<body>

<div class="wrap">
  <nav>
    <div class="brand"><span class="brand-mark"></span> Money Munchkins</div>
    <div class="links">
      <a href="#missions">Missions</a>
      <a href="#parents">For Parents</a>
      <a href="/money-munchkins/investor">Investors</a>
    </div>
  </nav>
</div>

<header class="hero">
  <div class="wrap">
    <div class="eyebrow">Quantum Odyssey · Live</div>
    <h1>A galaxy of<br>money missions,<br><span class="accent">built for kids.</span></h1>
    <p class="lede">Munchkins earn stardust for real chores, launch savings pods toward a goal, and learn to spend wisely — one mission at a time. No ads, no in-app pressure, three missions a day.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="#parents">See how it works</a>
      <a class="btn btn-ghost" href="/money-munchkins/investor">Investor center →</a>
    </div>
  </div>
  <div class="orbit-stage">
    <div class="orbit-ring r1"></div>
    <div class="orbit-ring r2"></div>
    <div class="coin">$</div>
    <div class="orbiter"><div class="card">🚀</div></div>
  </div>
</header>

<div class="wrap">
  <section id="missions">
    <div class="section-head">
      <div class="eyebrow">The Loop</div>
      <h2>Three missions. Every day.</h2>
      <p>A hard daily cap keeps it a habit, not a habit-forming app. Munchkins always know exactly where they stand.</p>
    </div>
    <div class="missions">
      <div class="mission-card" style="--glow:var(--gold)">
        <div class="level">MISSION 01</div>
        <h3>Earn</h3>
        <p>Log a real-world chore or task. A grown-up confirms it, and stardust lands in the mission's wallet.</p>
        <span class="pill">+ stardust</span>
      </div>
      <div class="mission-card" style="--glow:var(--nebula)">
        <div class="level">MISSION 02</div>
        <h3>Save</h3>
        <p>Point stardust at a savings pod — a bike, a game, a gift for someone else — and watch the orbit fill in.</p>
        <span class="pill">savings pod</span>
      </div>
      <div class="mission-card" style="--glow:var(--violet)">
        <div class="level">MISSION 03</div>
        <h3>Spend</h3>
        <p>When a pod is full, Munchkins choose: cash it out, keep growing it, or split it three ways.</p>
        <span class="pill">their call</span>
      </div>
    </div>
  </section>

  <section id="crew">
    <div class="section-head">
      <div class="eyebrow">Meet the Crew</div>
      <h2>Every Munchkin has a specialty.</h2>
      <p>Tap a crewmate to see their power. Kids pick one to guide their missions — no wrong choice.</p>
    </div>
    <div class="crew">
      <div class="flip-card" data-crew>
        <div class="flip-inner">
          <div class="flip-face flip-front">
            <div class="emoji">🪐</div>
            <h4>Nova</h4>
            <div class="tap-hint">tap to flip</div>
          </div>
          <div class="flip-face flip-back">
            <div class="stat">Earn Specialist</div>
            <p>Spots chores worth extra stardust and tracks streaks so nothing's forgotten.</p>
          </div>
        </div>
      </div>
      <div class="flip-card" data-crew>
        <div class="flip-inner">
          <div class="flip-face flip-front">
            <div class="emoji">🛰️</div>
            <h4>Vex</h4>
            <div class="tap-hint">tap to flip</div>
          </div>
          <div class="flip-face flip-back">
            <div class="stat">Save Strategist</div>
            <p>Helps pick a savings pod goal and shows how small deposits add up over time.</p>
          </div>
        </div>
      </div>
      <div class="flip-card" data-crew>
        <div class="flip-inner">
          <div class="flip-face flip-front">
            <div class="emoji">👾</div>
            <h4>Pip</h4>
            <div class="tap-hint">tap to flip</div>
          </div>
          <div class="flip-face flip-back">
            <div class="stat">Spend Advisor</div>
            <p>Walks through the trade-offs before a pod gets cashed out — no impulse spends.</p>
          </div>
        </div>
      </div>
      <div class="flip-card" data-crew>
        <div class="flip-inner">
          <div class="flip-face flip-front">
            <div class="emoji">🌌</div>
            <h4>Astra</h4>
            <div class="tap-hint">tap to flip</div>
          </div>
          <div class="flip-face flip-back">
            <div class="stat">Crew Leader</div>
            <p>Unlocks once all three missions are logged — celebrates the daily streak.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="play">
    <div class="section-head">
      <div class="eyebrow">Try It</div>
      <h2>Play a mission, right here.</h2>
      <p>This is the actual loop — earn, save, spend — running client-side. No account needed to try it.</p>
    </div>
    <div class="simulator">
      <div class="sim-top">
        <div class="sim-stardust"><span class="icon">✦</span> <span id="stardustCount">0</span> stardust</div>
        <div class="sim-steps">
          <span class="step active" id="stepEarn">01 EARN</span>
          <span class="step" id="stepSave">02 SAVE</span>
          <span class="step" id="stepSpend">03 SPEND</span>
        </div>
      </div>

      <div class="sim-body" id="simBody">
        <p style="color:var(--paper-dim);font-size:14.5px;margin-bottom:16px;">Log today's chore to earn stardust.</p>
        <div class="sim-row">
          <button class="sim-btn" id="logChoreBtn" onclick="logChore()">Log a chore (+10 ✦)</button>
        </div>
        <div class="sim-note" id="simNote"></div>
      </div>
    </div>
  </section>

  <section id="parents">
    <div class="trust">
      <div>
        <div class="eyebrow">For Parents</div>
        <h2>You approve everything that matters.</h2>
        <p>Money Munchkins is a learning layer on top of decisions you still make. No card is charged, no chore is credited, and no pod is cashed out without a grown-up in the loop.</p>
        <ul class="trust-list">
          <li><span class="check">✓</span> Daily mission limit — never a bottomless scroll</li>
          <li><span class="check">✓</span> Every "earn" needs parent confirmation</li>
          <li><span class="check">✓</span> No ads, no third-party trackers, no in-app purchases</li>
          <li><span class="check">✓</span> Payment status and system health published live</li>
        </ul>
      </div>
      <div class="readout" id="statusReadout">
        <div class="row"><span>service</span><span class="mono">money-munchkins-2</span></div>
        <div class="row"><span>health</span><span class="ok" id="healthVal">checking…</span></div>
        <div class="row"><span>payments</span><span class="ok" id="paymentsVal">checking…</span></div>
        <div class="row"><span>provider</span><span id="providerVal">—</span></div>
      </div>
    </div>
  </section>

  <footer>
    <div class="foot-row">
      <div class="brand"><span class="brand-mark"></span> Money Munchkins</div>
      <div class="foot-links">
        <a href="/money-munchkins/pilot">Pilot feedback</a>
        <a href="/money-munchkins/investor">Investors</a>
        <a href="/api/money-munchkins/health">System status</a>
      </div>
    </div>
    <div class="foot-small">Money Munchkins: Quantum Odyssey — a House of Jazzu product.</div>
  </footer>
</div>

<script>
  fetch('/api/money-munchkins/health').then(r=>r.json()).then(d=>{
    document.getElementById('healthVal').textContent = d.status || 'unknown';
  }).catch(()=>{ document.getElementById('healthVal').textContent = 'unavailable'; });

  fetch('/api/payments/status').then(r=>r.json()).then(d=>{
    document.getElementById('paymentsVal').textContent = d.configured ? 'configured' : 'manual mode';
    document.getElementById('providerVal').textContent = d.provider || '—';
  }).catch(()=>{ document.getElementById('paymentsVal').textContent = 'unavailable'; });

  // --- Crew flip cards ---
  document.querySelectorAll('[data-crew]').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });

  // --- Mission simulator (earn -> save -> spend) ---
  let stardust = 0;
  let choresLogged = 0;
  const DAILY_LIMIT = 3;
  const stardustEl = document.getElementById('stardustCount');
  const simBody = document.getElementById('simBody');
  const simNote = document.getElementById('simNote');
  const steps = {
    earn: document.getElementById('stepEarn'),
    save: document.getElementById('stepSave'),
    spend: document.getElementById('stepSpend'),
  };

  function setStep(name){
    Object.entries(steps).forEach(([key, el]) => {
      el.classList.remove('active');
      if (key === name) el.classList.add('active');
    });
  }
  function markDone(name){ steps[name].classList.remove('active'); steps[name].classList.add('done'); }

  function logChore(){
    if (choresLogged >= DAILY_LIMIT) return;
    choresLogged++;
    stardust += 10;
    stardustEl.textContent = stardust;
    simNote.textContent = choresLogged + ' of ' + DAILY_LIMIT + ' chores logged today.';

    if (choresLogged >= DAILY_LIMIT) {
      markDone('earn');
      setStep('save');
      renderSaveStep();
    } else {
      simBody.querySelector('#logChoreBtn').outerHTML =
        '<button class="sim-btn" id="logChoreBtn" onclick="logChore()">Log a chore (+10 ✦)</button>';
    }
  }

  function renderSaveStep(){
    simBody.innerHTML = `
      <p style="color:var(--paper-dim);font-size:14.5px;margin-bottom:10px;">Send stardust toward a savings pod. Goal: a new telescope (60 ✦).</p>
      <div class="pod-label"><span>Pod progress</span><span id="podPct">0%</span></div>
      <div class="pod-track"><div class="pod-fill" id="podFill"></div></div>
      <div class="sim-row" style="margin-top:14px;">
        <button class="sim-btn" onclick="sendToPod()">Send ${stardust} ✦ to pod</button>
      </div>
      <div class="sim-note" id="simNote"></div>
    `;
  }

  function sendToPod(){
    const goal = 60;
    const pct = Math.min(100, Math.round((stardust / goal) * 100));
    document.getElementById('podFill').style.width = pct + '%';
    document.getElementById('podPct').textContent = pct + '%';
    document.getElementById('simNote').textContent = pct >= 100
      ? 'Pod is full! Ready to decide what happens next.'
      : (goal - stardust) + ' more stardust needed — come back tomorrow for more missions.';

    if (pct >= 100) {
      markDone('save');
      setStep('spend');
      setTimeout(renderSpendStep, 500);
    }
  }

  function renderSpendStep(){
    simBody.innerHTML = `
      <p style="color:var(--paper-dim);font-size:14.5px;margin-bottom:14px;">The pod is full. What does the Munchkin do?</p>
      <div class="sim-row">
        <button class="sim-btn" onclick="finishSim('Cashed out — the telescope is on its way.')">Cash out</button>
        <button class="sim-btn alt" onclick="finishSim('Kept growing — rolled into next weeks goal.')">Keep growing</button>
        <button class="sim-btn alt" onclick="finishSim('Split it — some spent, some saved, some shared.')">Split it</button>
      </div>
      <div class="sim-note" id="simNote"></div>
    `;
  }

  function finishSim(message){
    markDone('spend');
    document.getElementById('simNote').textContent = message + " That's the whole loop — try it again anytime.";
    simBody.querySelectorAll('button').forEach(b => b.disabled = true);
  }
</script>

</body>
</html>
LANDING_EOF
echo "landing page written"

echo "=== 2/5: creating web/dashboard/index.html (ops console) ==="
cat > web/dashboard/index.html << 'DASH_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Money Munchkins — Ops Console</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0D0B1F;
    --panel:#161331;
    --panel-2:#1D1A3E;
    --line:rgba(245,241,232,.08);
    --paper:#F5F1E8;
    --dim:#9791BE;
    --mint:#4ADE80;
    --amber:#FFC857;
    --red:#FF6B6B;
    --violet:#7C5CD6;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{
    background:var(--bg);color:var(--paper);
    font-family:'IBM Plex Mono',monospace;
    padding:28px 20px 60px;
  }
  .display{font-family:'Space Grotesk',sans-serif;}
  .wrap{max-width:1100px;margin:0 auto;}
  header{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;margin-bottom:28px;}
  header h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;display:flex;align-items:center;gap:10px;}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--mint);box-shadow:0 0 10px var(--mint);}
  .dot.bad{background:var(--red);box-shadow:0 0 10px var(--red);}
  header .meta{font-size:12px;color:var(--dim);}
  .refresh-note{font-size:11px;color:var(--dim);}

  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px;}
  @media (max-width:900px){.grid{grid-template-columns:repeat(2,1fr);}}
  @media (max-width:520px){.grid{grid-template-columns:1fr;}}

  .card{
    background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;
    position:relative;overflow:hidden;
  }
  .card .label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--dim);}
  .card .value{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;margin-top:8px;}
  .card .sub{font-size:11.5px;color:var(--dim);margin-top:6px;}
  .value.ok{color:var(--mint);}
  .value.warn{color:var(--amber);}
  .value.bad{color:var(--red);}

  .panels{display:grid;grid-template-columns:1.3fr .7fr;gap:14px;}
  @media (max-width:900px){.panels{grid-template-columns:1fr;}}

  .panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px;margin-bottom:14px;}
  .panel h2{font-family:'Space Grotesk',sans-serif;font-size:15px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;}
  .panel h2 span.tag{font-size:10.5px;color:var(--dim);font-weight:400;text-transform:uppercase;letter-spacing:.06em;}

  table{width:100%;border-collapse:collapse;font-size:12.5px;}
  th{text-align:left;color:var(--dim);font-weight:500;padding:8px 6px;border-bottom:1px solid var(--line);text-transform:uppercase;font-size:10.5px;letter-spacing:.06em;}
  td{padding:9px 6px;border-bottom:1px solid var(--line);color:var(--paper);}
  tr:last-child td{border-bottom:none;}
  .status-chip{
    display:inline-block;font-size:10.5px;padding:2px 8px;border-radius:999px;
    background:rgba(74,222,128,.12);color:var(--mint);
  }
  .status-chip.off{background:rgba(151,145,190,.12);color:var(--dim);}

  .endpoint-list{display:flex;flex-direction:column;gap:8px;}
  .endpoint-row{
    display:flex;justify-content:space-between;align-items:center;
    padding:10px 12px;background:var(--panel-2);border-radius:10px;font-size:12px;
  }
  .endpoint-row .path{color:var(--paper);}
  .endpoint-row .code{padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;}
  .code.c200{background:rgba(74,222,128,.15);color:var(--mint);}
  .code.c000{background:rgba(255,107,107,.15);color:var(--red);}
  .code.pending{background:rgba(151,145,190,.15);color:var(--dim);}

  .empty{color:var(--dim);font-size:12.5px;padding:16px 0;text-align:center;}

  .foot{margin-top:20px;font-size:11px;color:var(--dim);display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;}
  .foot a{color:var(--dim);}
  .foot a:hover{color:var(--paper);}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1><span class="dot" id="headerDot"></span> Money Munchkins — Ops Console</h1>
    <div class="meta">
      <div id="lastUpdated">last check: —</div>
      <div class="refresh-note">auto-refreshes every 30s</div>
    </div>
  </header>

  <div class="grid">
    <div class="card">
      <div class="label">Service Health</div>
      <div class="value" id="healthCard">—</div>
      <div class="sub" id="healthSub">/api/money-munchkins/health</div>
    </div>
    <div class="card">
      <div class="label">Payments</div>
      <div class="value" id="paymentsCard">—</div>
      <div class="sub" id="paymentsSub">/api/payments/status</div>
    </div>
    <div class="card">
      <div class="label">Provider</div>
      <div class="value" id="providerCard">—</div>
      <div class="sub">PAYMENT_PROVIDER env</div>
    </div>
    <div class="card">
      <div class="label">Daily Mission Cap</div>
      <div class="value">3<span style="font-size:14px;color:var(--dim);"> / munchkin</span></div>
      <div class="sub">enforced server-side</div>
    </div>
  </div>

  <div class="panels">
    <div>
      <div class="panel">
        <h2>API surface <span class="tag">live poll</span></h2>
        <div class="endpoint-list" id="endpointList"></div>
      </div>

      <div class="panel">
        <h2>Mounted routers <span class="tag">from server.js</span></h2>
        <table>
          <thead><tr><th>Mount path</th><th>Module</th></tr></thead>
          <tbody id="routerTable"></tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="panel">
        <h2>Quick links</h2>
        <table>
          <tbody>
            <tr><td>Public landing</td><td><a href="/" style="color:var(--amber)">/</a></td></tr>
            <tr><td>Investor center</td><td><a href="/money-munchkins/investor" style="color:var(--amber)">/investor</a></td></tr>
            <tr><td>Pilot feedback</td><td><a href="/money-munchkins/pilot" style="color:var(--amber)">/pilot</a></td></tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>Environment</h2>
        <table>
          <tbody id="envTable"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="foot">
    <div>Money Munchkins: Quantum Odyssey · internal console</div>
    <div><a href="/api/money-munchkins/health">raw health JSON</a> · <a href="/api/payments/status">raw payment JSON</a></div>
  </div>
</div>

<script>
  const endpoints = [
    { label: 'Health', path: '/api/money-munchkins/health' },
    { label: 'Payments status', path: '/api/payments/status' },
    { label: 'Missions', path: '/api/money-munchkins/missions' },
    { label: 'Characters', path: '/api/money-munchkins/characters' },
    { label: 'Cards', path: '/api/money-munchkins/cards' },
  ];

  const routers = [
    ['/api/money-munchkins', 'api/index.js'],
    ['/api/money-munchkins/progress', 'api/progress.js'],
    ['/api/money-munchkins/investor', 'api/investor/'],
    ['/api/money-munchkins/growth', 'api/growth/'],
    ['/api/money-munchkins/analytics', 'api/analytics/'],
    ['/api/money-munchkins/audit', 'api/audit/'],
    ['/api/money-munchkins/revenue', 'api/revenue/'],
    ['/api/money-munchkins/payments', 'api/payments/'],
    ['/api/money-munchkins/parent', 'api/parent.js'],
    ['/api/money-munchkins/pilot-feedback', 'api/pilot-feedback.js'],
    ['/api/money-munchkins/learning', 'api/learning.js'],
  ];

  function renderRouterTable(){
    document.getElementById('routerTable').innerHTML = routers.map(([mount, mod]) =>
      `<tr><td>${mount}</td><td style="color:var(--dim)">${mod}</td></tr>`
    ).join('');
  }

  function renderEnvTable(env){
    const rows = [
      ['Provider', env.provider || '—'],
      ['Configured', env.configured ? 'yes' : 'no'],
    ];
    document.getElementById('envTable').innerHTML = rows.map(([k,v]) =>
      `<tr><td>${k}</td><td>${v}</td></tr>`
    ).join('');
  }

  async function pollEndpoint(ep){
    const row = document.createElement('div');
    row.className = 'endpoint-row';
    row.innerHTML = `<span class="path">${ep.label} <span style="color:var(--dim)">${ep.path}</span></span><span class="code pending">…</span>`;
    document.getElementById('endpointList').appendChild(row);
    const codeEl = row.querySelector('.code');
    try {
      const res = await fetch(ep.path);
      codeEl.textContent = res.status;
      codeEl.className = 'code ' + (res.status === 200 ? 'c200' : 'c000');
      return { ep, ok: res.status === 200, data: res.status === 200 ? await res.json().catch(()=>null) : null };
    } catch (e) {
      codeEl.textContent = 'ERR';
      codeEl.className = 'code c000';
      return { ep, ok: false, data: null };
    }
  }

  async function refresh(){
    document.getElementById('endpointList').innerHTML = '';
    renderRouterTable();

    const results = await Promise.all(endpoints.map(pollEndpoint));
    const health = results.find(r => r.ep.path.includes('health'));
    const payments = results.find(r => r.ep.path.includes('payments'));

    const headerDot = document.getElementById('headerDot');
    const healthCard = document.getElementById('healthCard');
    const healthSub = document.getElementById('healthSub');
    if (health && health.ok && health.data) {
      healthCard.textContent = health.data.status || 'healthy';
      healthCard.className = 'value ok';
      healthSub.textContent = health.data.service || '/api/money-munchkins/health';
      headerDot.className = 'dot';
    } else {
      healthCard.textContent = 'down';
      healthCard.className = 'value bad';
      headerDot.className = 'dot bad';
    }

    const paymentsCard = document.getElementById('paymentsCard');
    const providerCard = document.getElementById('providerCard');
    if (payments && payments.ok && payments.data) {
      paymentsCard.textContent = payments.data.configured ? 'configured' : 'manual';
      paymentsCard.className = 'value ' + (payments.data.configured ? 'ok' : 'warn');
      providerCard.textContent = payments.data.provider || '—';
      renderEnvTable(payments.data);
    } else {
      paymentsCard.textContent = 'down';
      paymentsCard.className = 'value bad';
    }

    document.getElementById('lastUpdated').textContent = 'last check: ' + new Date().toLocaleTimeString();
  }

  refresh();
  setInterval(refresh, 30000);
</script>
</body>
</html>
DASH_EOF
echo "dashboard written"

echo "=== 3/5: patching server.js (adds dashboard route, wires landing page to /) ==="
python3 - << 'PY_EOF'
from pathlib import Path

p = Path("server.js")
s = p.read_text()
changed = False

if '/money-munchkins/dashboard' not in s:
    dash_route = '''app.get("/money-munchkins/dashboard", (req, res) => {
  const configured = process.env.MONEY_MUNCHKINS_DASHBOARD_CODE;
  const supplied = req.query.code;
  if (configured && supplied !== configured) {
    return res.status(401).send("Dashboard access code required (add ?code=... to the URL)");
  }
  res.sendFile(require("path").join(__dirname, "web/dashboard/index.html"));
});

'''
    marker = 'app.use("/money-munchkins", express.static'
    if marker not in s:
        raise SystemExit("could not find static mount marker — aborting, server.js NOT modified")
    idx = s.index(marker)
    s = s[:idx] + dash_route + s[idx:]
    changed = True
else:
    print("dashboard route already present — skipping")

old_root = '''app.get("/", (req, res) => {
  res.json({
    name: "Money Munchkins: Quantum Odyssey",
    version: "0.1.0",
    status: "online"
  });
});'''

new_root = '''app.get("/api/status", (req, res) => {
  res.json({
    name: "Money Munchkins: Quantum Odyssey",
    version: "0.1.0",
    status: "online"
  });
});

app.get("/", (req, res) => {
  res.sendFile(require("path").join(__dirname, "web/index.html"));
});'''

if old_root in s:
    if s.count(old_root) != 1:
        raise SystemExit(f"expected exactly 1 match for root handler, found {s.count(old_root)} — aborting, server.js NOT modified")
    s = s.replace(old_root, new_root)
    changed = True
elif 'res.sendFile(require("path").join(__dirname, "web/index.html"))' in s:
    print("root landing route already present — skipping")
else:
    print("WARNING: root JSON handler not found in expected exact form.")
    print("server.js was NOT modified for the landing page route.")
    print("You'll need to wire '/' to serve web/index.html by hand.")

if changed:
    p.write_text(s)
    print("server.js patched")
else:
    print("no changes made to server.js")
PY_EOF

echo "=== 4/5: verifying syntax ==="
node --check server.js && echo "server.js syntax OK"

echo "=== 5/5: killing any stale process on port 3310 and live-testing ==="
(fuser -k 3310/tcp 2>/dev/null; pkill -f "node server.js" 2>/dev/null; true)
sleep 1
(node server.js > ./m2-server.log 2>&1 &
SERVER_PID=$!
sleep 2
echo "--- landing page ( / ) ---"; curl -sS -o /dev/null -w "%{http_code}\n" localhost:3310/
echo "--- dashboard ( /money-munchkins/dashboard ) ---"; curl -sS -o /dev/null -w "%{http_code}\n" localhost:3310/money-munchkins/dashboard
echo "--- health (unchanged) ---"; curl -sS -o /dev/null -w "%{http_code}\n" localhost:3310/api/money-munchkins/health
echo "--- payments (unchanged) ---"; curl -sS -o /dev/null -w "%{http_code}\n" localhost:3310/api/payments/status
echo "--- api/status (moved JSON) ---"; curl -sS -o /dev/null -w "%{http_code}\n" localhost:3310/api/status
kill -9 $SERVER_PID 2>/dev/null)
cat ./m2-server.log

echo ""
echo "========================================"
echo "If all routes above returned 200, open http://127.0.0.1:3310/ in a"
echo "browser (via the server, not by double-clicking the HTML file) and"
echo "try the crew cards and the mission demo. Then:"
echo "  git add web/index.html web/dashboard/index.html server.js"
echo "  git commit -m 'feat: interactive crew + mission demo on M2 landing page'"
echo "  git push origin main"
echo ""
echo "Optional: set MONEY_MUNCHKINS_DASHBOARD_CODE in Render's env vars"
echo "to gate the dashboard (e.g. /money-munchkins/dashboard?code=yourcode)."
echo "========================================"
