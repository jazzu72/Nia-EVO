'use strict';

const fs=require('fs');

async function enrichProspect(prospect){
  const key=process.env.GOOGLE_PLACES_API_KEY;
  if(!key) return {
    status:'PROVIDER_MISSING',
    prospectId:prospect.prospectId||prospect.id,
    company:prospect.company
  };

  const query=`${prospect.company}, ${prospect.industry}, Norfolk, Virginia`;

  const r=await fetch('https://places.googleapis.com/v1/places:searchText',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'X-Goog-Api-Key':key,
      'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri'
    },
    body:JSON.stringify({textQuery:query,pageSize:1})
  });

  if(!r.ok) throw new Error(`Google Places HTTP ${r.status}`);

  const data=await r.json();
  const place=data.places?.[0];

  return {
    status:place?'ENRICHED':'NO_MATCH',
    prospectId:prospect.prospectId||prospect.id,
    company:prospect.company,
    matchedName:place?.displayName?.text||null,
    address:place?.formattedAddress||null,
    phone:place?.nationalPhoneNumber||null,
    website:place?.websiteUri||null,
    maps:place?.googleMapsUri||null,
    source:'Google Places API',
    external_action:false,
    human_approval_required:true
  };
}

async function run(){
  const queue=JSON.parse(fs.readFileSync('data/aios/enrichment-queue.json','utf8'));
  const results=[];
  for(const prospect of queue) results.push(await enrichProspect(prospect));
  fs.writeFileSync('data/aios/enrichment-results.json',JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify({ok:true,count:results.length,results},null,2));
}

if(require.main===module) run().catch(e=>{console.error('❌',e.message);process.exit(1)});
module.exports={enrichProspect,run};
