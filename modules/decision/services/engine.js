function decide(deal){

const profit=
(Number(deal.arv)||0) -
(Number(deal.purchasePrice)||0) -
(Number(deal.repairs)||0) -
(Number(deal.closingCosts)||0) -
(Number(deal.holdingCosts)||0);

let decision="PASS";

if(profit>=50000){
decision="BUY";
}
else if(profit>=25000){
decision="NEGOTIATE";
}

return {
decision,
estimatedProfit:profit,
reason:
decision==="BUY"?
"Strong margin":
decision==="NEGOTIATE"?
"Needs better terms":
"Insufficient margin"
};

}

module.exports={decide};
