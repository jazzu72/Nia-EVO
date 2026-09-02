'use strict';

const {register}=require('./tool-fabric');
const workflows=require('../core/execution-workflows');

register('acquisition_scan',async()=>{
  return workflows.acquisitionScan();
},{
  risk:'low',
  description:'Run Nia acquisition intelligence workflow using read-only tools'
});

module.exports={acquisition_scan:true};
