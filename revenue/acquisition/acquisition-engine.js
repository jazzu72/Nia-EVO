const path = require("path");
const fs = require("fs");

const PROSPECT_DB = "data/revenue/prospects.json";

function load(){
    if(!fs.existsSync(PROSPECT_DB)){
        fs.mkdirSync("data/revenue",{recursive:true});
        fs.writeFileSync(PROSPECT_DB,"[]");
    }

    return JSON.parse(fs.readFileSync(PROSPECT_DB,"utf8"));
}

function addProspect(data){
    const prospects=load();

    const sourceId=String(data.source_id || "").trim();
    const url=String(data.url || "").trim();

    const duplicate=prospects.find(p =>
        (sourceId && String(p.source_id || "")===sourceId) ||
        (url && String(p.url || "")===url)
    );

    if(duplicate) return duplicate;

    const title=String(
        data.name ||
        data.title ||
        data.company ||
        "Unknown Opportunity"
    ).trim();

    const prospect={
        id: sourceId
            ? "RSS-"+Buffer.from(sourceId).toString("base64url").slice(0,40)
            : "PROS-"+Date.now(),

        name:title,
        title:title,

        company:String(data.company || title).trim(),
        contact:String(data.contact || "").trim(),

        industry:String(
            data.industry ||
            data.category ||
            "Unknown"
        ).trim(),

        category:String(
            data.category ||
            data.type ||
            "business_opportunity"
        ).trim(),

        type:String(
            data.type ||
            "opportunity"
        ).trim(),

        source:String(
            data.source ||
            "manual"
        ).trim(),

        source_id:sourceId || null,

        description:String(
            data.description || ""
        ).trim(),

        url:url || null,

        estimatedValue:
            Number(data.value ?? data.estimatedValue) || 0,

        status:String(
            data.status || "new"
        ).trim(),

        score:Number.isFinite(Number(data.score))
            ? Number(data.score)
            : calculateScore(data),

        created:new Date().toISOString(),

        discovered_at:data.discovered_at || null
    };

    prospects.push(prospect);

    fs.mkdirSync(path.dirname(PROSPECT_DB),{recursive:true});
    fs.writeFileSync(
        PROSPECT_DB,
        JSON.stringify(prospects,null,2)
    );

    return prospect;
}

function calculateScore(data){
    let score=0;

    if(Number(data.value)>=5000) score+=40;
    else if(Number(data.value)>=1000) score+=20;

    if(data.industry || data.category) score+=20;
    if(data.contact) score+=20;

    return Math.min(100,score);
}

function topProspects(limit=10){
    return load()
        .sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0))
        .slice(0,Number(limit)||10);
}

module.exports={
    addProspect,
    topProspects
};
