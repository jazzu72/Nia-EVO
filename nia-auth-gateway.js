const http=require("http");
const crypto=require("crypto");

const PORT=3060;

const API_KEY =
process.env.NIA_KEY ||
crypto.randomBytes(32).toString("hex");

console.log("🔑 NIA API KEY:");
console.log(API_KEY);

http.createServer((req,res)=>{

const key=req.headers["x-nia-key"];

if(key!==API_KEY){

res.writeHead(401,{
"Content-Type":"application/json"
});

res.end(JSON.stringify({
status:"DENIED",
message:"AUTHENTICATION REQUIRED"
}));

return;

}

res.writeHead(200,{
"Content-Type":"application/json"
});

res.end(JSON.stringify({

system:"NIA AUTH GATEWAY",

status:"AUTHORIZED",

access:[
"COMMAND_CENTER",
"DEAL_ROOM",
"CAPITAL_PIPELINE",
"AUDIT_LEDGER"
],

timestamp:new Date().toISOString()

},null,2));

}).listen(PORT,()=>{

console.log(
"🔐 NIA AUTH GATEWAY ONLINE PORT",
PORT
);

});
