const finance =
require("./financial-engine");


function briefing(){

const data =
finance.summary();


console.log(`
🏰 NIA CEO FINANCIAL BRIEFING

Revenue:
$${data.revenue}

Funding:
$${data.funding}

Expenses:
$${data.expenses}

Cash Position:
$${data.cashPosition}

Transactions:
${data.transactions}

`);

}


briefing();

