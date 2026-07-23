const { exec } = require('child_process');

function speak(text) {
  // Termux TTS command
  exec(`termux-tts-speak "${text}"`, (err) => {
    if (err) console.error('TTS error:', err);
  });
  console.log(`🗣️ Jarvis: ${text}`);
}

function listen(callback) {
  // Termux speech-to-text (requires termux-api)
  exec(`termux-speech-to-text`, (err, stdout) => {
    if (err) {
      console.error('STT error:', err);
      return;
    }
    const transcript = stdout.trim();
    if (transcript) callback(transcript);
  });
}

// ─── Example: Wake word + command ───────────────────────────
speak('Jarvis is online. How can I assist?');
listen(input => {
  if (input.toLowerCase().includes('status')) {
    exec('curl http://localhost:3000/api/business/dashboard', (err, out) => {
      speak(`Here is your dashboard: ${out}`);
    });
  }
});
