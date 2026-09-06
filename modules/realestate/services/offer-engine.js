function generateOffer(data){

const arv=Number(data.arv||0);
const repairs=Number(data.repairs||0);
const closing=Number(data.closingCosts||5000);

const maxOffer=(arv*0.7)-repairs-closing;

return {
 arv,
 repairs,
 closingCosts:closing,
 maxOffer:Math.floor(maxOffer),
 strategy:"70% ARV Rule",
 recommendation:maxOffer>0 ? "MAKE OFFER":"PASS"
};

}

module.exports=generateOffer;
