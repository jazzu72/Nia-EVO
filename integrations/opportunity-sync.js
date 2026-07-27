const fs = require("fs");
const path = require("path");

const opportunitiesDB = path.join(
  __dirname,
  "../data/opportunities.json"
);

const pipelineDB = path.join(
  __dirname,
  "../data/pipeline.json"
);


function load(file){
  if(!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}


function save(file,data){
  fs.writeFileSync(
    file,
    JSON.stringify(data,null,2)
  );
}


function syncOpportunities(){

  const opportunities = load(opportunitiesDB);

  let pipeline = load(pipelineDB);

  if(!pipeline.leads){
    pipeline = {leads:[]};
  }


  let added = 0;


  opportunities.forEach(opp=>{

    const exists = pipeline.leads.find(
      l=>l.sourceId===opp.id
    );


    if(!exists){

      pipeline.leads.push({

        id:
        "NIA-"+Date.now(),

        sourceId:
        opp.id,

        title:
        opp.title || "Untitled Opportunity",

        type:
        opp.type,

        amount:
        opp.amount || 0,

        score:
        opp.score || 0,

        stage:
        "discovery",

        created:
        new Date().toISOString()

      });


      added++;

    }

  });


  save(
    pipelineDB,
    pipeline
  );


  return {
    synced:added,
    total:pipeline.leads.length
  };

}


module.exports={
syncOpportunities
};
