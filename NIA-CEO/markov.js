class MarkovPredictor {
  constructor() {
    this.transitions = {};
  }

  train(data) {
    for (let i = 0; i < data.length - 1; i++) {
      const state = data[i];
      const next = data[i + 1];
      if (!this.transitions[state]) this.transitions[state] = {};
      this.transitions[state][next] = (this.transitions[state][next] || 0) + 1;
    }
  }

  predict(state) {
    if (!this.transitions[state]) return null;
    const options = this.transitions[state];
    const keys = Object.keys(options);
    const weights = keys.map(k => options[k]);
    const total = weights.reduce((a,b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < keys.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return keys[i];
    }
    return keys[0];
  }
}

module.exports = MarkovPredictor;
