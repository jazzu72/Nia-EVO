const Datastore = require("@seald-io/nedb");

const db = new Datastore({
  filename: "./opportunities.db",
  autoload: true
});

function score(grant){
    let score = 0;

    const text = (
        (grant.title || "") + " " +
        (grant.notes || "") + " " +
        (grant.organization || "")
    ).toLowerCase();

    if(text.includes("ai")) score += 25;
    if(text.includes("software")) score += 20;
    if(text.includes("education")) score += 20;
    if(text.includes("quantum")) score += 25;
    if(text.includes("innovation")) score += 15;
    if(text.includes("startup")) score += 15;
    if(text.includes("virginia")) score += 10;

    const value = Number(grant.value || 0);

    if(value >= 1000000) score += 30;
    else if(value >= 500000) score += 20;
    else if(value >= 100000) score += 10;

    if(score > 100) score = 100;

    return score;
}

db.find({}, (err, docs)=>{

    if(err){
        console.error(err);
        process.exit(1);
    }

    let remaining = docs.length;

    if(remaining===0){
        console.log("No opportunities found.");
        process.exit(0);
    }

    docs.forEach(doc=>{

        const grantScore = score(doc);

        let priority="Low";

        if(grantScore>=85) priority="Critical";
        else if(grantScore>=70) priority="High";
        else if(grantScore>=50) priority="Medium";

        db.update(
            {_id:doc._id},
            {$set:{
                score:grantScore,
                priority:priority,
                lastScored:new Date().toISOString()
            }},
            {},
            ()=>{
                console.log(
                    `${grantScore}% | ${priority} | ${doc.title}`
                );

                remaining--;

                if(remaining===0){
                    console.log("");
                    console.log("🏰 Opportunity scoring complete.");
                    process.exit(0);
                }
            }
        );

    });

});
