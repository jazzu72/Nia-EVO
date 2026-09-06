module.exports = {
  async getSignals() {
    try {
      return await hermes.getSignals();
    } catch {
      return {};
    }
  }
};
