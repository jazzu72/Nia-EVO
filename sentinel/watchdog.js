const sentinel =
require("./sentinel-engine");

const recovery =
require("./recovery-engine");


async function monitor(){

const health =
await sentinel.checkServices();


const failures =
sentinel.detectFailures(health);


for(const item of failures){

console.log(
"RECOVERING:",
item.name
);


await recovery.recover(
item.name
);

}

}


setInterval(
monitor,
60000
);


console.log(
"Nia Sentinel Watchdog Running"
);

