const fs=require("fs");

const TASKS="./data/tasks.json";

function load(){
 if(!fs.existsSync(TASKS)) return [];
 return JSON.parse(fs.readFileSync(TASKS));
}

function score(task){

 let score=0;

 if(task.priority==="HIGH") score+=50;
 if(task.priority==="NORMAL") score+=25;

 if(task.title.toLowerCase().includes("grant"))
  score+=40;

 if(task.title.toLowerCase().includes("revenue"))
  score+=35;

 if(task.title.toLowerCase().includes("follow"))
  score+=20;

 if(task.title.toLowerCase().includes("acquisition"))
  score+=30;

 return score;
}

function prioritize(){

 const tasks=load();

 return tasks
 .map(t=>({
   ...t,
   niaScore:score(t)
 }))
 .sort((a,b)=>b.niaScore-a.niaScore);

}

module.exports={
 prioritize
};
