#!/bin/bash
set -e
echo "🏰 NIA CAPITAL OS FULL BUILD"

mkdir -p tasks grants-engine data

cat > tasks/task-engine.js <<'JS'
const fs=require("fs");
const FILE="./data/tasks.json";

function load(){
 if(!fs.existsSync(FILE)) fs.writeFileSync(FILE,"[]");
 return JSON.parse(fs.readFileSync(FILE));
}

function save(d){
 fs.writeFileSync(FILE,JSON.stringify(d,null,2));
}

function create(title,priority="NORMAL"){
 let tasks=load();
 let task={
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

module.exports={create,all};
JS

cat > grants-engine/grant-autopilot.js <<'JS'
const tasks=require("../tasks/task-engine");

function run(){
 let task=tasks.create(
  "Prepare highest priority grant application package",
  "HIGH"
 );

 return {
  system:"NIA GRANT AUTOPILOT",
  status:"ACTIVE",
  task
 };
}

module.exports={run};
JS

node -e "
const t=require('./tasks/task-engine');
console.log(t.create('Initialize Nia Funding Operations','HIGH'));
const g=require('./grants-engine/grant-autopilot');
console.log(g.run());
"

pm2 restart nia
pm2 save

echo "✅ NIA BUILD COMPLETE"
