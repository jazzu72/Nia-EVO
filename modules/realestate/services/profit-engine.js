function calculateProfit(data){

const purchase=Number(data.purchasePrice||0);
const repairs=Number(data.repairs||0);
const closing=Number(data.closingCosts||0);
const sale=Number(data.salePrice||0);

const totalCost=purchase+repairs+closing;
const profit=sale-totalCost;

const roi=totalCost>0
? ((profit/totalCost)*100).toFixed(2)
: 0;

return {
purchasePrice:purchase,
repairs,
closingCosts:closing,
salePrice:sale,
totalCost,
profit,
roi:roi+"%",
status:profit>0?"PROFITABLE":"LOSS"
};

}

module.exports=calculateProfit;
