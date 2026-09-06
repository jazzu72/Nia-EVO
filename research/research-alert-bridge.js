const research =
require("./research-agent");

const alerts =
require("../alerts/ceo-alert-engine");


function scan(){

const intel =
research.highValueIntel();


intel.forEach(item=>{

alerts.createAlert({

priority:"HIGH",

title:
"Nia Research Alert: "+item.title,

message:
item.summary

});

});


}


module.exports={scan};

