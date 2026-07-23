const fs = require('fs');
const path = require('path');

const INVESTORS_FILE = './data/investors.json';
const EMAIL_LOG = './logs/chief-of-staff.log';
const PITCH_DIR = './data/pitchdecks';

function loadInvestors() {
  try {
    return JSON.parse(fs.readFileSync(INVESTORS_FILE, 'utf8'));
  } catch { return []; }
}

function getEmailStats() {
  try {
    const logs = fs.readFileSync(EMAIL_LOG, 'utf8');
    const lines = logs.split('\n').filter(l => l.includes('Yahoo email sent') || l.includes('Email saved'));
    return {
      total: lines.length,
      sent: lines.filter(l => l.includes('Yahoo email sent')).length,
      fallback: lines.filter(l => l.includes('Email saved')).length
    };
  } catch {
    return { total: 0, sent: 0, fallback: 0 };
  }
}

function getLatestPitchDeck() {
  try {
    if (!fs.existsSync(PITCH_DIR)) return null;
    const files = fs.readdirSync(PITCH_DIR).filter(f => f.endsWith('.pdf'));
    if (files.length === 0) return null;
    const latest = files.sort().reverse()[0];
    return {
      name: latest,
      path: path.join(PITCH_DIR, latest),
      createdAt: fs.statSync(path.join(PITCH_DIR, latest)).birthtime
    };
  } catch {
    return null;
  }
}

function getFundraisingPipeline() {
  const investors = loadInvestors();
  const emailStats = getEmailStats();
  const pitchDeck = getLatestPitchDeck();

  return {
    summary: {
      totalInvestors: investors.length,
      contacted: investors.filter(i => i.status === 'contacted').length,
      meetings: investors.filter(i => i.status === 'meeting').length,
      interested: investors.filter(i => i.status === 'interested').length,
      termSheets: investors.filter(i => i.status === 'term_sheet').length,
      closed: investors.filter(i => i.status === 'closed').length,
      passed: investors.filter(i => i.status === 'passed').length
    },
    emailStats,
    pitchDeck,
    recentActivity: investors
      .filter(i => i.lastContact)
      .sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact))
      .slice(0, 10)
      .map(i => ({
        name: i.name,
        firm: i.firm,
        status: i.status,
        lastContact: i.lastContact
      }))
  };
}

module.exports = {
  loadInvestors,
  getEmailStats,
  getLatestPitchDeck,
  getFundraisingPipeline
};
