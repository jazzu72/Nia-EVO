'use strict';

const https = require('https');

function requestJSON(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          if (res.statusCode >= 400) {
            return reject(
              new Error(
                parsed.error?.message ||
                parsed.error ||
                `AI provider HTTP ${res.statusCode}`
              )
            );
          }

          resolve(parsed);
        } catch {
          reject(new Error(`Invalid AI provider response: ${data.slice(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function chat({
  provider = process.env.NIA_AI_PROVIDER || 'openai',
  model = process.env.NIA_AI_MODEL,
  system,
  user
}) {
  if (!model) {
    throw new Error('NIA_AI_MODEL is not configured');
  }

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const result = await requestJSON(
      'generativelanguage.googleapis.com',
      `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      { 'X-goog-api-key': apiKey },
      {
        systemInstruction: { parts: [{ text: system || 'You are Nia, the private executive AI for House of Jazzu.' }] },
        contents: [{ role: 'user', parts: [{ text: user || '' }] }]
      }
    );

    const text = (result.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || '')
      .join('');

    if (!text) throw new Error('Gemini returned no response text');

    return {
      provider: 'gemini',
      model: result.modelVersion || model,
      choices: [{ message: { role: 'assistant', content: text } }]
    };
  }

  if (provider === 'hermes') {
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const prompt = `${system}\n\n${user}`;

      const child = spawn('hermes', [
        '-m', model,
        '--provider', 'openrouter',
        '-z', prompt
      ], {
        cwd: process.env.NIA_HERMES_CWD || process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', chunk => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', chunk => {
        stderr += chunk.toString();
      });

      child.on('error', reject);

      child.on('close', code => {
        if (code !== 0) {
          return reject(new Error(
            `Hermes exited with code ${code}: ${(stderr || stdout).slice(-1000)}`
          ));
        }

        resolve({
          provider: 'hermes',
          model,
          choices: [{
            message: {
              role: 'assistant',
              content: stdout.trim()
            }
          }]
        });
      });
    });
  }

  throw new Error(`Unsupported NIA AI provider: ${provider}`);
}

module.exports = { chat };
