const fs = require("fs");
const path = require("path");


const DB = path.join(
__dirname,
"../data/evolution/performance.json"
);



function load(){

if(!fs.existsSync(DB)){
fs.writeFileSync(
DB,
JSON.stringify([],null,2)
);
}

return JSON.parse(
fs.readFileSync(DB)
);

}



function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}



function recordEvent(event){

const data = load();


const entry = {

id:
"EV-"+Date.now(),

system:
event.system || "unknown",

type:
event.type || "metric",

result:
event.result || "",

score:
Number(event.score || 0),

lesson:
event.lesson || "",

created:
new Date().toISOString()

};


data.push(entry);

save(data);


return entry;

}



function analyze(){

const data=load();


const systems={};


data.forEach(e=>{

if(!systems[e.system])
systems[e.system]={
events:0,
average:0,
total:0
};


systems[e.system].events++;
systems[e.system].total += e.score;

systems[e.system].average =
systems[e.system].total /
systems[e.system].events;

});


return systems;

}



function recommendations(){

const report=analyze();

const actions=[];


Object.keys(report).forEach(system=>{

const item=report[system];


if(item.average < 50){

actions.push({

system,

recommendation:
"Needs optimization",

priority:
"HIGH"

});

}


else if(item.average >=80){

actions.push({

system,

recommendation:
"Scale strategy",

priority:
"LOW"

});

}

});


return actions;

}



module.exports={

recordEvent,
analyze,
recommendations

};

