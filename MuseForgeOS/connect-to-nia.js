// Connect MuseForge to Nia Capital OS
// Shares: Vault, Dashboard, CEO, CoS

const { loadGrants, saveGrants } = require('../../data/grants.json');
const { emailLoanApplication } = require('../../NIA-CEO/chief-of-staff.js');
const QuantumVault = require('../../src/vault/core/vault.js');

// Reuse Nia's vault for music encryption
const musicVault = new QuantumVault();

// Reuse Nia's email for distribution alerts
async function sendReleaseAlert(track) {
  await emailLoanApplication(
    process.env.MUSEFORGE_EMAIL || 'your-email@example.com',
    `🎵 New Release: ${track.title}`,
    `Track "${track.title}" has been released.\nGenre: ${track.genre}\nDuration: ${track.duration}s`
  );
}

module.exports = {
  musicVault,
  sendReleaseAlert
};
