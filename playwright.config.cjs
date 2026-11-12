const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'./tests',timeout:25000,expect:{timeout:2500},fullyParallel:false,retries:0,workers:2,reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]],use:{browserName:'chromium',viewport:{width:400,height:844},actionTimeout:2500,trace:'retain-on-failure',screenshot:'only-on-failure'}});
