'use strict';
const { createHttpReadonlyProvider } = require('./http-readonly');
module.exports = createHttpReadonlyProvider('public-market','https://query1.finance.yahoo.com');
