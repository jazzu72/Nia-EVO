function scoreDeal(data){

const arv=Number(data.arv||0);
const purchase=Number(data.purchasePrice||0);
const repairs=Number(data.repairs||0);

const investment=purchase+repairs;
const profit=arv-investment;

let score=0;

if(profit>=50000) score+=50;
else if(profit>=30000) score+=35;
else if(profit>=15000) score+=20;

if(investment>0){
 const roi=(profit/investment)*100;
 if(roi>=50) score+=30;
 else if(roi>=30) score+=20;
 else if(roi>=15) score+=10;
}

if(repairs < arv*0.2) score+=20;

let recommendation="PASS";

if(score>=80) recommendation="BUY";
else if(score>=50) recommendation="REVIEW";

return {
arv,
purchasePrice:purchase,
repairs,
estimatedProfit:profit,
score,
recommendation
};

}

module.exports=scoreDeal;
