const https=require('https');
const {handleCommand}=require('./telegram-handler');
const {handleButton}=require('./button-handler');

let offset=0;

function poll(){

const token=process.env.TELEGRAM_BOT_TOKEN;

if(!token){
console.log("Telegram token missing");
return;
}

https.get(
`https://api.telegram.org/bot${token}/getUpdates?timeout=30&offset=${offset}`,
res=>{
let data="";

res.on("data",d=>data+=d);

res.on("end",()=>{

try{

const updates=JSON.parse(data).result||[];

updates.forEach(update=>{

offset=update.update_id+1;

if(update.message){
handleCommand(update.message);
}

if(update.callback_query){
handleButton(update.callback_query);
}

});

}catch(e){
console.log("Telegram listener error:",e.message);
}

poll();

});

}).on("error",()=>{
setTimeout(poll,5000);
});

}

module.exports={poll};
