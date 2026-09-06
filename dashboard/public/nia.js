const NIA_API = "";

async function fetchJSON(endpoint){
    try{
        const response = await fetch(`${NIA_API}${endpoint}`);
        return await response.json();
    }catch(error){
        console.error("Nia API Error:", endpoint, error);
        return null;
    }
}

async function updateDashboard(){

    const [
        status,
        capital,
        deals,
        grants,
        health
    ] = await Promise.all([
        fetchJSON("/api/status"),
        fetchJSON("/api/capital"),
        fetchJSON("/api/deals"),
        fetchJSON("/api/grants"),
        fetchJSON("/api/runtime-supervisor/health")
    ]);

    if(status){
        document.getElementById("nia-status").innerText = status.status.toUpperCase();
        document.getElementById("uptime").innerText = status.uptime;
    }

    if(capital){
        document.getElementById("capital").innerText =
            "$" + capital.available.toLocaleString();
    }

    if(deals){
        document.getElementById("deals").innerText =
            deals.pipeline;
    }

    if(grants){
        document.getElementById("grants").innerText =
            "$" + grants.total.toLocaleString();
    }

    if(health){
        document.getElementById("memory").innerText =
            Math.round(
                health.memory.heapUsed /
                health.memory.heapTotal * 100
            ) + "%";
    }
}

async function sendCommand(){
    const input=document.getElementById("nia-command");
    const output=document.getElementById("nia-response");

    if(!input.value) return;

    output.innerText="Nia processing...";

    try{
        const response = await fetch("/api/nia-chat",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                command:input.value
            })
        });

        const data = await response.json();

        output.innerText =
            "Nia: " + data.message +
            "\n\nCommand: " + data.received;

    }catch(error){
        output.innerText="Nia communication error.";
        console.error(error);
    }

    input.value="";
}

updateDashboard();
setInterval(updateDashboard,30000);

async function updateMemory(){

    try{
        const response = await fetch("/api/nia-chat/memory");
        const memory = await response.json();

        const box=document.getElementById("nia-memory");

        if(!box) return;

        if(memory.length===0){
            box.innerText="No commands recorded.";
            return;
        }

        box.innerHTML = memory
        .slice(-5)
        .reverse()
        .map(item =>
            `<div>
            <b>${item.engine}</b><br>
            ${item.command}<br>
            <small>${item.timestamp}</small>
            </div><hr>`
        )
        .join("");

    }catch(error){
        console.error("Memory feed error",error);
    }
}

updateMemory();
setInterval(updateMemory,30000);


async function updateRevenue(){
 const data=await fetchJSON('/api/revenue/report/live');
 if(!data) return;
 const el=document.getElementById('revenue-live');
 if(el){
   el.innerHTML=`$${Number(data.projectedRevenue||0).toLocaleString()}`;
 }
}

updateRevenue();
setInterval(updateRevenue,30000);


async function sendNiaCommand(){
 const input=document.getElementById("nia-command");
 const output=document.getElementById("nia-response");

 if(!input) return;

 const res=await fetch("/api/command-center/chat",{
   method:"POST",
   headers:{
     "Content-Type":"application/json"
   },
   body:JSON.stringify({
     command:input.value
   })
 });

 const data=await res.json();

 if(output){
   output.innerHTML=data.niaResponse;
 }

 input.value="";
}

