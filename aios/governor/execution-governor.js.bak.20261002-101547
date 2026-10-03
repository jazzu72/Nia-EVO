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

const READ_ONLY_AUTONOMOUS_TOOLS=Object.freeze(new Set(['acquisition_stats','top_prospects','revenue_dashboard','automation_queue','outreach_queue','system_status','list_modules','intelligence_snapshot',
'rss_revenue_discovery','rss_revenue_sync']));

const GOVERNANCE=Object.freeze({
  execution_allowed:EXECUTION_ALLOWED,
  execution_authorized:EXECUTION_AUTHORIZED,
  execution_performed:false,
  autonomous_execution:false,
  human_approval_required:true
});

async function authorize(tool,context={}){
  const risk=LEVELS[tool.risk]||2;
  const autonomousRequested =
    context.autonomous===true || context.autonomous_execution===true;
  const readOnlyAutonomy =
    autonomousRequested &&
    READ_ONLY_AUTONOMOUS_TOOLS.has(String(tool.name || tool));

  if(readOnlyAutonomy && risk===LEVELS.low){
    return {
      execute:true,
      mode:'BOUNDED_READ_ONLY_AUTONOMY',
      governance:{
        ...GOVERNANCE,
        autonomous_execution:true,
        external_side_effects_allowed:false,
        human_approval_required:true
      }
    };
  }

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
