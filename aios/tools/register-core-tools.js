const { registerProviderTools } = require('./register-provider-tools');
const { createProviderBoundary } = require('../providers/provider-boundary');
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
// Provider tools remain read-only and execution-disabled.
module.exports = fabric;
require("./register-market-tools");
require("./register-intelligence-tool");

// Controlled execution coordinator — external side effects remain governed
require('../core/execution-coordinator');

require('./register-execution-workflows');
