'use strict';

const providers = [
  ['openai','OPENAI_API_KEY','AI'],
  ['gemini','GEMINI_API_KEY','AI'],
  ['openrouter','OPENROUTER_API_KEY','AI'],
  ['grants-gov','GRANTS_GOV_EMAIL','GRANTS'],
  ['render','RENDER_API_KEY','INFRASTRUCTURE'],
  ['github','GITHUB_TOKEN','INFRASTRUCTURE'],
  ['browserbase','BROWSERBASE_ADVANCED_STEALTH','BROWSER'],
  ['resend','RESEND_API_KEY','COMMUNICATIONS'],
  ['sendgrid','SENDGRID_API_KEY','COMMUNICATIONS'],
  ['telegram','TELEGRAM_BOT_TOKEN','COMMUNICATIONS'],
  ['stripe','STRIPE_SECRET_KEY','PAYMENTS'],
  ['zapier','NIA_ZAPIER_KEY','AUTOMATION'],
  ['public-market','YAHOO_PASSWORD','MARKET']
];

const feeds = [];

function catalog() {
  return {
    timestamp: new Date().toISOString(),
    providers: providers.map(([name,key,category]) => ({
      name,
      category,
      configured: Boolean(process.env[key]),
      credential: key,
      execution_allowed: false,
      autonomous_execution: false,
      human_approval_required: true
    })),
    feeds,
    governance: {
      execution_allowed: false,
      execution_authorized: false,
      execution_performed: false,
      autonomous_execution: false,
      human_approval_required: true
    }
  };
}

function addFeed(name,url,type='rss') {
  if (!name || !url) throw new Error('Feed name and URL required');
  feeds.push({name,url,type,read_only:true});
  return feeds.at(-1);
}

module.exports = { catalog, addFeed };
