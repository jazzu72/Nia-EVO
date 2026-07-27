/**
 * NIA CAPITAL OS - System Configuration
 * Production Grade Configuration Manager
 */

const config = {
  // Application
  app: {
    name: 'House of Jazzu - Nia Capital OS',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },

  // Business
  business: {
    name: 'House of Jazzu LLC',
    email: process.env.BUSINESS_EMAIL || 'lesane1972@gmail.com',
    phone: process.env.BUSINESS_PHONE || '+1-757-339-9245',
    location: 'Norfolk, VA'
  },

  },

  // OpenRouter AI
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-2-70b-chat'
  },

  // Grants
  grants: {
    apiEmail: process.env.GRANTS_GOV_EMAIL || 'lesane1972@gmail.com',
    apiUsername: process.env.GRANTS_GOV_USERNAME || 'lesane1972@gmail.com',
    apiPassword: process.env.GRANTS_GOV_PASSWORD,
    pipelineValue: 1625000,
    programs: [
      { name: 'NSF SBIR Phase 1', amount: 150000, likelihood: 0.35 },
      { name: 'SBA Microloan', amount: 50000, likelihood: 0.65 },
      { name: 'HUD Community Development', amount: 250000, likelihood: 0.40 },
      { name: 'Maryland Business Development', amount: 100000, likelihood: 0.55 },
      { name: 'DOE Small Business Innovation', amount: 175000, likelihood: 0.25 },
      { name: 'USDA Rural Development', amount: 300000, likelihood: 0.30 },
      { name: 'EPA Small Business Program', amount: 100000, likelihood: 0.30 }
    ]
  },

  // Capital
  capital: {
    initialBalance: 203400,
    minReserve: 50000,
    dealSize: 'variable',
    profitTarget: 0.30 // 30% ROI
  },

  // Real Estate
  realEstate: {
    markets: ['Maryland', 'Virginia', 'Washington DC'],
    dealTypes: ['wholesale', 'fix-and-flip', 'rental'],
    maxRepairEstimate: 50000,
    arMultiplier: 1.20
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    file: 'logs/system.log'
  },

  // API
  api: {
    corsOrigin: '*',
    requestTimeout: 30000,
    maxRequestSize: '10mb'
  }
};

module.exports = config;
