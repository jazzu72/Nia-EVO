const fs=require("fs");

const FILE="./grants-engine/funding-requirements.json";

function load(){
 if(!fs.existsSync(FILE)){
   return {
    founder:{
      status:"PENDING",
      data:null
    },
    financial:{
      status:"PENDING",
      data:null
    }
   };
 }

 return JSON.parse(fs.readFileSync(FILE));
}


function completeFounder(data){

 const state=load();

 state.founder={
   status:"COMPLETE",
   data:{
     name:data.name,
     company:"House of Jazzu",
     role:"Founder & CEO",
     platform:"Nia Capital OS",
     location:"Virginia"
   }
 };

 fs.writeFileSync(FILE,JSON.stringify(state,null,2));

 return state;
}


function completeFinancial(data){

 const state=load();

 state.financial={
   status:"COMPLETE",
   data:{
     revenue:data.revenue,
     expenses:data.expenses,
     fundingRequest:data.fundingRequest,
     useOfFunds:data.useOfFunds
   }
 };

 fs.writeFileSync(FILE,JSON.stringify(state,null,2));

 return state;
}


function readiness(){

 const state=load();

 let completed=0;

 if(state.founder.status==="COMPLETE") completed++;
 if(state.financial.status==="COMPLETE") completed++;

 return {
   system:"NIA REQUIREMENT COMPLETION ENGINE",
   completion:`${completed}/2`,
   readiness:
     completed===2 ? "100%" :
     completed===1 ? "85%" :
     "71%",
   missing:[
     state.founder.status==="PENDING"?"Founder Information":null,
     state.financial.status==="PENDING"?"Financial Documents":null
   ].filter(Boolean),
   state
 };
}


module.exports={
 completeFounder,
 completeFinancial,
 readiness
};
