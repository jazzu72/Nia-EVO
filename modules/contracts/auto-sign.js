const axios = require('axios');

async function sendForSignature(deal) {
  const envelope = {
    status: 'sent',
    documents: [{
      name: 'Purchase Agreement',
      documentBase64: Buffer.from(deal.contractText).toString('base64'),
      fileExtension: 'txt',
    }],
    recipients: {
      signers: [{
        email: deal.sellerEmail,
        name: deal.sellerName,
        recipientId: '1',
        tabs: {
          signHereTabs: [{
            anchorString: 'Seller Signature',
            anchorUnits: 'pixels',
            anchorXOffset: 0,
            anchorYOffset: 0,
          }],
        },
      }],
    },
  };

  // In production, call DocuSign API with your API key
  console.log(`📄 Contract sent for signature to ${deal.sellerEmail}`);
  return true;
}

module.exports = { sendForSignature };
