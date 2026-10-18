"use strict";

const WORLD_URL="/world.json";
const SAVE_KEY="money-munchkins-player-state";
const NEW_GAME=new URLSearchParams(location.search).get("newgame")==="1";

let world;
let state={
  playerResources:{spark_coins:50,xp:0},
  skills:{money_basics:0,needs_vs_wants:0,saving:0,budgeting:0,planning:0},
  completedMissions:[],
  unlockedLocations:["loc_market_district"],
  currentMission:null,
  currentDecision:null
};

if(!NEW_GAME){
  try{
    const saved=localStorage.getItem(SAVE_KEY);
    if(saved) state={...state,...JSON.parse(saved)};
  }catch(e){}
}else{
  localStorage.removeItem(SAVE_KEY);
}

function save(){
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
}

function esc(v){
  return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function app(){
  document.getElementById("game").innerHTML=`
    <div class="game">
      <header class="hud">
        <div class="brand">
          <div class="logo">M</div>
          <div><b>MONEY MUNCHKINS</b><small>QUANTUM ODYSSEY</small></div>
        </div>
        <div class="stats">
          <span>✨ <b id="coins">${state.playerResources.spark_coins}</b></span>
          <span>⭐ <b id="xp">${state.playerResources.xp}</b></span>
        </div>
      </header>
      <main id="scene"></main>
    </div>`;
}

function scene(html){
  document.getElementById("scene").innerHTML=html;
}

function intro(){
  scene(`
    <section class="cinematic">
      <div class="stars"></div>
      <div class="nova">N</div>
      <div class="cinematic-copy">
        <div class="eyebrow">QUANTUM BRANCH STUDIO</div>
        <h1>Something just<br><em>changed.</em></h1>
        <p>Nova has discovered a hidden doorway beneath Spark City.</p>
        <button id="enter">ENTER SPARK CITY →</button>
      </div>
    </section>`);
  document.getElementById("enter").onclick=city;
}

function city(){
  scene(`
    <section class="city">
      <div class="eyebrow">SPARK CITY</div>
      <h1>Every choice creates a path.</h1>
      <p class="lead">Welcome, Nova. Choose where your quantum journey begins.</p>
      <div class="locations">
        <button class="location active" id="market">
          <strong>🏙️ Market District</strong>
          <span>Learn how money moves.</span>
          <b>ENTER →</b>
        </button>
        <div class="location locked">💰 Savings Station <small>Unlock through your choices</small></div>
        <div class="location locked">🔨 Builder's Workshop <small>Unlock through planning</small></div>
        <div class="location locked">⚛️ Quantum Lab <small>Complete your first adventure</small></div>
      </div>
    </section>`);
  document.getElementById("market").onclick=missionSelect;
}

function missionSelect(){
  const missions=world.missions||[];
  scene(`
    <section class="missions">
      <div class="eyebrow">MARKET DISTRICT</div>
      <h1>Choose your first adventure.</h1>
      <div class="mission-list">
        ${missions.map((m,i)=>{
          const done=state.completedMissions.includes(m.id);
          return `<button class="mission ${done?"done":""}" data-id="${esc(m.id)}">
            <span class="mission-number">0${i+1}</span>
            <span><strong>${esc(m.title||m.name)}</strong><small>${esc(m.description||"Discover something new.")}</small></span>
            <b>${done?"✓":"→"}</b>
          </button>`;
        }).join("")}
      </div>
    </section>`);
  document.querySelectorAll(".mission").forEach(b=>{
    b.onclick=()=>startMission(b.dataset.id);
  });
}

function startMission(id){
  const mission=world.missions.find(m=>m.id===id);
  if(!mission)return;
  if(state.completedMissions.includes(id)){
    outcome(mission,true);
    return;
  }
  state.currentMission=mission;
  const node=(world.decisionNodes||[]).find(n=>n.id===mission.startingNode);
  if(!node)return;
  decision(mission,node);
}

function decision(mission,node){
  state.currentDecision=node;
  const options=node.options||[];
  scene(`
    <section class="decision">
      <div class="scene-card">
        <div class="eyebrow">${esc(mission.title)}</div>
        <div class="nova-small">N</div>
        <h1>${esc(node.prompt||"What will you choose?")}</h1>
        <p>Your choice changes what happens next.</p>
        <div class="choices">
          ${options.map(o=>`
            <button class="choice" data-option="${esc(o.id)}">
              <span>${esc(o.label)}</span><b>→</b>
            </button>`).join("")}
        </div>
      </div>
    </section>`);
  document.querySelectorAll(".choice").forEach(b=>{
    b.onclick=()=>choose(mission,node,b.dataset.option);
  });
}

function choose(mission,node,optionId){
  const option=(node.options||[]).find(o=>o.id===optionId);
  if(!option)return;

  applyEffects(option.effects||[]);

  if(option.nextNodeId){
    const next=(world.decisionNodes||[]).find(n=>n.id===option.nextNodeId);
    if(next){
      save();
      decision(mission,next);
      return;
    }
  }

  complete(mission,option);
}

function applyEffects(effects){
  for(const e of effects){
    const type=String(e.type||"").toUpperCase();
    if(type==="RESOURCE"){
      const key=e.resource||e.key;
      state.playerResources[key]=(state.playerResources[key]||0)+Number(e.amount||0);
    }
    if(type==="SKILL"){
      const key=e.skill||e.key;
      state.skills[key]=(state.skills[key]||0)+Number(e.amount||0);
    }
    if(type==="UNLOCK_LOCATION"&&e.locationId){
      if(!state.unlockedLocations.includes(e.locationId))
        state.unlockedLocations.push(e.locationId);
    }
  }
}

function complete(mission,option){
  const reward=mission.reward||{};
  if(!state.completedMissions.includes(mission.id))
    state.completedMissions.push(mission.id);

  state.playerResources.spark_coins+=Number(reward.spark_coins||0);
  state.playerResources.xp+=Number(reward.xp||0);

  save();
  outcome(mission,false,option);
}

function outcome(mission,already,option){
  scene(`
    <section class="outcome">
      <div class="success">✦</div>
      <div class="eyebrow">${already?"ADVENTURE COMPLETE":"QUANTUM PATH CREATED"}</div>
      <h1>${already?"You've already explored this path.":"You made a choice."}</h1>
      <p>${already?"Try another adventure and discover a different possibility.":"Nova records the consequence. Your journey has changed."}</p>
      ${!already?`<div class="reward-box">✨ +${mission.reward?.spark_coins||0} Spark Coins &nbsp; · &nbsp; ⭐ +${mission.reward?.xp||0} XP</div>`:""}
      <button id="continue">CONTINUE →</button>
    </section>`);
  document.getElementById("continue").onclick=missionSelect;
}

async function boot(){
  const r=await fetch(WORLD_URL);
  if(!r.ok)throw new Error("WORLD_LOAD_FAILED");
  world=await r.json();
  app();
  intro();
  console.log("MONEY MUNCHKINS: PLAYABLE RUNTIME ONLINE");
  console.log("CANONICAL WORLD:",world.name);
}

boot().catch(e=>{
  console.error(e);
  document.getElementById("game").innerHTML="<h1>GAME BOOT FAILED</h1>";
});


/* QUANTUM ODYSSEY — GLOBAL INPUT BRIDGE */
document.addEventListener("click", function(e) {
  const target = e.target.closest("button,[data-action]");
  if (!target) return;

  const action = target.dataset.action || target.id;

  if (action === "enter" || action === "enter-city") {
    e.preventDefault();
    e.stopPropagation();
    if (typeof city === "function") city();
    return;
  }

  if (action === "city" || action === "spark-city") {
    e.preventDefault();
    if (typeof city === "function") city();
    return;
  }

  if (action === "missions" || action === "mission-select") {
    e.preventDefault();
    if (typeof missionSelect === "function") missionSelect();
    return;
  }

  if (action === "menu") {
    e.preventDefault();
    if (typeof city === "function") city();
    return;
  }

  if (action === "back") {
    e.preventDefault();
    if (typeof city === "function") city();
    return;
  }
}, true);

document.addEventListener("pointerdown", function(e) {
  const target = e.target.closest("button,[data-action]");
  if (target) {
    target.style.transform = "scale(.98)";
    setTimeout(() => target.style.transform = "", 120);
  }
}, true);

console.log("QUANTUM INPUT BRIDGE: ONLINE");
