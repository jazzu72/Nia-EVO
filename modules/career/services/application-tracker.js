class ApplicationTracker {
  constructor(engine) { this.engine = engine; }

  logApplication(app) {
    const m = this.engine.memory;
    const record = { ...app, id: Date.now().toString(), status: 'sent', sentAt: new Date().toISOString() };
    m.applications.push(record);
    this.engine.persist();
    return record;
  }

  listApplications() {
    return this.engine.memory.applications;
  }
}

module.exports = ApplicationTracker;
