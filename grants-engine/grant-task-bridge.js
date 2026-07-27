const hunter = require("./grant-hunter");
const tasks = require("../tasks/task-engine");

function evaluateGrant(grant){

  const scored = hunter.scoreGrant(grant);

  if(scored >= 70){

    return tasks.create(
      `Prepare grant application: ${grant.name}`,
      "HIGH"
    );

  }

  return {
    status:"REJECTED",
    reason:"Low fit score",
    score:scored
  };
}


function scanGrants(){

  const grants = hunter.topGrants();

  return grants.map(g => evaluateGrant(g));

}


module.exports = {
  evaluateGrant,
  scanGrants
};
