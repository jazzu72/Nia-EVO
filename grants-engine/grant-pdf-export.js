const PDFDocument = require("pdfkit");
const fs = require("fs");

function exportPDF(pkg){
 const dir="./grants-engine/generated-pdf";
 if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});

 const file=`${dir}/${pkg.id}.pdf`;

 const doc=new PDFDocument();
 doc.pipe(fs.createWriteStream(file));

 doc.fontSize(20).text("House of Jazzu - Grant Application Package");
 doc.moveDown();

 doc.fontSize(14).text(`Grant: ${pkg.grant}`);
 doc.text(`Requested Amount: $${pkg.amount.toLocaleString()}`);
 doc.text(`Status: ${pkg.status}`);
 doc.moveDown();

 pkg.documents.forEach(d=>{
   doc.fontSize(14).text(d.name);
   doc.fontSize(11).text(
     typeof d.content==="object"
     ? JSON.stringify(d.content,null,2)
     : d.content
   );
   doc.moveDown();
 });

 doc.end();

 return new Promise(resolve=>doc.on("end",()=>resolve(file)));
}

module.exports={exportPDF};
