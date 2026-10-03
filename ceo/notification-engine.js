const fs=require("fs");

const FILE="./ceo/notifications.json";

function load(){
 if(!fs.existsSync(FILE)) return [];
 return JSON.parse(fs.readFileSync(FILE));
}


/* CEO_TASK_DEDUP_GUARD */
function shouldSuppressCEOTask(notification){
  if(!notification || notification.type !== "CEO_TASK") return false;

  const message=String(notification.message || "").trim();

  try{
    const stateFile="./ceo/autonomous-state.json";

    if(!fs.existsSync(stateFile)) return false;

    const state=JSON.parse(fs.readFileSync(stateFile,"utf8"));
    const existing=state.notifications;

    if(!existing) return false;

    const list=Array.isArray(existing)
      ? existing
      : Array.isArray(existing.notifications)
        ? existing.notifications
        : [];

    return list.some(n =>
      n &&
      n.type === "CEO_TASK" &&
      String(n.message || "").trim() === message &&
      n.status === "NEW"
    );
  }catch{
    return false;
  }
}

function send(notification){
  if(shouldSuppressCEOTask(notification)){
    return {
      suppressed:true,
      reason:"DUPLICATE_CEO_TASK",
      notification
    };
  }



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
