const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/signup', async (req, res) => {
  const { name, email, company } = req.body;

  const deployCmd = `sudo /opt/nia/scripts/deploy.sh`;
  exec(deployCmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'Deployment failed' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Nia OS — Your system is ready',
      text: `
Dear ${name},

Your Nia OS instance is now live.

📊 Dashboard: http://${req.hostname}:3000
📱 Telegram: @YourBotUsername

To get started:
1. Open Telegram and message your bot.
2. Type /help to see available commands.

Welcome to the future of business automation.

— The Nia OS Team
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email error:', err);
      }
    });

    res.json({ success: true, message: 'System deployed. Check your email.' });
  });
});

module.exports = router;
