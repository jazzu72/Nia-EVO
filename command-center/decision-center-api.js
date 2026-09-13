const express=require("express");
const crypto=require("crypto");
const fs=require("fs");
const path=require("path");

const router=express.Router();
const FILE=path.join(process.cwd(),"data","executive-command-queue.json");

const EXECUTION_LEDGER=path.join(process.cwd(),"data","execution-ledger.json");

const APPEND_ONLY_EXECUTION_LEDGER=true;

function validateLedgerShape(ledger){
  return Array.isArray(ledger) &&
    ledger.every(x=>x && typeof x==="object" &&
      typeof x.id==="string" &&
      typeof x.hash==="string" &&
      typeof x.previousHash==="string");
}

function appendExecutionLedger(entry){
  let ledger=[];
  try{
    ledger=JSON.parse(fs.readFileSync(EXECUTION_LEDGER,"utf8"));
  }catch{}
  if(!Array.isArray(ledger)) ledger=[];
  if(APPEND_ONLY_EXECUTION_LEDGER && ledger.length && !validateLedgerShape(ledger)){
    throw new Error("Execution ledger integrity check failed; refusing append");
  }
  const previousHash=ledger.length ? ledger[ledger.length-1].hash : "GENESIS";
  const record={
    id:"exec-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),
    ...entry,
    previousHash
  };
  record.hash=crypto.createHash("sha256")
    .update(JSON.stringify(record))
    .digest("hex");
  ledger.push(record);
  fs.mkdirSync(path.dirname(EXECUTION_LEDGER),{recursive:true});
  fs.writeFileSync(EXECUTION_LEDGER,JSON.stringify(ledger,null,2));
}



function load(){
  try{
    const data=JSON.parse(fs.readFileSync(FILE,"utf8"));
    return Array.isArray(data)?data:[];
  }catch{
    return [];
  }
}

function save(data){
  fs.mkdirSync(path.dirname(FILE),{recursive:true});
  fs.writeFileSync(FILE,JSON.stringify(data,null,2));
}

router.get("/queue",(req,res)=>{
  const queue=load();
  const proposals=queue
    .filter(x=>x && x.status==="PENDING_APPROVAL")
    .slice(-25)
    .reverse();

  res.json({
    ok:true,
    count:proposals.length,
    proposals
  });
});

router.post("/:id/approve",(req,res)=>{
  const queue=load();
  const item=queue.find(x=>x && x.id===req.params.id);

  if(!item)
    return res.status(404).json({ok:false,error:"Proposal not found"});

  if(item.status!=="PENDING_APPROVAL")
    return res.status(409).json({
      ok:false,
      error:"Proposal is not pending approval"
    });

  item.status="APPROVED";
  item.approvedAt=new Date().toISOString();

  // Approval never grants direct execution authority.
  item.executionAllowed=false;
  item.externalSubmission=false;
  item.financialExecution=false;
  item.humanApprovalRequired=true;

  save(queue);

  res.json({
    ok:true,
    status:"APPROVED",
    executionAllowed:false,
    proposal:item
  });
});

router.post("/:id/reject",(req,res)=>{
  const queue=load();
  const item=queue.find(x=>x && x.id===req.params.id);

  if(!item)
    return res.status(404).json({ok:false,error:"Proposal not found"});

  if(item.status!=="PENDING_APPROVAL")
    return res.status(409).json({
      ok:false,
      error:"Proposal is not pending approval"
    });

  item.status="REJECTED";
  item.rejectedAt=new Date().toISOString();

  save(queue);

  res.json({
    ok:true,
    status:"REJECTED",
    proposal:item
  });
});


/* NIA CONTROLLED TOOL EXECUTION */

router.get("/ledger/summary",(req,res)=>{
  let ledger=[];
  try{ ledger=JSON.parse(fs.readFileSync(EXECUTION_LEDGER,"utf8")); }catch{}
  if(!Array.isArray(ledger)) ledger=[];
  const completed=ledger.filter(x=>x.event==="EXECUTION_COMPLETED").length;
  const failed=ledger.filter(x=>x.event==="EXECUTION_FAILED").length;
  const lowRisk=ledger.filter(x=>x.risk==="low").length;
  const latest=ledger.length ? ledger[ledger.length-1] : null;
  res.json({
    ok:true,
    total:ledger.length,
    completed,
    failed,
    lowRisk,
    latest,
    governance:{
      financialExecution:false,
      externalSubmission:false,
      autonomousExecution:false,
      humanApprovalRequired:true
    }
  });
});

router.get("/ledger/verify",(req,res)=>{
  let ledger=[];
  try{ ledger=JSON.parse(fs.readFileSync(EXECUTION_LEDGER,"utf8")); }catch{}
  if(!Array.isArray(ledger)) ledger=[];
  let previous="GENESIS";
  let valid=true;
  for(const record of ledger){
    if(record.previousHash!==previous){ valid=false; break; }
    const copy={...record};
    const storedHash=copy.hash;
    delete copy.hash;
    const calculated=crypto.createHash("sha256")
      .update(JSON.stringify(copy))
      .digest("hex");
    if(storedHash!==calculated){ valid=false; break; }
    previous=storedHash;
  }
  res.json({
    ok:true,
    valid,
    count:ledger.length,
    chainHead:previous,
    status:valid?"INTEGRITY_VERIFIED":"INTEGRITY_FAILURE"
  });
});

router.get("/ledger",(req,res)=>{
  let ledger=[];
  try{
    ledger=JSON.parse(fs.readFileSync(EXECUTION_LEDGER,"utf8"));
  }catch{}
  if(!Array.isArray(ledger)) ledger=[];
  res.json({
    ok:true,
    count:ledger.length,
    executions:ledger.slice(-100).reverse()
  });
});

router.post("/:id/execute", async (req,res)=>{
  const startedAt=new Date().toISOString();

  try{
    const queue=load();
    const item=queue.find(x=>x&&x.id===req.params.id);

    if(!item)
      return res.status(404).json({ok:false,error:"Proposal not found"});

    if(item.status!=="APPROVED")
      return res.status(409).json({
        ok:false,
        error:"Proposal must be APPROVED before execution",
        status:item.status
      });

    const requestedTool=String(
      req.body?.tool ||
      item.execution?.authorizedTool ||
      ""
    ).trim();

    if(!requestedTool)
      return res.status(400).json({
        ok:false,
        error:"A tool is required for controlled execution"
      });

    const decision=item.decision||{};
    const tools=Array.isArray(decision.available_tools)
      ? decision.available_tools
      : [];

    const metadata=tools.find(
      t=>t&&t.name===requestedTool
    );

    if(!metadata)
      return res.status(403).json({
        ok:false,
        error:"Tool is not authorized by this proposal",
        tool:requestedTool
      });

    if(metadata.risk!=="low")
      return res.status(403).json({
        ok:false,
        error:"Only low-risk tools may execute through this gate",
        tool:requestedTool,
        risk:metadata.risk
      });

    const blockedNames=[
      "submit","submission","payment","transfer","trade",
      "order","withdraw","payout","send_outreach",
      "send_email","send_telegram"
    ];

    const lower=requestedTool.toLowerCase();

    if(blockedNames.some(x=>lower.includes(x)))
      return res.status(403).json({
        ok:false,
        error:"Tool is blocked from controlled execution",
        tool:requestedTool
      });

    const fabric=require("../aios/tools/tool-fabric");

    if(typeof fabric.execute!=="function")
      return res.status(500).json({
        ok:false,
        error:"Canonical AIOS Tool Fabric execute() is unavailable"
      });

    const registered=typeof fabric.list==="function"
      ? fabric.list()
      : [];

    const registeredTool=Array.isArray(registered)
      ? registered.find(t=>
          t===requestedTool ||
          t?.name===requestedTool ||
          t?.id===requestedTool
        )
      : null;

    if(Array.isArray(registered) && registered.length && !registeredTool)
      return res.status(404).json({
        ok:false,
        error:"Tool is not registered in the active AIOS Tool Fabric",
        tool:requestedTool
      });

    item.status="EXECUTING";
    item.execution={
      ...(item.execution||{}),
      status:"EXECUTING",
      executionMode:"GOVERNED",
      tool:requestedTool,
      startedAt,
      financialExecution:false,
      externalSubmission:false
    };

    item.audit=item.audit||[];
    item.audit.push({
      event:"EXECUTION_STARTED",
      at:startedAt,
      tool:requestedTool,
      risk:"low",
      mode:"GOVERNED",
      financialExecution:false,
      externalSubmission:false
    });

    save(queue);

    const input=
      req.body&&typeof req.body.input==="object"
        ? req.body.input
        : {};

    const result=await Promise.resolve(
      fabric.execute(requestedTool,input)
    );

    const finishedAt=new Date().toISOString();

    item.status="EXECUTED";
    item.execution={
      ...(item.execution||{}),
      status:"EXECUTED",
      finishedAt,
      resultRecorded:true
    };

    item.audit.push({
      event:"EXECUTION_COMPLETED",
      at:finishedAt,
      tool:requestedTool,
      risk:"low",
      mode:"GOVERNED",
      financialExecution:false,
      externalSubmission:false,
      result:result===undefined?null:result
    });

    appendExecutionLedger({
      event:"EXECUTION_COMPLETED",
      proposalId:item.id,
      objective:item.objective,
      tool:requestedTool,
      risk:"low",
      executionMode:"GOVERNED",
      startedAt,
      finishedAt,
      financialExecution:false,
      externalSubmission:false,
      result:result===undefined?null:result
    });

    save(queue);

    return res.json({
      ok:true,
      status:"EXECUTED",
      proposalId:item.id,
      tool:requestedTool,
      executionMode:"GOVERNED",
      financialExecution:false,
      externalSubmission:false,
      result
    });

  }catch(e){
    try{
      const queue=load();
      const item=queue.find(x=>x&&x.id===req.params.id);

      if(item){
        item.status="EXECUTION_FAILED";
        item.execution={
          ...(item.execution||{}),
          status:"EXECUTION_FAILED",
          finishedAt:new Date().toISOString(),
          resultRecorded:false
        };

        item.audit=item.audit||[];
        item.audit.push({
          event:"EXECUTION_FAILED",
          at:new Date().toISOString(),
          tool:req.body?.tool||null,
          error:e.message,
          financialExecution:false,
          externalSubmission:false
        });

        save(queue);
      }
    }catch{}

    console.error("NIA CONTROLLED EXECUTION ERROR:",e);

    return res.status(500).json({
      ok:false,
      error:e.message,
      executionPerformed:false
    });
  }
});

module.exports=router;
