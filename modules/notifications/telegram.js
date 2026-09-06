const https=require('https');

async function sendTelegram(message){

const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;

if(!token || !chat){
 return {success:false,error:"Telegram credentials missing"};
}

const url=`https://api.telegram.org/bot${token}/sendMessage`;

const data=JSON.stringify({
 chat_id:chat,
 text:message
});

return new Promise((resolve)=>{

const req=https.request(url,{
 method:"POST",
 headers:{
  "Content-Type":"application/json",
  "Content-Length":Buffer.byteLength(data)
 }
},res=>{

let body="";
res.on("data",d=>body+=d);
res.on("end",()=>resolve(JSON.parse(body)));

});

req.on("error",e=>resolve({success:false,error:e.message}));
req.write(data);
req.end();

});

}

module.exports={sendTelegram};
