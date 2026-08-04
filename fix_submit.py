p="grants-engine/submission-tracker.js"
s=open(p).read()

if "function submit(id)" not in s:
    s=s.replace(
"function dashboard(){",
"""function submit(id){
  let data=load();
  let x=data.find(s=>s.id===id);
  if(!x) return null;

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

function dashboard(){"""
    )

s=s.replace(
"module.exports={create,dashboard};",
"module.exports={create,dashboard,submit};"
)

open(p,"w").write(s)


p="grants-engine/grant-api.js"
s=open(p).read()

if 'router.post("/submit/:id"' not in s:
    s=s.replace(
'router.get("/submissions",(req,res)=>{res.json(tracker.dashboard());});',
'''router.get("/submissions",(req,res)=>{
  res.json(tracker.dashboard());
});

router.post("/submit/:id",(req,res)=>{
  res.json(tracker.submit(req.params.id));
});'''
    )

open(p,"w").write(s)
