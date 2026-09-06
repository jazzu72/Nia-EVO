const { google } = require('googleapis');
require('dotenv').config();

// ─── Tools ──────────────────────────────────────────────────

// ─── Execute tool actions ──────────────────────────────────
async function execute(action, params) {
  if (tools[action]) {
    const method = Object.keys(params)[0];
    await tools[action][method](...Object.values(params));
  } else {
    console.log('⚠️ Unknown action:', action);
  }
}

// Export for use by the CEO
module.exports = { tools, execute };

// ─── SMS via TextBelt ──────────────────────────────────────
const textbelt = require('textbelt');


// ─── Puppeteer (web scraping) ──────────────────────────────
async function scrapeLeads() {
  const page = await browser.newPage();
  await page.goto('https://example.com/leads');
  const leads = await page.evaluate(() => document.querySelectorAll('.lead').length);
  await browser.close();
  return leads;
}

// ─── n8n (workflow trigger) ─────────────────────────────────
async function triggerWorkflow(webhookUrl, data) {
  const axios = require('axios');
  await axios.post(webhookUrl, data);
}

// ─── Cal.com (scheduling) ──────────────────────────────────
const { default: Cal } = require('calcom');
const cal = new Cal({ apiKey: process.env.CAL_API_KEY });
async function createBooking(email, date) {
  await cal.bookings.create({
    eventTypeId: 1,
    startTime: date,
    attendee: { email }
  });
}

// ─── Signature Pad (self‑hosted e‑sign) ──────────────────
const { createCanvas } = require('canvas');
const fs = require('fs');
async function signDocument(deal) {
  // generate PDF with signature pad
}

// ─── Sentry (error monitoring) ──────────────────────────────
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

// ─── Supabase (database) ──────────────────────────────────
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Add all to tools object
tools.scrape = { leads: scrapeLeads };
tools.workflow = { trigger: triggerWorkflow };
tools.schedule = { booking: createBooking };
tools.sign = { document: signDocument };
tools.monitor = { capture: Sentry.captureException };
tools.db = { supabase };

// ─── Business Tools ──────────────────────────────────────────

async function generateInvoice(data) {
  return invoice.create(data);
}

// ─── Communication Tools ─────────────────────────────────────
async function sendSlackMessage(channel, text) {
  await slack.chat.postMessage({ channel, text });
}

const { Client } = require('discord.js');
const discord = new Client();
async function sendDiscordMessage(channel, text) {
  const ch = discord.channels.cache.get(channel);
  if (ch) ch.send(text);
}

// ─── Landing Page Tools ──────────────────────────────────────
const Handlebars = require('handlebars');
async function renderLandingPage(template, data) {
  const compiled = Handlebars.compile(template);
  return compiled(data);
}

// ─── Video Tools ─────────────────────────────────────────────
async function generateVideoThumbnail(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({ count: 1, folder: './thumbnails', filename: 'thumbnail.png' })
      .on('end', resolve)
      .on('error', reject);
  });
}

// Add all to tools object
tools.invoice = { generate: generateInvoice };
tools.slack = { send: sendSlackMessage };
tools.discord = { send: sendDiscordMessage };
tools.landing = { render: renderLandingPage };
tools.video = { thumbnail: generateVideoThumbnail };

// ─── Email via Nodemailer ────────────────────────────────────
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
async function sendEmail(to, subject, body) {
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: body });
  console.log(`📧 Email sent to ${to}`);
}

// ─── Video Thumbnail via Sharp (alternative to ffmpeg) ──────
const sharp = require('sharp');
async function generateThumbnail(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(320, 240)
    .toFile(outputPath);
  console.log(`🖼️ Thumbnail generated at ${outputPath}`);
}

// ─── Replace the old tools with new ones ────────────────────
tools.email = { send: sendEmail };
tools.thumbnail = { generate: generateThumbnail };

// ─── Shotstack Video Generation ─────────────────────────────
const { Shotstack } = require('shotstack-sdk');

const shotstack = new Shotstack({
  apiKey: process.env.SHOTSTACK_API_KEY,
  basePath: 'https://api.shotstack.io/v1',  // use 'https://api.shotstack.io/v1' for production
});

async function renderInfomercial(script, images, duration) {
  // Build a simple timeline: title text + images + closing
  const timeline = {
    soundtrack: {
      src: process.env.DEFAULT_BACKGROUND_MUSIC || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    tracks: [
      {
        clips: [
          {
            asset: {
              type: 'title',
              text: script.title || 'House of Jazzu',
              style: 'modern'
            },
            start: 0,
            length: duration || 10
          },
          ...(images || []).map((img, i) => ({
            asset: { type: 'image', src: img },
            start: i * 2 + 2,
            length: 2
          })),
          {
            asset: {
              type: 'title',
              text: script.cta || 'Contact us today!',
              style: 'bold'
            },
            start: (images?.length || 0) * 2 + 2,
            length: 4
          }
        ]
      }
    ]
  };

  const render = await shotstack.render({
    timeline,
    output: { format: 'mp4', resolution: '1080p' }
  });

  console.log(`🎬 Video render started. Render ID: ${render.id}`);
  return render.id;
}

// Poll for completion (optional)
async function checkRenderStatus(renderId) {
  const render = await shotstack.render(renderId);
  if (render.status === 'done') {
    console.log(`✅ Video ready: ${render.url}`);
    return render.url;
  } else if (render.status === 'failed') {
    console.log(`❌ Video render failed: ${render.error}`);
    return null;
  } else {
    console.log(`⏳ Render status: ${render.status}`);
    return null;
  }
}

// Add to tools
tools.video = {
  render: renderInfomercial,
  status: checkRenderStatus
};

// ─── Secure replacements ────────────────────────────────────

async function sendSlackMessage(channel, text) {
  await slack.chat.postMessage({ channel, text });
}

async function generateInvoice(data) {
  const filename = `invoice-${Date.now()}.pdf`;
  doc.pipe(fs.createWriteStream(filename));
  doc.text(`Invoice for ${data.customer}`, 100, 100);
  doc.text(`Amount: $${data.amount}`, 100, 150);
  doc.end();
  return filename;
}

// Replace the old tools with the secure ones
tools.slack = { send: sendSlackMessage };
tools.invoice = { generate: generateInvoice };

// ─── Tools ──────────────────────────────────────────────────
const { PDFDocument } = require("pdf-lib");
const tools = {
  sms: { send: async (to, message) => { console.log(`📱 SMS to ${to}: ${message}`) } },
  email: { send: async (to, subj, body) => { console.log(`📧 Email to ${to}: ${subj}`) } },
  calendar: { schedule: async (email, date, desc) => { console.log(`📅 Inspection: ${date} for ${email}`) } },
  docusign: { send: async (email, doc) => { console.log(`📄 Contract to ${email}`) } },
  stripe: { transfer: async (amt, dest) => { console.log(`💰 Transfer $${amt} to ${dest}`) } },
  grants: { submit: async (grant) => { console.log(`📋 Submitting ${grant.title}`) } }
};

// ─── RSS Feed Reader ──────────────────────────────────────
const Parser = require('rss-parser');
const parser = new Parser();

const FEEDS = {
  grants: [
    'https://www.nsf.gov/rss/grants',
    'https://www.energy.gov/feeds/grants',
    'https://www.nih.gov/grants/feed'
  ],
  // Replace this with your actual real estate lead feed
  realEstate: [
    'https://www.realtor.com/feeds/...'  // Put a real URL here
  ]
};

async function fetchRSS(feedUrls, limit = 10) {
  const results = [];
  for (const url of feedUrls) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items.slice(0, limit)) {
        results.push({
          title: item.title,
          url: item.link || item.guid,
          source: url,
          published: item.pubDate || item.isoDate || new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(`❌ RSS error ${url}: ${e.message}`);
    }
  }
  return results;
}

// Add to tools
if (!tools.rss) tools.rss = {};
tools.rss.fetch = fetchRSS;

// ─── Scoring Engine ──────────────────────────────────────────
const { scoreOpportunity } = require('./crm/scoring');

// Add scoring to tools
if (!tools.scoring) tools.scoring = {};
tools.scoring.score = scoreOpportunity;

// Example: Score a new opportunity when it's added
// tools.scoring.score(newOpportunity);
