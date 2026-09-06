'use strict';

const EXECUTION_MODE='CONTROLLED_EXECUTION';

const LEVELS={
  low:1,
  medium:2,
  high:3,
  critical:4
};

const GOVERNANCE=Object.freeze({
  execution_allowed:false,
  execution_authorized:false,
  execution_performed:false,
  autonomous_execution:false,
  human_approval_required:true
});

async function authorize(tool,context={}){
  const risk=LEVELS[tool.risk]||2;

  if(risk>=LEVELS.high && context.approved!==true){
    return {
      execute:false,
      reason:'Human approval required for high-risk action',
      governance:GOVERNANCE
    };
  }

  if(risk>=LEVELS.critical && context.approved!==true){
    return {
      execute:false,
      reason:'Human approval required for critical action',
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
