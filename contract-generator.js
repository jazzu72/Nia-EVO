const fs = require('fs');

function generateContract(buyer, price) {
  const content = `
PURCHASE AGREEMENT
Buyer: ${buyer}
Price: $${price}
Date: ${new Date().toISOString()}
  `;
  fs.writeFileSync(`./contracts/${buyer.replace(/\s/g, '_')}.txt`, content);
  return `./contracts/${buyer.replace(/\s/g, '_')}.txt`;
}
module.exports = { generateContract };
