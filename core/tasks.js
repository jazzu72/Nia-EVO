const tools = require("./tools");
const memory = require("./memory");
module.exports = {
  tasks: [],
  register(n,i,a){this.tasks.push({name:n,interval_ms:i,action:a,last:0});},
  async tick(){let now=Date.now();for(const t of this.tasks){if(now-t.last>=t.interval_ms){t.last=now;try{let r=await t.action();memory.append("tasks",{task:t.name,result:r});}catch(e){memory.append("tasks",{task:t.name,error:e.message});}}}}
};
