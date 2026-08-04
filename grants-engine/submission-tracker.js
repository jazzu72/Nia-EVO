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
  if(x.status==="SUBMITTED") return x;
  if(x.status==="SUBMITTED") return x;

  x.status="SUBMITTED";
  x.submittedAt=new Date().toISOString();
  x.confirmation="CONF-"+Date.now();
  x.timeline.push({
    event:"SUBMISSION_SENT",
    date:new Date().toISOString()
  });

  save(data);
  return x;
}

function dashboard(){
  return load();
}

module.exports={create,dashboard,submit};
