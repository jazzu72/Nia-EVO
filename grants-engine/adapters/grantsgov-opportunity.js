const https=require("https");
const fs=require("fs");
const path=require("path");

const ENDPOINT="https://api.grants.gov/v1/api/fetchOpportunity";
const STORE=path.join(process.cwd(),"data","grants","live-opportunities.json");

function post(body){
 return new Promise((resolve,reject)=>{
  const data=JSON.stringify(body);
  const req=https.request(ENDPOINT,{
   method:"POST",
   headers:{
    "Content-Type":"application/json",
    "Content-Length":Buffer.byteLength(data)
   }
  },res=>{
   let out="";
   res.on("data",c=>out+=c);
   res.on("end",()=>{
    try{
     const json=JSON.parse(out);
     if(res.statusCode>=400 || json.errorcode){
      return reject(new Error(
       `Grants.gov HTTP ${res.statusCode}: ${json.msg||out}`
      ));
     }
     resolve(json.data||{});
    }catch(e){
     reject(new Error(
      `Invalid Grants.gov response: ${out.slice(0,500)}`
     ));
    }
   });
  });
  req.on("error",reject);
  req.write(data);
  req.end();
 });
}

function extract(data){
 const s=data.synopsis||{};
 return {
  detailFetchedAt:new Date().toISOString(),
  opportunityTitle:data.opportunityTitle||null,
  owningAgencyCode:data.owningAgencyCode||null,
  synopsis:{
   agencyCode:s.agencyCode||null,
   agencyName:s.agencyName||null,
   synopsisDesc:s.synopsisDesc||null,
   postingDate:s.postingDate||null,
   responseDate:s.responseDateDesc||null,
   costSharing:s.costSharing??null,
   awardCeiling:s.awardCeiling||null,
   awardFloor:s.awardFloor||null,
   applicantTypes:Array.isArray(s.applicantTypes)?s.applicantTypes:[],
   fundingInstruments:Array.isArray(s.fundingInstruments)?s.fundingInstruments:[],
   fundingCategories:Array.isArray(s.fundingCategories)
    ?s.fundingCategories
    :Array.isArray(s.fundingActivityCategories)
     ?s.fundingActivityCategories
     :[],
   contact:{
    name:s.agencyContactName||null,
    email:s.agencyContactEmail||null,
    phone:s.agencyContactPhone||null
   }
  },
  applicantTypes:Array.isArray(s.applicantTypes)
   ?data.applicantTypes
   :Array.isArray(s.applicantTypes)
    ?s.applicantTypes
    :Array.isArray(s.applicantType)
     ?s.applicantType
     :Array.isArray(s.applicantTypesList)
      ?s.applicantTypesList
      :Array.isArray(s.applicantTypeList)
       ?s.applicantTypeList
       :[],
  fundingInstruments:Array.isArray(data.fundingInstruments)
   ?data.fundingInstruments
   :Array.isArray(s.fundingInstruments)
    ?s.fundingInstruments
    :[],
  fundingCategories:Array.isArray(data.fundingCategories)
   ?data.fundingCategories
   :Array.isArray(s.fundingCategories)
    ?s.fundingCategories
    :Array.isArray(s.fundingActivityCategories)
     ?s.fundingActivityCategories
     :[],
  alns:Array.isArray(data.alns)?data.alns:[],
  packages:Array.isArray(data.opportunityPkgs)
   ?data.opportunityPkgs:[],
  relatedOpportunities:Array.isArray(data.relatedOpps)
   ?data.relatedOpps:[],
  detailSource:"GRANTS_GOV_FETCH_OPPORTUNITY"
 };
}

async function enrich(opportunityId){
 const data=await post({opportunityId:Number(opportunityId)});
 return extract(data);
}

async function enrichTop(limit=10){
 if(!fs.existsSync(STORE)) throw new Error("Live opportunity store not found");

 const items=JSON.parse(fs.readFileSync(STORE,"utf8"));
 const targets=items
  .filter(x=>x.opportunityId)
  .slice(0,limit);

 for(const item of targets){
  try{
   const detail=await enrich(item.opportunityId);
   Object.assign(item,detail);
   console.log(
    `ENRICHED ${item.opportunityId} | ${item.opportunityNumber} | ${item.title}`
   );
  }catch(e){
   item.detailError=e.message;
   console.error(
    `FAILED ${item.opportunityId}: ${e.message}`
   );
  }
 }

 fs.writeFileSync(STORE,JSON.stringify(items,null,2));

 return targets;
}

module.exports={enrich,enrichTop};
