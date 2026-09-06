const grantWriter = require("../grant-writer/grant-writer-engine");
const taskEngine = require("../tasks/task-engine");

function executeGrantStrategy(){

  const vipc = grantWriter.generateVIPC();

  const task = taskEngine.create(
    `Complete ${vipc.grant} $${vipc.requestedAmount} grant submission`,
    "HIGH"
  );

  return {
    system:"NIA GRANT EXECUTION ENGINE",
    status:"ACTIVE",
    fundingTarget:{
      grant:vipc.grant,
      amount:vipc.requestedAmount,
      applicationStatus:vipc.status
    },
    task
  };
}

module.exports={
  executeGrantStrategy
};
