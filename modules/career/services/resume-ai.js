class ResumeAI {
  constructor(engine) { this.engine = engine; }

  analyze(resumeText) {
    const m = this.engine.memory;
    let score = 50;
    if (/\d+%|\$\d+|\d+ years/.test(resumeText)) score += 15; // quantified impact
    if (resumeText.length > 800) score += 10;
    if (/summary|objective/i.test(resumeText)) score += 10;
    if (/skills/i.test(resumeText)) score += 10;
    score = Math.min(score, 99);

    m.resume.score = score;
    m.resume.lastAnalyzed = new Date().toISOString();
    m.resume.versions.push({ date: new Date().toISOString(), score });
    this.engine.persist();
    return { score };
  }
}

module.exports = ResumeAI;
