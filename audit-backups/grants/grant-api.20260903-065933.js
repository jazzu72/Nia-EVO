const express=require("express");
const router=express.Router();

const engine=require("./grant-acquisition-engine");
const docs=require("./grant-document-generator");
const tracker=require("./submission-tracker");
const pdf=require("./grant-pdf-export");

router.get("/scan",(req,res)=>{
 res.json({
  system:"NIA GRANT ACQUISITION ENGINE",
  grants:engine.scan()
 });
});

router.post("/prepare",(req,res)=>{
 res.json({
  status:"APPLICATIONS_CREATED",
  applications:engine.createApplications()
 });
});

router.post("/generate",(req,res)=>{res.json({status:"PACKAGES_CREATED",packages:engine.scan().map(g=>docs.generate(g))});});

router.post("/pdf",async(req,res)=>{const packages=docs.dashboard();const files=[];for(const p of packages){files.push(await pdf.exportPDF(p));}res.json({status:"PDF_CREATED",files});});

router.post("/submit",(req,res)=>{const packages=docs.dashboard();res.json({status:"SUBMISSION_QUEUE_CREATED",submissions:packages.map(p=>tracker.create(p))});});
router.get("/submissions",(req,res)=>{
  res.json(tracker.dashboard());
});

router.post("/submit/:id",(req,res)=>{
  if(!process.env.NIA_APPROVAL_TOKEN){
    return res.status(500).json({error:"NIA_APPROVAL_TOKEN not configured — refusing to submit"});
  }
  if(req.get("x-nia-approval-token")!==process.env.NIA_APPROVAL_TOKEN){
    return res.status(403).json({error:"Missing or invalid approval token"});
  }
  res.json(tracker.submit(req.params.id));
});





module.exports=router;
