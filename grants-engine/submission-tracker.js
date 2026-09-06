const fs=require("fs");
const path=require("path");

const DB=path.join(__dirname,"submission-db.json");

function load(){
  if(!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB));
}

function save(data){
  fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

function create(pkg){
  let data=load();
  let existing=data.find(x=>x.grant===pkg.grant && x.amount===pkg.amount && x.status==="READY_FOR_SUBMISSION");
  if(existing) return existing;

  let sub={
    id:"SUB-"+Date.now(),
    grant:pkg.grant,
    amount:pkg.amount,
    status:"READY_FOR_SUBMISSION",
    timeline:[
      {
        event:"PACKAGE_CREATED",
        date:new Date().toISOString()
      }
    ]
  };

  data.push(sub);
  save(data);
  return sub;
}

function submit(id){
  let data=load();
  let x=data.find(s=>s.id===id);
  if(!x) return null;

  if(x.status==="VERIFIED_SUBMITTED") return x;

  if(x.status==="PORTAL_SUBMISSION_REQUIRED"){
    return x;
  }

  if(x.status!=="READY_FOR_SUBMISSION"){
    return {
      ...x,
      submissionBlocked:true,
      reason:"Submission package is not in READY_FOR_SUBMISSION state"
    };
  }

  const now=new Date().toISOString();

  x.status="PORTAL_SUBMISSION_REQUIRED";
  x.submissionMethod="PORTAL";
  x.submissionAuthority="HUMAN";
  x.submittedAt=null;
  x.confirmation=null;
  x.timeline.push({
    event:"PORTAL_SUBMISSION_REQUIRED",
    date:now
  });

  save(data);
  return x;
}

function dashboard(){
  return load();
}

module.exports={create,dashboard,submit};
