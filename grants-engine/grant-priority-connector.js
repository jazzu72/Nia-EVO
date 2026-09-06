const grantEngine = require("./grant-hunter");

function getFundingPriority(){

  const grants = grantEngine.topGrants
    ? grantEngine.topGrants()
    : [];

  if(!grants.length){
    return {
      priority:"NONE",
      message:"No active grants found"
    };
  }

  const top = grants[0];

  return {
    type:"GRANT",
    name:top.name,
    amount:top.amount,
    score:top.score,
    action:`Complete ${top.name} application`,
    priority:"CRITICAL"
  };
}

module.exports={
  getFundingPriority
};
