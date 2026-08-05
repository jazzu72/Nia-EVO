const discovery = require("./discovery-to-execution");

let cycle = 0;

function scanMarket(){

cycle++;

console.log("🌐 NIA MARKET SCAN CYCLE:", cycle);

const opportunities = [
{
address:"757 VIRGINIA TARGET PROPERTY",
arv:250000,
offer:150000,
source:"MARKET-SCAN",
type:"DISTRESSED_ASSET"
},
{
address:"NORFOLK FORECLOSURE OPPORTUNITY",
arv:180000,
offer:95000,
source:"FORECLOSURE-SCAN",
type:"FORECLOSURE"
}
];

console.log(
"📡 OPPORTUNITIES FOUND:",
opportunities.length
);

discovery(opportunities);

}

console.log("🌐 NIA MARKET SCANNER ONLINE");

scanMarket();

setInterval(scanMarket,300000);
