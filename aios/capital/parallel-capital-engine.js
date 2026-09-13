const LANES=["customer_revenue","enterprise_sales","grants","government_contracts","corporate_sponsorships","strategic_partnerships","accelerators","economic_development","research_development","strategic_financing"];

function rowsOf(r){
  if(Array.isArray(r)) return r;
  return r?.opportunities||r?.prospects||r?.results||r?.grants||r?.leads||r?.data||[];
}

function normalize(item={},lane="unknown"){
  const grant=lane==="grants";
  const candidates=[item.estimatedValue,item.estimated_value,item.value,item.amount?.ceiling,item.amount?.floor,item.amount]; const amount=candidates.map(Number).find(n=>Number.isFinite(n)&&n>0)||0;
  const probability=grant?0.25:Math.max(0,Math.min(1,Number(item.probability??(item.score?item.score/100:0.5))));
  return {
    id:String(item.id||item.opportunityId||item.prospectKey||item.url||`${lane}:${item.title||item.name||item.company||Date.now()}`),
    lane,
    title:item.title||item.name||item.company||"Capital Opportunity",
    organization:item.agency||item.organization||item.company||item.source||"Unknown",
    source:item.source||item.agencyCode||"Nia",
    url:item.url||item.link||null,
    amount,
    probability,
    expected_value:Math.round(amount*probability),
    deadline:item.closeDate||item.deadline||null,
    status:item.status||"DISCOVERED",
    eligibility:item.eligibility||item.applicantTypes||null,
    human_approval_required:true,
    external_execution:false,
    autonomous_execution:false,
    discovered_at:new Date().toISOString(),
    metadata:item
  };
}

class ParallelCapitalEngine{
  constructor(){this.lanes=LANES;this.opportunities=[];}
  async discover(sources={}){
    const found=[];
    for(const lane of LANES){
      const source=sources[lane];
      if(typeof source!=="function") continue;
      try{
        const result=await source();
        for(const item of rowsOf(result)) found.push(normalize(item,lane));
      }catch(e){console.error(`[CAPITAL:${lane}]`,e.message);}
    }
    const unique=new Map();
    for(const item of [...this.opportunities,...found]) unique.set(item.id,item);
    this.opportunities=[...unique.values()];
    return {ok:true,timestamp:new Date().toISOString(),lanes:LANES,opportunities:this.opportunities,summary:this.summary()};
  }
  summary(){
    const byLane={},byStatus={};
    for(const x of this.opportunities){
      byLane[x.lane]=(byLane[x.lane]||0)+1;
      byStatus[x.status]=(byStatus[x.status]||0)+1;
    }
    return {
      total_opportunities:this.opportunities.length,
      total_amount:this.opportunities.reduce((n,x)=>n+x.amount,0),
      expected_value:this.opportunities.reduce((n,x)=>n+x.expected_value,0),
      by_lane:byLane,
      by_status:byStatus
    };
  }
}

module.exports=new ParallelCapitalEngine();
module.exports.LANES=LANES;
module.exports.getLiveCapitalSources=async()=>{
  const sources={};
  try{
    const grants=require("../../grants-engine/grant-acquisition-engine");
    if(typeof grants.scan==="function") sources.grants=()=>grants.scan();
  }catch(e){console.error("[CAPITAL:grants]",e.message);}
  try{
    const leads=require("../../acquisition/lead-acquisition-engine");
    if(typeof leads.acquire==="function") sources.customer_revenue=()=>leads.acquire();
  }catch(e){console.error("[CAPITAL:customer_revenue]",e.message);}
  try{
    const acq=require("../../acquisition/acquisition-engine");
    if(typeof acq.getTargets==="function") sources.enterprise_sales=()=>acq.getTargets();
  }catch(e){console.error("[CAPITAL:enterprise_sales]",e.message);}
  return sources;
};
