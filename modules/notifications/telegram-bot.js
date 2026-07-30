const https=require('https');

function telegram(method,body){

const token=process.env.TELEGRAM_BOT_TOKEN;

if(!token){
 return Promise.resolve({error:"Missing TELEGRAM_BOT_TOKEN"});
}

const data=JSON.stringify(body);

return new Promise(resolve=>{

const req=https.request(
`https://api.telegram.org/bot${token}/${method}`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(data)
}
},
res=>{
let out="";
res.on("data",d=>out+=d);
res.on("end",()=>resolve(JSON.parse(out)));
});

req.on("error",e=>resolve({error:e.message}));
req.write(data);
req.end();

});

}

async function send(chat,message){
return telegram("sendMessage",{
chat_id:chat,
text:message
});
}

module.exports={telegram,send};
