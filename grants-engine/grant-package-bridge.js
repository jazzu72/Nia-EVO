const generator = require("./grant-document-generator");
const hunter = require("./grant-hunter");

function buildPackage(){

  const grants = hunter.topGrants();

  if(!grants.length){
    return {
      status:"NO_GRANTS",
      message:"No qualified grants found"
    };
  }

  const grant = grants[0];

  return {
    status:"PACKAGE_GENERATED",
    priorityGrant: grant,
    package: generator.generate({
      name: grant.name,
      amount: grant.amount
    })
  };
}

module.exports = {
  buildPackage
};
