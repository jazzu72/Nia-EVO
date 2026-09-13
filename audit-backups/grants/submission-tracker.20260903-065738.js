const fs=require("fs");
const path=require("path");

const DB=path.join(__dirname,"submission-db.json");

function load(){
  if(!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB));
}

function save(data){
  if(fs.existsSync(DB)){
    const backupDir=path.join(__dirname,"backups");
    if(!fs.existsSync(backupDir)) fs.mkdirSync(backupDir,{recursive:true});
    const stamp=new Date().toISOString().replace(/[:.]/g,"-");
    fs.copyFileSync(DB,path.join(backupDir,`submission-db.${stamp}.json`));
    const files=fs.readdirSync(backupDir).filter(f=>f.startsWith("submission-db.")).sort();
    const excess=files.length-20;
    if(excess>0) files.slice(0,excess).forEach(f=>fs.unlinkSync(path.join(backupDir,f)));
  }
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
