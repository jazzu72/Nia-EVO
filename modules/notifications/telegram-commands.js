const {send}=require('./telegram-bot');
const report=require('../realestate/services/report-engine');
const {realEstateCommand}=require('./realestate-commands');
const {dealIntake}=require('./deal-intake');

async function executeCommand(msg){

const chat=msg.chat.id;
const cmd=(msg.text||"").toLowerCase();

if(cmd.startsWith('/deal')){
 return dealIntake(msg);
}

if(cmd.startsWith('/score')||cmd.startsWith('/offer')||cmd.startsWith('/analyze')){
 return realEstateCommand(msg);
}

if(cmd==="/status"){
 return send(chat,
`🏰 Nia Status

System: ONLINE
Engine: Active
Time: ${new Date().toISOString()}`
 );
}

if(cmd==="/report"){
 return send(chat,
"📊 Daily Report\n\n"+
JSON.stringify(report(),null,2)
 );
}

if(cmd==="/pipeline"){
 return send(chat,
"🏠 Pipeline\n\n"+
JSON.stringify(report().pipeline,null,2)
 );
}

if(cmd==="/network"){
 return send(chat,
"🤝 Network\n\n"+
JSON.stringify(report().network,null,2)
 );
}

if(cmd==="/tasks"){
 return send(chat,
"📋 Nia Tasks\n\n"+
"- Review seller leads\n"+
"- Analyze properties\n"+
"- Follow up opportunities\n"+
"- Update pipeline"
 );
}

return send(chat,
"Commands:\n/status\n/report\n/pipeline\n/network\n/tasks"
);

}

module.exports={executeCommand};
