'use strict';

const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function complete({ task, system, model }) {
  const response = await client.responses.create({
    model: model || process.env.OPENAI_MODEL || 'gpt-5',
    instructions:
      system ||
      'You are an execution component of Nia AIOS. Return accurate, actionable results.',
    input: task
  });

  return response.output_text;
}

module.exports = { complete };
