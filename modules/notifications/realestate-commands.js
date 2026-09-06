const {send}=require('./telegram-bot');
const score=require('../realestate/services/deal-score');
const offer=require('../realestate/services/offer-engine');

async function realEstateCommand(msg){

const chat=msg.chat.id;
const text=msg.text || "";

if(text.startsWith("/score")){
const result=score({
arv:200000,
purchasePrice:100000,
repairs:25000
});

return send(chat,
"🏠 Nia Deal Score\n\n"+
JSON.stringify(result,null,2)
);
}


if(text.startsWith("/offer")){
const result=offer({
arv:200000,
repairs:25000,
closingCosts:5000
});

return send(chat,
"💰 Nia Offer Engine\n\n"+
JSON.stringify(result,null,2)
);
}


if(text.startsWith("/analyze")){
return send(chat,
"📊 Send deal data format:\n\n/analyze ARV PURCHASE REPAIRS\n\nExample:\n/analyze 200000 100000 25000"
);
}


return false;

}

module.exports={realEstateCommand};
