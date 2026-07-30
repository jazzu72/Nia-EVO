const {handleCommand}=require('./telegram-handler');

function handleButton(callback){

if(!callback || !callback.data) return;

handleCommand({
chat:{
id:callback.message.chat.id
},
text:callback.data
});

}

module.exports={handleButton};
