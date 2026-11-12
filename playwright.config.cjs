const {defineConfig}=require('@playwright/test');module.exports=defineConfig({testDir:'./tests',timeout:30000,use:{browserName:'chromium',viewport:{width:400,height:844}},reporter:'list',workers:1});
