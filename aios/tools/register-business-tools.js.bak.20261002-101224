'use strict';

const fabric = require('./tool-fabric');

fabric.register(
  'system_status',
  async () => ({
    uptime: process.uptime(),
    node: process.version,
    timestamp: new Date().toISOString()
  }),
  {
    risk: 'low',
    description: 'Return Nia runtime status'
  }
);

fabric.register(
  'list_modules',
  async () => ({
    modules: [
      'acquisition',
      'revenue',
      'outreach',
      'grants',
      'realestate',
      'automation'
    ]
  }),
  {
    risk: 'low',
    description: 'List registered Nia business modules'
  }
);

const rssRevenue = require('../rss/rss-revenue-bridge');
const acquisition = require('../../revenue/acquisition/acquisition-engine');
const automation = require('../../revenue/automation-engine');
const conversion = require('../../revenue/conversion/conversion-engine');
const outreach = require('../../revenue/outreach/outreach-engine');

fabric.register('acquisition_stats', async () => {
  const prospects = await acquisition.topProspects(1000);
  const list = Array.isArray(prospects)
    ? prospects
    : (Array.isArray(prospects?.prospects) ? prospects.prospects : []);

  const hot = list.filter(p => String(p.temperature || p.priority || p.status || '').toLowerCase() === 'hot').length;
  const warm = list.filter(p => String(p.temperature || p.priority || p.status || '').toLowerCase() === 'warm').length;
  const cold = list.filter(p => String(p.temperature || p.priority || p.status || '').toLowerCase() === 'cold').length;

  return {
    total: list.length,
    hot,
    warm,
    cold,
    queued: list.length,
    open: list.filter(p => !['closed','won','lost'].includes(String(p.status || '').toLowerCase())).length
  };
}, {
  risk: 'low',
  description: 'Get Nia acquisition pipeline statistics'
});

fabric.register('top_prospects', async (args = {}) =>
  acquisition.topProspects(Number(args.limit) || 10), {
  risk: 'low',
  description: 'Retrieve highest-priority prospects'
});

fabric.register('add_prospect', async (args = {}) =>
  acquisition.addProspect(args), {
  risk: 'medium',
  description: 'Add a prospect to the acquisition pipeline'
});

fabric.register('revenue_dashboard', async () =>
  conversion.dashboard(), {
  risk: 'low',
  description: 'Read the revenue conversion dashboard'
});

fabric.register('update_deal', async (args = {}) =>
  conversion.updateDeal(args), {
  risk: 'medium',
  description: 'Update an existing revenue deal'
});

fabric.register('automation_queue', async () =>
  automation.queue(), {
  risk: 'low',
  description: 'Read queued revenue automation actions'
});

fabric.register('create_automation', async (args = {}) =>
  automation.createAction(args), {
  risk: 'high',
  description: 'Create an automated business action'
});

fabric.register('outreach_queue', async () =>
  outreach.queue(), {
  risk: 'low',
  description: 'Read queued outreach messages'
});

fabric.register('create_outreach', async (args = {}) =>
  outreach.createMessage(args), {
  risk: 'high',
  description: 'Create an outbound outreach message'
});

fabric.register('rss_revenue_discovery', async (args = {}) =>
  rssRevenue.discover(Number(args.limit) || 100), {
  risk: 'low',
  description: 'Discover and score revenue opportunities from approved RSS intelligence sources'
});

fabric.register('rss_revenue_sync', async (args = {}) =>
  rssRevenue.sync(Number(args.limit) || 100), {
  risk: 'low',
  description: 'Synchronize approved RSS intelligence into the acquisition pipeline'
});

console.log('✅ NIA BUSINESS + CORE TOOLS REGISTERED');

module.exports = fabric;
