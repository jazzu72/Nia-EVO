class SalaryEngine {
  constructor(engine) { this.engine = engine; }

  setExpected(amount, marketData = []) {
    const m = this.engine.memory;
    m.salaryIntel.expected = amount;
    if (marketData.length) m.salaryIntel.market = marketData;
    this.engine.persist();
    return m.salaryIntel;
  }
}

module.exports = SalaryEngine;
