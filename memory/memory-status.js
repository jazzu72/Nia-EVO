const memory =
require("./memory-engine");


function status(){

return {

memoryItems:
memory.allMemory().length,

system:
"Nia Knowledge Memory Online",

timestamp:
new Date()

};

}


module.exports={status};

