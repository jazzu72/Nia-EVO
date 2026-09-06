const express=require("express");
const router=express.Router();
const { requireOwnerAuth } = require("../owner-auth-middleware");

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

router.post("/prepare",requireOwnerAuth,(req,res)=>{
 res.json({
  status:"APPLICATIONS_CREATED",
  applications:engine.createApplications()
 });
});

router.post("/generate",requireOwnerAuth,(req,res)=>{res.json({status:"PACKAGES_CREATED",packages:engine.scan().map(g=>docs.generate(g))});});

router.post("/pdf",requireOwnerAuth,async(req,res)=>{const packages=docs.dashboard();const files=[];for(const p of packages){files.push(await pdf.exportPDF(p));}res.json({status:"PDF_CREATED",files});});

router.post("/submit",requireOwnerAuth,(req,res)=>{const packages=docs.dashboard();res.json({status:"SUBMISSION_QUEUE_CREATED",submissions:packages.map(p=>tracker.create(p))});});
router.get("/submissions",(req,res)=>{
  res.json(tracker.dashboard());
});

router.post("/submit/:id",requireOwnerAuth,(req,res)=>{
  const result=tracker.submit(req.params.id);

  if(!result){
    return res.status(404).json({
      ok:false,
      error:"SUBMISSION_NOT_FOUND",
      execution_performed:false,
      external_submission_performed:false,
      human_submission_required:true
    });
  }

  if(result.status==="PORTAL_SUBMISSION_REQUIRED"){
    return res.status(202).json({
      ok:true,
      status:"PORTAL_SUBMISSION_REQUIRED",
      submission:result,
      external_submission_performed:false,
      confirmation:null,
      human_submission_required:true,
      message:"Package prepared for human portal submission. Nia did not submit externally."
    });
  }

  if(result.submissionBlocked){
    return res.status(409).json({
      ok:false,
      status:"SUBMISSION_BLOCKED",
      submission:result,
      external_submission_performed:false,
      human_submission_required:true,
      reason:result.reason
    });
  }

  return res.json({
    ok:true,
    status:result.status,
    submission:result,
    external_submission_performed:false,
    human_submission_required:true
  });
});

/*
 * POST /confirm-portal-submission/:id
 *
 * Records evidence supplied by the authenticated owner after
 * the grant was actually submitted through an external portal.
 *
 * This endpoint does NOT submit anything externally.
 */
router.post("/confirm-portal-submission/:id",requireOwnerAuth,(req,res)=>{
  try{
    const id=String(req.params.id||"").trim();
    const confirmation=String(req.body?.confirmation||"").trim();
    const portal=String(req.body?.portal||"").trim();
    const submittedAt=String(req.body?.submittedAt||"").trim();
    const reviewer=String(req.body?.reviewer||"").trim();

    if(!confirmation || !portal || !reviewer){
      return res.status(400).json({
        ok:false,
        error:"CONFIRMATION_PORTAL_REVIEWER_REQUIRED",
        message:"confirmation, portal, and reviewer are required.",
        external_submission_performed:false,
        human_submission_required:true
      });
    }

    const data=tracker.dashboard();
    const record=data.find(x=>x.id===id);

    if(!record){
      return res.status(404).json({
        ok:false,
        error:"SUBMISSION_NOT_FOUND",
        external_submission_performed:false,
        human_submission_required:true
      });
    }

    if(record.status==="VERIFIED_SUBMITTED"){
      return res.json({
        ok:true,
        status:"VERIFIED_SUBMITTED",
        submission:record,
        external_submission_performed:false,
        verified_by:record.verifiedBy||reviewer,
        message:"Submission was already verified. No external action occurred."
      });
    }

    if(record.status!=="PORTAL_SUBMISSION_REQUIRED"){
      return res.status(409).json({
        ok:false,
        error:"PORTAL_SUBMISSION_REQUIRED_STATE_EXPECTED",
        current_status:record.status,
        external_submission_performed:false,
        human_submission_required:true
      });
    }

    const when=submittedAt || new Date().toISOString();

    record.status="VERIFIED_SUBMITTED";
    record.submissionMethod="PORTAL";
    record.submissionAuthority="HUMAN";
    record.portal=portal;
    record.confirmation=confirmation;
    record.submittedAt=when;
    record.verifiedBy=reviewer;
    record.verifiedAt=new Date().toISOString();

    record.timeline=Array.isArray(record.timeline) ? record.timeline : [];
    record.timeline.push({
      event:"PORTAL_SUBMISSION_VERIFIED",
      date:record.verifiedAt,
      portal,
      confirmation,
      reviewer
    });

    const fs=require("fs");
    const path=require("path");
    const DB=path.join(__dirname,"submission-db.json");
    fs.writeFileSync(DB,JSON.stringify(data,null,2));

    return res.json({
      ok:true,
      status:"VERIFIED_SUBMITTED",
      submission:record,
      external_submission_performed:false,
      verification_recorded:true,
      verified_by:reviewer,
      message:"Human-reported portal submission recorded. Nia performed no external submission."
    });
  }catch(error){
    return res.status(500).json({
      ok:false,
      error:error.message||"Portal submission verification failed",
      external_submission_performed:false,
      human_submission_required:true
    });
  }
});





module.exports=router;
