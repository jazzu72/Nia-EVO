const OWNER_ID=process.env.TELEGRAM_OWNER_ID || "";

function authorized(msg){

if(!OWNER_ID){
 return true;
}

return String(msg.chat.id)===String(OWNER_ID);

}

module.exports={authorized};
