const fs = require("fs");

function generate(lead) {

    const proposal = `
NIA CAPITAL OS
----------------------------

Proposal For:
${lead.company}

Contact:
${lead.contact}

City:
${lead.city}

Service:
AI Automation for Real Estate

Investment:
$${lead.value}

Included:

• AI Lead Management
• Automated Follow-up
• CRM Integration
• Revenue Dashboard
• Executive Reporting

Prepared by NIA Capital OS

`;

    fs.mkdirSync("data/proposals", { recursive: true });

    const filename =
        `data/proposals/${lead.company.replace(/\s+/g,"_")}.txt`;

    fs.writeFileSync(filename, proposal);

    return filename;
}

module.exports = { generate };
