#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║     🚀 SELF‑DRIVING MODE ACTIVATED                  ║"
echo "  ║     Nia is now fully autonomous.                    ║"
echo "  ║     Lead → Contract → Fund → Close — all automated. ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Install required packages ────────────────────────────
echo "📦 Installing automation packages..."
cd ~/nia-capital-os
npm install stripe nodemailer node-calendar  # calendar integration
npm install @stripe/stripe-js

# ─── 2. Add Auto‑Scheduling Module ───────────────────────────
cat > modules/scheduler/auto-schedule.js << 'SCHEDULE_EOF'
const nodemailer = require('nodemailer');

// Calendar integration (Google Calendar API would be ideal, but we'll use email invites for now)
function sendInspectionInvite(sellerEmail, propertyAddress, dateTime) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: 'Inspection Scheduled – Nia Capital OS',
    text: `Your property inspection has been scheduled for ${dateTime} at ${propertyAddress}. 
Please confirm by replying to this email or SMS.`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) console.error('Inspection email error:', err);
    else console.log(`✅ Inspection invite sent to ${sellerEmail}`);
  });
}

// Auto‑schedule inspection when deal is ready
function scheduleInspection(deal) {
  const date = new Date();
  date.setDate(date.getDate() + 1); // schedule for tomorrow
  const dateTime = date.toLocaleString();
  sendInspectionInvite(deal.sellerEmail, deal.property, dateTime);
  console.log(`📅 Inspection scheduled for ${deal.property} at ${dateTime}`);
}

module.exports = { scheduleInspection };
SCHEDULE_EOF

