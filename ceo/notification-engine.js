const fs=require("fs");

const FILE="./ceo/notifications.json";

function load(){
 if(!fs.existsSync(FILE)) return [];
 return JSON.parse(fs.readFileSync(FILE));
}

function send(notification){

 const list=load();

 const item={
  id:"NOTICE-"+Date.now(),
  type:notification.type || "SYSTEM",
  priority:notification.priority || "MEDIUM",
  message:notification.message,
  status:"NEW",
  created:new Date().toISOString()
 };

 list.push(item);

 fs.writeFileSync(FILE,JSON.stringify(list,null,2));

 return item;
}

function dashboard(){

 const list=load();

 return {
  system:"NIA NOTIFICATION ENGINE",
  status:"ACTIVE",
  unread:list.filter(x=>x.status==="NEW").length,
  notifications:list
 };

}

module.exports={
 send,
 dashboard
};
