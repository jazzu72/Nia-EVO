const fs=require('fs');

const FILE="./modules/audit/data/audit.log";

function log(action,data={}){

const entry={
time:new Date().toISOString(),
action,
data
};

fs.appendFileSync(
FILE,
JSON.stringify(entry)+"\n"
);

}

module.exports={log};
