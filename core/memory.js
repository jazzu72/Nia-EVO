const fs = require("fs");
const path = require("path");
const MEM_DIR = path.join(__dirname, "../memory");
if (!fs.existsSync(MEM_DIR)) fs.mkdirSync(MEM_DIR);
module.exports = {
  write(k,d){fs.writeFileSync(path.join(MEM_DIR,k+".json"),JSON.stringify(d,null,2));},
  read(k){let f=path.join(MEM_DIR,k+".json");return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,"utf8")):null;},
  append(k,e){let f=path.join(MEM_DIR,k+".json");let a=[];if(fs.existsSync(f))a=JSON.parse(fs.readFileSync(f,"utf8"));a.push({timestamp:Date.now(),...e});fs.writeFileSync(f,JSON.stringify(a,null,2));}
};
