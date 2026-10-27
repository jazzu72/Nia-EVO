'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// --- Portal field maps -------------------------------------------------------
// Selector strategies tried in order:
//   1. exact selector (if provided)
//   2. label text containing match string
//   3. placeholder text containing match string
//   4. aria-label containing match string
//   5. name/id attribute containing normalized match string
// React/Vue inputs need synthetic input+change events — handled in bookmarklet.

const PORTAL_MAPS = {
  NSF_SBIR_PITCH: {
    name: 'NSF SBIR Project Pitch',
    url: 'https://seedfund.nsf.gov/project-pitch/',
    fields: [
      { match: 'project title',            kind: 'title',    maxLen: 200 },
      { match: 'technology innovation',    kind: 'tech',     maxLen: 2500 },
      { match: 'technical objectives',     kind: 'objectives', maxLen: 5000 },
      { match: 'commercial potential',     kind: 'commercial', maxLen: 2500 },
      { match: 'team',                     kind: 'team',     maxLen: 2500 },
      { match: 'founder',                  kind: 'team',     maxLen: 2500, optional: true }
    ],
    submitHint: 'Review all filled fields carefully. Click "Submit Project Pitch" yourself. Nia does not submit.'
  },
  NSF_SBIR_PROPOSAL: {
    name: 'NSF SBIR Phase I Full Proposal',
    url: 'https://www.research.gov/',
    fields: [
      { match: 'project summary',          kind: 'summary' },
      { match: 'project description',      kind: 'objectives' },
      { match: 'references cited',         kind: 'references', optional: true },
      { match: 'budget justification',     kind: 'budget', optional: true },
      { match: 'biographical sketch',      kind: 'team', optional: true }
    ],
    submitHint: 'This is a multi-page submission. Fill each page, save, then submit yourself.'
  },
  VIPC: {
    name: 'VIPC Launch Grant',
    url: 'https://www.vipc.org/',
    fields: [
      { match: 'company name',             kind: 'legalName', optional: true },
      { match: 'contact',                  kind: 'team', optional: true },
      { match: 'project description',      kind: 'objectives' },
      { match: 'use of funds',             kind: 'budget', optional: true },
      { match: 'milestone',                kind: 'milestones', optional: true }
    ],
    submitHint: 'Review all sections. Submit through VIPC portal yourself.'
  },
  GENERIC: {
    name: 'Generic Portal',
    url: null,
    fields: [
      { match: 'title',                    kind: 'title', optional: true },
      { match: 'summary',                  kind: 'summary', optional: true },
      { match: 'description',              kind: 'objectives', optional: true }
    ],
    submitHint: 'Review all fields. Submit yourself.'
  }
};

function detectPortal(grantTitle) {
  const g = (grantTitle || '').toLowerCase();
  if (/nsf|sbir|sttr|national science/.test(g)) return 'NSF_SBIR_PITCH';
  if (/vipc|virginia innovation/.test(g))      return 'VIPC';
  return 'GENERIC';
}

// --- Extract field values from the application kit --------------------------
function valueForKind(kind, kit) {
  const findSection = (pattern) => {
    const s = (kit.sections || []).find(x => pattern.test(x.title || ''));
    return s ? s.body : '';
  };
  switch (kind) {
    case 'title':       return (kit.sections || []).find(s => /Project Title/i.test(s.title))?.body?.split('\n')[0]?.replace(/\*\*/g,'').replace(/^\s+|\s+$/g,'') || `${kit.grant} — Application`;
    case 'tech':        return stripHeader(findSection(/Technical Innovation/i));
    case 'summary':     return stripHeader(findSection(/Project Summary|Technical Innovation/i));
    case 'objectives':  return stripHeader(findSection(/Technical Objectives|Project Description/i));
    case 'commercial':  return stripHeader(findSection(/Commercial Potential/i));
    case 'team':        return stripHeader(findSection(/Team|PI Qualifications/i)) || kit.identity?.founderName || '';
    case 'budget':      return stripHeader(findSection(/Budget/i));
    case 'milestones':  return stripHeader(findSection(/Milestone|Objectives/i));
    case 'references':  return stripHeader(findSection(/References/i));
    case 'legalName':   return kit.identity?.legalName || '';
    default:            return '';
  }
}

function stripHeader(text) {
  if (!text) return '';
  // Remove markdown title and [DRAFT]/[REQUIRED] prefixes so the value is clean prose
  return String(text)
    .replace(/^\[DRAFT[^\]]*\]\s*/i, '')
    .replace(/^\[REQUIRED[^\]]*\]\s*/i, '')
    .replace(/\*\*/g, '')
    .trim();
}

// --- Build fill plan ---------------------------------------------------------
function buildFillPlan(grantId) {
  const engine = require('./grants-prep-engine');
  const kit = engine.buildKit(grantId);

  const portalKey = detectPortal(kit.grant);
  const portal = PORTAL_MAPS[portalKey];
  if (!portal) {
    const e = new Error('Unknown portal type: ' + portalKey);
    e.code = 'UNKNOWN_PORTAL';
    throw e;
  }

  const fields = [];
  for (const f of portal.fields) {
    const value = valueForKind(f.kind, kit);
    if (!value && f.optional) continue;
    fields.push({
      match: f.match,
      selector: f.selector || null,
      value: value,
      required: !f.optional,
      maxLen: f.maxLen || null
    });
  }

  return {
    grantId: 'grant-' + grantId,
    grantTitle: kit.grant,
    amount: kit.amount,
    portalName: portal.name,
    portalUrl: portal.url,
    submitHint: portal.submitHint,
    fields,
    generatedAt: new Date().toISOString(),
    legalNotice: 'Nia fills fields but does not click Submit. You are the Authorized Organizational Representative and must click Submit yourself. Login credentials never touch Nia.'
  };
}

// --- Bookmarklet generator --------------------------------------------------
// One bookmarklet works for all portals. You pass the fill-plan when tapped.
// The bookmarklet finds each field, sets it, fires React/Vue synthetic events,
// highlights filled fields green, and outlines the submit button yellow.

const BOOKMARKLET_BODY = `
(async function(){
  function $(s){return document.querySelector(s)}
  function all$(){return Array.from(document.querySelectorAll('input,textarea,select,[contenteditable="true"]'))}
  function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function fire(el,evt){el.dispatchEvent(new Event(evt,{bubbles:true}))}
  function setVal(el,v){
    if(el.isContentEditable){
      el.focus();
      el.textContent=v;
      fire(el,'input');fire(el,'change');
      return true;
    }
    const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
    const setter=Object.getOwnPropertyDescriptor(proto,'value').set;
    setter.call(el,v);
    fire(el,'input');fire(el,'change');fire(el,'blur');
    return true;
  }
  function findField(spec){
    if(spec.selector){const e=$(spec.selector);if(e)return e}
    const m=norm(spec.match);
    const els=all$();
    for(const el of els){
      const lbl=(el.labels&&el.labels[0]&&el.labels[0].textContent)||'';
      if(norm(lbl).includes(m))return el;
    }
    for(const el of els){
      if(norm(el.placeholder).includes(m))return el;
      if(norm(el.getAttribute('aria-label')).includes(m))return el;
    }
    for(const el of els){
      if(norm(el.name).includes(m)||norm(el.id).includes(m))return el;
    }
    return null;
  }
  const input=prompt('Paste fill-plan JSON:');
  if(!input)return;
  let plan;
  try{plan=JSON.parse(input)}catch(e){alert('Invalid JSON: '+e.message);return}
  let ok=0,miss=[];
  const filled=[];
  for(const f of plan.fields){
    const el=findField(f);
    if(!el){miss.push(f.match);continue}
    let v=f.value||'';
    if(f.maxLen&&v.length>f.maxLen)v=v.slice(0,f.maxLen-1)+'…';
    setVal(el,v);
    el.style.outline='2px solid #2a8';
    el.style.outlineOffset='2px';
    filled.push(el);
    ok++;
  }
  const submit=Array.from(document.querySelectorAll('button,input[type=submit]')).find(b=>/submit|send|apply|next/i.test(b.textContent||b.value||''));
  if(submit){
    submit.style.outline='3px solid #d4af37';
    submit.style.outlineOffset='3px';
    submit.style.boxShadow='0 0 12px rgba(212,175,55,0.6)';
    submit.scrollIntoView({behavior:'smooth',block:'center'});
  }
  const msg='Filled '+ok+' / '+(plan.fields.length)+' fields.'+(miss.length?'\\nNot found: '+miss.join(', '):'')+'\\n\\n'+(submit?'Submit button highlighted gold. Click it YOURSELF after review.':'No submit button found — submit manually.')+'\\n\\n'+plan.legalNotice;
  try{
    const r=await fetch('/nia/api/grants/'+plan.grantId+'/fill-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filled:ok,missing:miss,url:location.href,at:new Date().toISOString()})});
  }catch(e){}
  alert(msg);
})();
`.replace(/\s+/g, ' ').trim();

function buildBookmarklet() {
  return 'javascript:' + encodeURIComponent(BOOKMARKLET_BODY).replace(/%20/g, ' ');
}

module.exports = {
  buildFillPlan,
  buildBookmarklet,
  detectPortal,
  PORTAL_MAPS
};
