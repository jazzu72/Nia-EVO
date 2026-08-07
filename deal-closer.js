const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { exec } = require('child_process');

const PIPELINE_FILE = './data/revenue-pipeline.json';
const PROPOSAL_DIR = './data/proposals/';

function loadPipeline() {
  if (!fs.existsSync(PIPELINE_FILE)) return { contacts: [] };
  return JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
}

function savePipeline(data) {
  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(data, null, 2));
}

async function generateProposal(contact) {
  if (!fs.existsSync(PROPOSAL_DIR)) fs.mkdirSync(PROPOSAL_DIR, { recursive: true });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  page.drawText(`Proposal for ${contact.name}`, { x: 50, y: 700, size: 20 });
  page.drawText(`Company: ${contact.company || 'N/A'}`, { x: 50, y: 650, size: 14 });
  page.drawText(`Score: ${contact.score}`, { x: 50, y: 620, size: 14 });
  page.drawText(`Probability: ${contact.probability}%`, { x: 50, y: 590, size: 14 });
  page.drawText(`\nProposal Details:`, { x: 50, y: 540, size: 16 });
  page.drawText(`- AI Automation Package`, { x: 50, y: 510, size: 12 });
  page.drawText(`- $2,500 setup + $500/month`, { x: 50, y: 490, size: 12 });
  page.drawText(`- 20 hours/week saved`, { x: 50, y: 470, size: 12 });
  page.drawText(`- Full onboarding & support`, { x: 50, y: 450, size: 12 });

  const bytes = await pdfDoc.save();
  const filename = `${PROPOSAL_DIR}proposal-${contact.id}.pdf`;
  fs.writeFileSync(filename, bytes);
  return filename;
}

function checkAndClose() {
  const data = loadPipeline();
  const ready = data.contacts.filter(c => c.probability >= 70 && !c.proposalSent);

  ready.forEach(async (contact) => {
    const file = await generateProposal(contact);
    contact.proposalSent = true;
    contact.proposalFile = file;
    contact.proposalSentAt = new Date().toISOString();

    // Notify via Telegram
    const msg = `📄 Proposal generated for ${contact.name}\nFile: ${file}`;
    const token = process.env.TELEGRAM_BOT_TOKEN || '8845481308:AAE-K1YHbvdHTOkGbtbnGCbwKnmxW-GjH-Q';
    const chatId = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID';
    exec(`curl -s -X POST https://api.telegram.org/bot${token}/sendMessage -d "chat_id=${chatId}&text=${encodeURIComponent(msg)}"`);
  });

  savePipeline(data);
  console.log(`📄 Generated ${ready.length} proposals.`);
}

// Run every 15 minutes
module.exports = {
  checkAndClose,
  generateProposal
};

checkAndClose();
setInterval(checkAndClose, 15 * 60 * 1000);
