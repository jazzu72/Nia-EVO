'use strict';

// Self-contained helper bundle. Built as a single function so its
// .toString() can be eval'd in any browser page (puppeteer or bookmarklet).

function makeFinderBundle() {
  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function isVisible(el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findBySpec(spec) {
    if (spec.selector) {
      var sel = document.querySelector(spec.selector);
      if (sel && isVisible(sel)) return sel;
    }
    if (!spec.match) return null;
    var target = normalize(spec.match);
    var candidates = Array.from(document.querySelectorAll(
      'input:not([type=hidden]):not([type=submit]):not([type=button]),' +
      'textarea,select,[contenteditable="true"]'
    )).filter(isVisible);
    var i, el, j, labelText, lb, ref, cursor, depth;
    for (i = 0; i < candidates.length; i++) {
      el = candidates[i];
      labelText = Array.from(el.labels || []).map(function (l) { return l.textContent; }).join(' ');
      if (normalize(labelText).indexOf(target) !== -1) return el;
    }
    for (i = 0; i < candidates.length; i++) {
      if (normalize(candidates[i].placeholder).indexOf(target) !== -1) return candidates[i];
    }
    for (i = 0; i < candidates.length; i++) {
      el = candidates[i];
      if (normalize(el.getAttribute('aria-label')).indexOf(target) !== -1) return el;
      lb = el.getAttribute('aria-labelledby');
      if (lb) {
        ref = document.getElementById(lb);
        if (ref && normalize(ref.textContent).indexOf(target) !== -1) return el;
      }
    }
    for (i = 0; i < candidates.length; i++) {
      if (normalize(candidates[i].name).indexOf(target) !== -1) return candidates[i];
      if (normalize(candidates[i].id).indexOf(target) !== -1) return candidates[i];
    }
    for (i = 0; i < candidates.length; i++) {
      cursor = candidates[i].previousElementSibling;
      depth = 0;
      while (cursor && depth < 4) {
        if (normalize(cursor.textContent).indexOf(target) !== -1) return candidates[i];
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
      var opts = Array.from(el.options);
      var match = null;
      for (var k = 0; k < opts.length; k++) {
        if (normalize(opts[k].textContent).indexOf(normalize(value)) !== -1 || opts[k].value === value) {
          match = opts[k];
          break;
        }
      }
      if (!match) return false;
      el.value = match.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }

  function fillSpecs(specs, opts) {
    var overwrite = !!(opts && opts.overwrite);
    var results = [];
    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      var el = findBySpec(spec);
      if (!el) { results.push({ match: spec.match, status: 'NOT_FOUND' }); continue; }
      if (!overwrite && el.value && el.value.trim().length > 0 && !el.isContentEditable) {
        results.push({ match: spec.match, status: 'SKIP_FILLED' });
        continue;
      }
      var v = spec.value || '';
      if (spec.maxLen && v.length > spec.maxLen) v = v.slice(0, spec.maxLen - 1) + '\u2026';
      var ok = setValue(el, v);
      if (ok) {
        el.style.outline = '2px solid #2a8';
        el.style.outlineOffset = '2px';
      }
      results.push({ match: spec.match, status: ok ? 'FILLED' : 'SET_FAILED' });
    }
    return results;
  }

  function highlightSubmitCandidates() {
    var all = Array.from(document.querySelectorAll('button,input[type=submit],input[type=button],a[role=button]'));
    var submitlike = all.filter(function (el) {
      return /submit|apply|send|attest|finalize|transmit|certify/i.test(el.textContent || el.value || '');
    });
    for (var i = 0; i < submitlike.length; i++) {
      submitlike[i].style.outline = '3px solid #d4af37';
      submitlike[i].style.outlineOffset = '3px';
      submitlike[i].style.boxShadow = '0 0 12px rgba(212,175,55,0.6)';
    }
    if (submitlike[0]) submitlike[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return submitlike.length;
  }

  return {
    normalize: normalize,
    isVisible: isVisible,
    findBySpec: findBySpec,
    setValue: setValue,
    fillSpecs: fillSpecs,
    highlightSubmitCandidates: highlightSubmitCandidates
  };
}

// Node-side exports for local use
const bundle = makeFinderBundle;

const FINDER_SOURCE = '(' + makeFinderBundle.toString() + ')()';

module.exports = {
  normalize: function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); },
  isVisible: null,
  findBySpec: null,
  setValue: null,
  fillSpecs: null,
  highlightSubmitCandidates: null,
  makeFinderBundle,
  FINDER_SOURCE
};
