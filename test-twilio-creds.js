require('dotenv').config();

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('\n🔍 Testing Twilio credentials...\n');

if (!accountSid) {
  console.log('❌ TWILIO_ACCOUNT_SID not set in .env');
  process.exit(1);
}
if (!authToken) {
  console.log('❌ TWILIO_AUTH_TOKEN not set in .env');
  process.exit(1);
}
if (!phoneNumber) {
  console.log('❌ TWILIO_PHONE_NUMBER not set in .env');
  process.exit(1);
}

console.log(`✅ Credentials found:`);
console.log(`   Account SID: ${accountSid.substring(0, 10)}...`);
console.log(`   Auth Token: ${authToken.substring(0, 10)}...`);
console.log(`   Phone: ${phoneNumber}`);
console.log('');

try {
  const client = twilio(accountSid, authToken);
  
  console.log('📡 Connecting to Twilio API...');
  
  client.api.accounts(accountSid)
    .fetch()
    .then(account => {
      console.log('\n✅ TWILIO CONNECTION SUCCESSFUL!\n');
      console.log(`   Account Status: ${account.status}`);
      console.log(`   Account Type: ${account.type}`);
      console.log(`   Date Created: ${account.dateCreated}`);
      console.log('\n✅ Your credentials are VALID\n');
      process.exit(0);
    })
    .catch(err => {
      console.log('\n❌ TWILIO CONNECTION FAILED\n');
      console.log(`   Error: ${err.message}\n`);
      
      if (err.message.includes('Unauthorized')) {
        console.log('   Issue: Credentials are INVALID or EXPIRED');
        console.log('   Solution: Get new SID/Token from https://www.twilio.com/console\n');
      }
      
      if (err.message.includes('Account not found')) {
        console.log('   Issue: Account SID doesn\'t exist');
        console.log('   Solution: Verify SID from https://www.twilio.com/console\n');
      }
      
      process.exit(1);
    });
} catch (err) {
  console.log(`\n❌ Error: ${err.message}\n`);
  process.exit(1);
}
