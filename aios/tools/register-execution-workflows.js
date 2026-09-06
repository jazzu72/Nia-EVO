'use strict';

const {register}=require('./tool-fabric');
const workflows=require('../core/execution-workflows');

register('acquisition_scan',async()=>{
  return workflows.acquisitionScan();
},{
  risk:'low',
  description:'Run Nia acquisition intelligence workflow using read-only tools'
});

register('daily_operating_cycle',async()=>{
  return workflows.dailyOperatingCycle();
},{
  risk:'low',
  description:'Run Nia daily internal operating cycle without external side effects'
});

module.exports={acquisition_scan:true,daily_operating_cycle:true};
