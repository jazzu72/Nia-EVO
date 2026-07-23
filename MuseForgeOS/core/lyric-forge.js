// Lyric Forge — Emotion-Based Lyric Generation

class LyricForge {
  constructor() {
    this.emotionThemes = {
      longing: ['distant', 'silent', 'waiting', 'empty', 'horizon'],
      joy: ['light', 'dance', 'golden', 'rising', 'free'],
      sorrow: ['rain', 'shadow', 'falling', 'fading', 'broken'],
      hope: ['dawn', 'rise', 'fire', 'wings', 'tomorrow'],
      anger: ['storm', 'steel', 'burn', 'shatter', 'thunder']
    };
  }

  generateLyrics(emotion = 'longing', lines = 8) {
    const words = this.emotionThemes[emotion] || this.emotionThemes.longing;
    const rhymes = ['ay', 'ee', 'oh', 'ah', 'oo'];
    const subjects = ['I', 'you', 'we', 'the world', 'the night', 'the stars'];
    const verbs = ['feel', 'see', 'hear', 'touch', 'hold', 'know'];

    let lyrics = [];
    let lastRhyme = '';

    for (let i = 0; i < lines; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      const word = words[Math.floor(Math.random() * words.length)];
      const rhyme = rhymes[Math.floor(Math.random() * rhymes.length)];

      // Avoid repeating rhyme
      let newRhyme = rhyme;
      while (newRhyme === lastRhyme) {
        newRhyme = rhymes[Math.floor(Math.random() * rhymes.length)];
      }
      lastRhyme = newRhyme;

      const line = `${subject} ${verb} the ${word} ${newRhyme}`;
      lyrics.push(line);
    }

    return {
      emotion,
      lines: lyrics,
      structure: 'verse-chorus-verse'
    };
  }
}

module.exports = LyricForge;
