'use strict';

const PROVIDERS = {
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  grants_gov: 'GRANTS_GOV_EMAIL',
  render: 'RENDER_API_KEY',
  github: 'GITHUB_TOKEN',
  browserbase: 'BROWSERBASE_ADVANCED_STEALTH',
  resend: 'RESEND_API_KEY',
  sendgrid: 'SENDGRID_API_KEY',
  telegram: 'TELEGRAM_BOT_TOKEN',
  stripe: 'STRIPE_SECRET_KEY',
  zapier: 'NIA_ZAPIER_KEY',
  public_market: 'YAHOO_PASSWORD'
};

function configured() {
  return Object.entries(PROVIDERS)
    .filter(([, env]) => Boolean(process.env[env]))
    .map(([provider, env]) => ({
      provider,
      credential_env: env,
      configured: true,
      secret_exposed: false,
      execution_allowed: false,
      autonomous_execution: false,
      human_approval_required: true
    }));
}

function get(provider) {
  const env = PROVIDERS[provider];
  if (!env) throw new Error(`Unknown provider: ${provider}`);
  return {
    provider,
    credential_env: env,
    configured: Boolean(process.env[env]),
    credential: process.env[env] || null
  };
}

module.exports = { configured, get };
