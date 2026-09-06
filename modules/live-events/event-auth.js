const crypto=require("crypto");

module.exports=function(req,res,next){

const key=process.env.NIA_EVENT_KEY || "CHANGE_ME";
const incoming=req.headers["x-nia-event-key"];

if(incoming!==key){
 return res.status(401).json({
  status:"BLOCKED",
  system:"Nia Event Security"
 });
}

next();

};
