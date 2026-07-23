class JobMatcher {
  constructor(engine) { this.engine = engine; }

  addJob(job) {
    const m = this.engine.memory;
    m.jobs.push({ ...job, id: Date.now().toString(), matchedAt: new Date().toISOString() });
    this.engine.persist();
    return job;
  }

  listJobs() {
    return this.engine.memory.jobs;
  }
}

module.exports = JobMatcher;
