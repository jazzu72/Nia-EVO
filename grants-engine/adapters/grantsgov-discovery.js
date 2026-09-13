const https=require("https");
const fs=require("fs");
const path=require("path");

const ENDPOINT="https://api.grants.gov/v1/api/search2";
const OUT=path.join(process.cwd(),"data","grants","live-opportunities.json");

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

     resolve(json);
    }catch(e){
     reject(new Error(`Invalid Grants.gov response: ${out.slice(0,500)}`));
    }
   });
  });

  req.on("error",reject);
  req.write(data);
  req.end();
 });
}

function score(g){
 const text=`${g.title} ${g.agency}`.toLowerCase();
 let score=0;

 if(/ai|artificial intelligence/.test(text)) score+=30;
 if(/technology|technolog/.test(text)) score+=20;
 if(/innovation|innovative/.test(text)) score+=20;
 if(/small business|sbir|sttr/.test(text)) score+=25;
 if(g.oppStatus==="posted") score+=10;
 if(g.closeDate) score+=5;

 return Math.min(score,100);
}

function normalize(g){
 return {
  opportunityId:String(g.id||""),
  opportunityNumber:g.number||"",
  title:(g.title||"").replace(/&amp;/g,"&"),
  agencyCode:g.agencyCode||"",
  agency:g.agency||"",
  openDate:g.openDate||null,
  closeDate:g.closeDate||null,
  status:g.oppStatus||null,
  documentType:g.docType||null,
  cfdaList:Array.isArray(g.cfdaList)?g.cfdaList:[],
  source:"GRANTS_GOV",
  sourceUrl:g.id
   ? `https://www.grants.gov/search-results-detail/${g.id}`
   : null,
  niaScore:score(g),
  discoveredAt:new Date().toISOString()
 };
}

async function search(query="AI innovation small business",rows=25){
 const result=await post({
  keyword:query,
  rows,
  startRecordNum:0,
  oppStatuses:"forecasted|posted"
 });

 const hits=result?.data?.oppHits||[];

 const opportunities=hits
  .map(normalize)
  .filter(x=>x.opportunityId)
  .sort((a,b)=>b.niaScore-a.niaScore);

 fs.mkdirSync(path.dirname(OUT),{recursive:true});

 const existing=fs.existsSync(OUT)
  ? JSON.parse(fs.readFileSync(OUT,"utf8"))
  : [];

 const map=new Map(existing.map(x=>[x.opportunityId,x]));

 for(const item of opportunities){
  map.set(item.opportunityId,item);
 }

 const merged=[...map.values()]
  .sort((a,b)=>b.niaScore-a.niaScore);

 fs.writeFileSync(OUT,JSON.stringify(merged,null,2));

 return {
  hitCount:result?.data?.hitCount||0,
  returned:opportunities.length,
  persisted:merged.length,
  opportunities
 };
}

module.exports={search};
