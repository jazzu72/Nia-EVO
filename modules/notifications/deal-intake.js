const {send}=require('./telegram-bot');
const score=require('../realestate/services/deal-score');
const offer=require('../realestate/services/offer-engine');
const {addDeal}=require('../realestate/services/deal-store');

async function dealIntake(msg){

const text=msg.text||"";
const parts=text.split(" ");

if(parts[0]!=="/deal") return false;

const arv=Number(parts[1]||0);
const purchasePrice=Number(parts[2]||0);
const repairs=Number(parts[3]||0);

if(!arv||!purchasePrice){
 return send(
 msg.chat.id,
 "Format:\n/deal ARV PURCHASE REPAIRS\n\nExample:\n/deal 200000 100000 25000"
 );
}

const scoring=score({
arv,
purchasePrice,
repairs
});

const saved=addDeal({arv,purchasePrice,repairs});

const offerResult=offer({
arv,
repairs,
closingCosts:5000
});

return send(
msg.chat.id,
`🏠 NIA DEAL ANALYSIS

ARV: $${arv}
Purchase: $${purchasePrice}
Repairs: $${repairs}

SCORE:
${JSON.stringify(scoring,null,2)}

OFFER:
${JSON.stringify(offerResult,null,2)}

Saved Deal ID: ${saved.id}`
);

}

module.exports={dealIntake};
