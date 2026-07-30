async function advanceDeal(id){
 try{
  const res=await fetch(`/api/deal-actions/advance/${id}`,{
   method:"POST"
  });

  const data=await res.json();

  alert(
   data.success
   ? `Nia advanced deal: ${data.deal.stage}`
   : data.message
  );

  location.reload();

 }catch(e){
  console.log("Deal action error:",e.message);
 }
}
