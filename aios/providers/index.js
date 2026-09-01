'use strict';

const providers = {};

if (process.env.OPENAI_API_KEY) {
  providers.openai = require('./openai');
}

if (process.env.ANTHROPIC_API_KEY) {
  providers.anthropic = require('./anthropic');
}

if (process.env.XAI_API_KEY) {
  providers.xai = require('./xai');
}

module.exports = providers;
