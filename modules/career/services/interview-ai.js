class InterviewCoach {
  constructor(engine) { this.engine = engine; }

  schedule(details) {
    const m = this.engine.memory;
    const interview = { ...details, id: Date.now().toString(), status: 'scheduled' };
    m.interviews.push(interview);
    this.engine.persist();
    return interview;
  }

  listInterviews() {
    return this.engine.memory.interviews;
  }
}

module.exports = InterviewCoach;
