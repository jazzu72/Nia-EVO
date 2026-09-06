const https = require("https");

const urls = [
  "https://www.nsf.gov/funding/",
  "https://www.grants.gov/",
  "https://www.sba.gov/"
];

function check(url) {
  return new Promise(resolve => {
    const req=https.get(url,{timeout:15000},res=>{
      res.resume();
      resolve({url,status:res.statusCode});
    });
    req.on("error",e=>resolve({url,error:e.message}));
    req.on("timeout",()=>{req.destroy();resolve({url,error:"TIMEOUT"});});
  });
}

(async()=>{
  for(const url of urls) console.log(await check(url));
})();
