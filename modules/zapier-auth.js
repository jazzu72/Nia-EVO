const crypto=require("crypto");

const API_KEY=process.env.NIA_ZAPIER_KEY || "CHANGE_ME";

module.exports=function(req,res,next){

 const key=req.headers["x-nia-key"];

 if(!key || key!==API_KEY){
  return res.status(401).json({
   status:"UNAUTHORIZED",
   system:"Nia Zapier Security Layer"
  });
 }

 next();
};
