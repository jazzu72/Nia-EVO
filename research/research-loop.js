const bridge =
require("./research-alert-bridge");


console.log(
"🏰 Nia Research Agent Online"
);


setInterval(()=>{

console.log(
"🔎 Scanning intelligence..."
);

bridge.scan();


},3600000);

