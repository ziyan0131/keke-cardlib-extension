'use strict';
// 克克卡库原库共享存储：将原卡库的 IndexedDB stores 镜像到酒馆服务器磁盘。
// 仅适用于可信的、已登录的同一 SillyTavern 实例；不要暴露无认证接口到公网。
const fs=require('node:fs/promises');
const path=require('node:path');
const DATA_FILE=path.join(process.cwd(),'data','default-user','keke-cardlib-shared-state.json');
const MAX_BYTES=80*1024*1024;
let queue=Promise.resolve();
async function readState(){try{const st=await fs.stat(DATA_FILE);if(st.size>MAX_BYTES)throw new Error('共享卡库文件超过80 MiB限制');const v=JSON.parse(await fs.readFile(DATA_FILE,'utf8'));return {initialized:true,snapshot:v.snapshot||{schema:1,stores:{}}}}catch(e){if(e.code==='ENOENT')return {initialized:false,snapshot:{schema:1,stores:{}}};throw e}}
async function saveState(snapshot){const payload=JSON.stringify({schema:1,updatedAt:Date.now(),snapshot});if(Buffer.byteLength(payload)>MAX_BYTES)throw new Error('共享卡库超过80 MiB限制');await fs.mkdir(path.dirname(DATA_FILE),{recursive:true});const tmp=DATA_FILE+'.tmp';await fs.writeFile(tmp,payload,{encoding:'utf8',mode:0o600});await fs.rename(tmp,DATA_FILE)}
async function init(router){router.get('/state',async(_req,res)=>{try{res.json(await readState())}catch(e){console.error('[keke-cardlib-shared]',e);res.status(500).json({error:'读取服务器卡库失败'})}});router.post('/state',async(req,res)=>{try{const snapshot=req.body&&req.body.snapshot;if(!snapshot||!snapshot.stores||typeof snapshot.stores!=='object')return res.status(400).json({error:'共享卡库数据格式不正确'});for(const n of ['cards','cardIndex','meta','chatlogs'])if(!Array.isArray(snapshot.stores[n]))return res.status(400).json({error:'缺少数据库表：'+n});queue=queue.then(()=>saveState(snapshot));await queue;res.json({ok:true,updatedAt:Date.now()})}catch(e){console.error('[keke-cardlib-shared] write failed',e);res.status(500).json({error:'保存失败：可能是请求体限制或磁盘空间不足'})}});console.log('[keke-cardlib-shared] original card-library shared storage ready')}
module.exports={init,info:{id:'keke-cardlib-shared',name:'Keke Card Library Shared Storage',description:'Server-side shared storage for the original Keke Card Library IndexedDB'}};
