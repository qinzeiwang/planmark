const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../02_手动标注/annotator.js'),'utf8');
const code=source.slice(source.indexOf('let exportingPNG=false;'),source.indexOf("$('pngBtn').onclick=guard(savePNG);"));
async function run(mode){let events=[],messages=[];const ctx={scene:{background:{name:'测试.png'}},message:x=>messages.push(x),window:{isSecureContext:true},pngBlob:async()=>{events.push('render');return 'blob';},fileData:async()=> 'data:image/png;base64,test',fetch:async(url)=>({ok:true,json:async()=>url.endsWith('config')?{token:'token'}:{path:'C:/export/test.png'}})};
if(mode!=='native')ctx.window.showSaveFilePicker=async opts=>{events.push('picker');assert.equal(opts.types[0].accept['image/png'][0],'.png');if(mode==='cancel')throw Object.assign(new Error(),{name:'AbortError'});return {name:'chosen.png',createWritable:async()=>({write:async b=>{assert.equal(b,'blob');events.push('write');},close:async()=>events.push('close')})};};
vm.createContext(ctx);vm.runInContext(code,ctx);await vm.runInContext('savePNG()',ctx);
if(mode==='cancel'){assert.deepEqual(events,['picker']);assert.match(messages[0],/取消/);}else if(mode==='native'){assert.match(messages[0],/C:\/export\/test.png/);}else{assert.deepEqual(events,['picker','render','write','close']);assert.match(messages[0],/chosen.png/);}
}
(async()=>{for(const mode of ['picker','cancel','native'])await run(mode);console.log('PASS: picker before render; selected filename; cancel; native fallback');})();
