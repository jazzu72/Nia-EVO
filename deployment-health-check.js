const http=require("http");

const checks=[
 {name:"Revenue API",url:"http://localhost:3100/api/revenue"}
];

let done=0;

checks.forEach(c=>{
http.get(c.url,res=>{
let body="";
res.on("data",d=>body+=d);
res.on("end",()=>{
console.log(`✅ ${c.name}: ${res.statusCode}`);
try{
let j=JSON.parse(body);
console.log(j);
}catch(e){}
done++;
if(done===checks.length) console.log("🚀 NIA production health check complete");
});
}).on("error",e=>{
console.log(`❌ ${c.name}: ${e.message}`);
done++;
});
});
