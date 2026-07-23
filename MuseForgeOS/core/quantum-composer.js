// Quantum Composer — AI Melody Generator
// Uses music theory rules + Markov chains

class QuantumComposer {
  constructor() {
    this.scales = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      blues: [0, 3, 5, 6, 7, 10],
      jazz: [0, 2, 4, 5, 7, 9, 11, 13]
    };
    this.rhythms = ['4/4', '3/4', '6/8', '7/8'];
  }

  generateMelody(key = 'C', scale = 'major', bars = 8) {
    const scaleDegrees = this.scales[scale];
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const keyIndex = notes.indexOf(key);
    
    let melody = [];
    let lastNote = 0;

    for (let i = 0; i < bars * 4; i++) {
      // Choose step: 60% step, 30% leap, 10% repeat
      const move = Math.random();
      let step;
      if (move < 0.6) step = 1; // step
      else if (move < 0.9) step = Math.floor(Math.random() * 4) + 2; // leap
      else step = 0; // repeat

      // Keep within scale
      let next = (lastNote + step) % scaleDegrees.length;
      if (Math.random() > 0.7) next = (next + 2) % scaleDegrees.length; // harmonic variation

      const degree = scaleDegrees[next];
      const note = notes[(keyIndex + degree) % 7];
      const octave = Math.floor((keyIndex + degree) / 7) + 4;

      melody.push({
        note: note,
        octave: octave,
        duration: Math.random() > 0.5 ? 0.5 : 1,
        velocity: Math.floor(Math.random() * 40) + 60
      });

      lastNote = next;
    }

    return {
      key,
      scale,
      timeSignature: this.rhythms[Math.floor(Math.random() * this.rhythms.length)],
      bars,
      melody
    };
  }
}

module.exports = QuantumComposer;
