#!/bin/bash

set -e

echo "🏰 NIA CAPITAL OS MASTER BUILD"

cd ~/nia-capital-os

echo "📁 Creating missing directories..."

mkdir -p \
tasks \
grants-engine \
data \
data/grants \
data/tasks


echo "📝 Creating Task Engine..."

cat > tasks/task-engine.js <<'EOF'
const fs=require("fs");
const path=require("path");

const FILE=path.join(__dirname,"../data/tasks.json");

function load(){
 if(!fs.existsSync(FILE)) fs.writeFileSync(FILE,"[]");
 return JSON.parse(fs.readFileSync(FILE));
}

function save(data){
 fs.writeFileSync(FILE,JSON.stringify(data,null,2));
}

function create(title,priority="NORMAL"){

 const tasks=load();

 const task={
  id:"TASK-"+Date.now(),
  title,
  priority,
  status:"OPEN",
  created:new Date().toISOString()
 };

 tasks.push(task);
 save(tasks);

 return task;
}

function all(){
 return load();
}

module.exports={
 create,
 all
};
EOF


echo "💰 Creating Grant Autopilot..."

cat > grants-engine/grant-autopilot.js <<'EOF'
const hunter=require("./grant-hunter");
const tasks=require("../tasks/task-engine");

function run(){

 let grants=hunter.topGrants();

 let results=[];

 grants.forEach(g=>{

  let score=hunter.scoreGrant(g);

  if(score>=70){

   results.push(
    tasks.create(
     "Prepare grant package: "+g.name,
     "HIGH"
    )
   );

  }

 });


 return {
  system:"NIA GRANT AUTOPILOT",
  grantsReviewed:grants.length,
  tasksCreated:results.length,
  tasks:results
 };

}

module.exports={run};
EOF


echo "📊 Creating Funding Status Module..."

cat > grants-engine/funding-status.js <<'EOF'
const tasks=require("../tasks/task-engine");

function status(){

 const all=tasks.all();

 return {
  system:"NIA FUNDING ENGINE",
  openTasks:all.filter(t=>t.status==="OPEN").length,
  tasks:all
 };

}

module.exports={status};
EOF


echo "🔗 Testing modules..."

node - <<'EOF'
const t=require("./tasks/task-engine");
console.log(t.create("Initialize Nia Capital Funding Engine","HIGH"));

const g=require("./grants-engine/grant-autopilot");
console.log(g.run());
EOF


echo "♻️ Restarting Nia..."

pm2 restart nia
pm2 save


echo "🩺 Health Check..."

curl -s http://localhost:3000/api/revenue/dashboard

echo ""

echo "✅ NIA CAPITAL OS BUILD COMPLETE"
