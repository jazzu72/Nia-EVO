module.exports = {
  port: process.env.PORT || 3000,
  telegramToken: process.env.TELEGRAM_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  databasePath: './database',
  logPath: './logs',
  reportPath: './reports',
};
