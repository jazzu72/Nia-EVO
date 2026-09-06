const { exec } = require("child_process");


function recover(service){

return new Promise(resolve=>{

exec(
`pm2 restart ${service}`,
(error,stdout)=>{


resolve({

service,

success:
!error,

output:
stdout || error?.message

});


});


});

}


module.exports={
recover
};

