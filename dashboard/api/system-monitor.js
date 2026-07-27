const os=require("os");


function metrics(){

return {

cpu:
os.loadavg(),

memory:
{
total:
os.totalmem(),

free:
os.freemem()

},

uptime:
os.uptime()

};

}


module.exports={
metrics
};

