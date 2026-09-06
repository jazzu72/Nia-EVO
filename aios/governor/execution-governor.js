'use strict';

const EXECUTION_MODE='CONTROLLED_EXECUTION';

const LEVELS={
  low:1,
  medium:2,
  high:3,
  critical:4
};

const EXECUTION_ALLOWED =
  String(process.env.EXECUTION_ALLOWED || 'false').toLowerCase() === 'true';

const EXECUTION_AUTHORIZED =
  String(process.env.EXECUTION_AUTHORIZED || 'false').toLowerCase() === 'true';

const GOVERNANCE=Object.freeze({
  execution_allowed:EXECUTION_ALLOWED,
  execution_authorized:EXECUTION_AUTHORIZED,
  execution_performed:false,
  autonomous_execution:false,
  human_approval_required:true
});

async function authorize(tool,context={}){
  const risk=LEVELS[tool.risk]||2;

  if(!EXECUTION_ALLOWED || !EXECUTION_AUTHORIZED){
    return {
      execute:false,
      reason:'Controlled execution is not authorized',
      governance:GOVERNANCE
    };
  }

  if(context.autonomous===true || context.autonomous_execution===true){
    return {
      execute:false,
      reason:'Autonomous execution is disabled',
      governance:GOVERNANCE
    };
  }

  if(risk>=LEVELS.medium && context.approved!==true){
    return {
      execute:false,
      reason:'Human approval required for state-changing or high-risk action',
      governance:GOVERNANCE
    };
  }

  return {
    execute:true,
    mode:EXECUTION_MODE,
    governance:GOVERNANCE
  };
}

module.exports={
  EXECUTION_MODE,
  GOVERNANCE,
  authorize
};
