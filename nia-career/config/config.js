module.exports = {
  port: process.env.CAREER_PORT || 4000,
  dbPath: './database/career.db',
  uploadDir: './uploads',
  logDir: './logs',
  ai: {
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7
  }
};
