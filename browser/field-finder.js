'use strict';

// Shared element resolution. Works in both puppeteer (DOM) and bookmarklet
// (page context). Prioritizes: explicit selector > label > placeholder >
// aria-label > name > id. Skips hidden fields and fields already filled
// (unless overwrite is set).

function normalize(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function findBySpec(spec) {
  if (spec.selector) {
    const el = document.querySelector(spec.selector);
    if (el && isVisible(el)) return el;
  }
  if (!spec.match) return null;
  const target = normalize(spec.match);

  const candidates = Array.from(document.querySelectorAll(
    'input:not([type=hidden]):not([type=submit]):not([type=button]),' +
    'textarea,select,[contenteditable="true"]'
  )).filter(isVisible);

  // 1. Associated <label>
  for (const el of candidates) {
    const labelText = Array.from(el.labels || []).map(l => l.textContent).join(' ');
    if (normalize(labelText).includes(target)) return el;
  }

  // 2. Placeholder
  for (const el of candidates) {
    if (normalize(el.placeholder).includes(target)) return el;
  }

  // 3. aria-label / aria-labelledby
  for (const el of candidates) {
    if (normalize(el.getAttribute('aria-label')).includes(target)) return el;
    const lb = el.getAttribute('aria-labelledby');
    if (lb) {
      const ref = document.getElementById(lb);
      if (ref && normalize(ref.textContent).includes(target)) return el;
    }
  }

  // 4. name / id attribute
  for (const el of candidates) {
    if (normalize(el.name).includes(target) || normalize(el.id).includes(target)) return el;
  }

  // 5. Nearby preceding text (walk back to a text node)
  for (const el of candidates) {
    let cursor = el.previousElementSibling;
    let depth = 0;
    while (cursor && depth < 4) {
      if (normalize(cursor.textContent).includes(target)) return el;
      cursor = cursor.previousElementSibling;
      depth++;
    }
  }
  return null;
}

function setValue(el, value) {
  if (!el) return false;
  if (el.isContentEditable) {
    el.focus();
    el.textContent = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  if (el.tagName === 'SELECT') {
    const match = Array.from(el.options).find(o =>
      normalize(o.textContent).includes(normalize(value)) || o.value === value
    );
    if (!match) return false;
    el.value = match.value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  const proto = el.tagName === 'TEXTAREA'
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
  return true;
}

function fillSpecs(specs, { overwrite = false } = {}) {
  const results = [];
  for (const spec of specs) {
    const el = findBySpec(spec);
    if (!el) { results.push({ match: spec.match, status: 'NOT_FOUND' }); continue; }
    if (!overwrite && el.value && el.value.trim().length > 0 && !el.isContentEditable) {
      results.push({ match: spec.match, status: 'SKIP_FILLED' });
      continue;
    }
    let v = spec.value || '';
    if (spec.maxLen && v.length > spec.maxLen) v = v.slice(0, spec.maxLen - 1) + '…';
    const ok = setValue(el, v);
    if (ok) {
      el.style.outline = '2px solid #2a8';
      el.style.outlineOffset = '2px';
    }
    results.push({ match: spec.match, status: ok ? 'FILLED' : 'SET_FAILED' });
  }
  return results;
}

function highlightSubmitCandidates() {
  const all = Array.from(document.querySelectorAll('button,input[type=submit],input[type=button],a[role=button]'));
  const submitlike = all.filter(el => /submit|apply|send|attest|finalize|transmit|certify/i.test(el.textContent || el.value || ''));
  for (const el of submitlike) {
    el.style.outline = '3px solid #d4af37';
    el.style.outlineOffset = '3px';
    el.style.boxShadow = '0 0 12px rgba(212,175,55,0.6)';
  }
  if (submitlike[0]) submitlike[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  return submitlike.length;
}

const FINDER_SOURCE = `(${[
  'function normalize(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}',
  'function isVisible(el){if(!el)return false;const s=window.getComputedStyle(el);if(s.display==="none"||s.visibility==="hidden"||s.opacity==="0")return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0}',
  `function findBySpec(spec){${findBySpec.toString().slice(findBySpec.toString().indexOf('{')+1, -1)}}`,
  `function setValue(el,value){${setValue.toString().slice(setValue.toString().indexOf('{')+1, -1)}}`,
  `function fillSpecs(specs,opts){${fillSpecs.toString().slice(fillSpecs.toString().indexOf('{')+1, -1)}}`,
  `function highlightSubmitCandidates(){${highlightSubmitCandidates.toString().slice(highlightSubmitCandidates.toString().indexOf('{')+1, -1)}}`
].join('\n')})`;

module.exports = {
  normalize,
  isVisible,
  findBySpec,
  setValue,
  fillSpecs,
  highlightSubmitCandidates,
  FINDER_SOURCE
};
