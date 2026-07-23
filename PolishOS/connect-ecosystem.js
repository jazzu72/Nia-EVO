// Connect Polish to MuseForge and Nia

const { musicVault } = require('../../MuseForgeOS/connect-to-nia.js');
const { emailLoanApplication } = require('../../NIA-CEO/chief-of-staff.js');

async function sendVisualRelease(visualData) {
  await emailLoanApplication(
    process.env.POLISH_EMAIL || 'your-email@example.com',
    `🎬 New Visual Release: ${visualData.title}`,
    `Visual "${visualData.title}" has been created.\nFilter: ${visualData.filter}\nPlatform: ${visualData.platform}`
  );
}

module.exports = {
  sendVisualRelease
};
