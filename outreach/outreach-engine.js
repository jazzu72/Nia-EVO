// NIA SALES OUTREACH ENGINE

function generate(lead){

    const company =
    lead.company || "Business";


    const service =
    lead.service || "AI Automation";


    return {

        company,

        service,


        email:

`Subject: Helping ${company} save time with AI automation

Hello,

I noticed ${company} may benefit from improving daily workflows.

Nia Capital OS helps businesses automate repetitive tasks, improve customer follow-up, and create better operational visibility.

I would like to show you a simple automation plan customized for your business.

Would you be available for a quick conversation?

Thank you.`,



        sms:

`Hi, this is Nia Capital OS. We help businesses like ${company} automate tasks and improve operations using AI. Would you like a quick demo?`,



        callScript:

`Hello, I am reaching out because we help companies reduce manual work through AI automation.

I wanted to learn how ${company} handles customer follow-up and daily operations.

Would a short 15-minute conversation be useful?`,



        proposal:

{

title:
`${service} Implementation Plan`,

estimatedValue:
lead.value || 2500,

nextStep:
"Schedule discovery call"

}


    };

}


module.exports={
generate
};
