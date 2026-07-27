function analyzeDeal(data){

const purchase = Number(data.purchasePrice || 0);
const repairs = Number(data.repairs || 0);
const arv = Number(data.arv || 0);

const totalInvestment = purchase + repairs;
const profit = arv - totalInvestment;
const roi = totalInvestment > 0 
? ((profit / totalInvestment) * 100).toFixed(2)
: 0;

return {
 purchase,
 repairs,
 arv,
 totalInvestment,
 estimatedProfit: profit,
 roi: roi + "%",
 recommendation:
 profit > 30000 
 ? "GOOD DEAL - REVIEW"
 : "HIGH RISK - PASS"
};

}

module.exports = analyzeDeal;
