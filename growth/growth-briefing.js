const growth =
require("./growth-engine");


const report =
growth.funnel();


console.log(`
🏰 NIA GROWTH REPORT

Total Leads:
${report.total}

New:
${report.new}

Contacted:
${report.contacted}

Converted:
${report.converted}

Conversion Rate:
${report.conversionRate}%

`);

