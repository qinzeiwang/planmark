/* Offline editor: SVG rendering, self-contained JSON, local checks and PNG export. */
'use strict';
const C=window.PlanMarkCore,ICONS=window.PLANMARK_ICONS,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
let scene=null,selected=null,pending=null,drag=null,dirty=false,saving=false,saveName='scene.json';
const uid=()=>crypto.randomUUID(),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const colors={energy:'#386E94',site:'#577D69',equipment:'#58758A',general:'#B0803E'};
function message(t,error=false){$('message').textContent=t;$('message').classList.toggle('error',error);}
function guard(fn){return async(...args)=>{try{await fn(...args);}catch(e){message(e.message,true);}};}
function changed(){scene.revision=uid();dirty=true;}
function el(tag,attrs={},parent=$('drawing')){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));parent.appendChild(n);return n;}
function text(x,y,value,size=16,fill='#294454',parent=$('drawing')){const n=el('text',{x,y,'font-size':size,fill,'font-family':'Microsoft YaHei, sans-serif'},parent);n.textContent=value;return n;}
function icon(kind,x,y,size,color,parent){
 const g=el('g',{},parent);el('circle',{cx:x,cy:y,r:size/2,fill:color,stroke:'#ffffff','stroke-width':1.6},g);
 const vector=new DOMParser().parseFromString(ICONS[kind].svg,'image/svg+xml').documentElement;
 vector.setAttribute('x',x-size*.33);vector.setAttribute('y',y-size*.33);vector.setAttribute('width',size*.66);vector.setAttribute('height',size*.66);vector.setAttribute('color','#ffffff');g.appendChild(document.importNode(vector,true));return g;
}
function annotation(a,s){const b=C.labelBox(a,s),g=el('g',{'data-ann':a.id});
 if(a.labelVisible){
  if(a.leader){let ex=clamp(b.cx,b.x,b.x+b.w),ey=clamp(b.cy,b.y,b.y+b.h);el('line',{x1:b.cx,y1:b.cy,x2:ex,y2:ey,stroke:a.color,'stroke-width':1.5},g);}
  el('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:5,fill:'#ffffff','fill-opacity':.97,stroke:'#d6dee3','stroke-width':1},g);
  b.lines.forEach((line,i)=>text(b.x+10,b.y+8+a.fontSize+i*(a.fontSize+4),line,a.fontSize,'#294454',g));
 }
 icon(a.kind,b.cx,b.cy,a.size,a.color,g);
 if(a.id===selected)el('circle',{'data-selection':'true',cx:b.cx,cy:b.cy,r:a.size/2+4,fill:'none',stroke:'#1e678f','stroke-dasharray':'3 3'},g);
}
function render(){const s=scene;$('empty').hidden=!!s;$('drawing').toggleAttribute('hidden',!s);

 for(const id of ['saveBtn','pngBtn','checkBtn'])$(id).disabled=!s;
 $('fadeInput').disabled=!s;$('fadeInput').value=Math.round((s?.background.overlayOpacity??0)*100);$('fadeValue').textContent=$('fadeInput').value+'%';

 $('cancelPlacement').hidden=!pending;$('hint').textContent=pending?`点击地图放置「${ICONS[pending].name}」`:s?'拖动标注可整体移动；右侧说明设备种类':'导入重绘后的底图，开始标注';
 if(!s){syncFields();return;}
 const l=C.layout(s),svg=$('drawing');svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${l.width} ${l.height}`);svg.style.aspectRatio=`${l.width}/${l.height}`;
 el('rect',{x:0,y:0,width:l.width,height:l.height,fill:'#fff'});
 const m=l.map;el('image',{id:'mapImage',x:m.x,y:m.y,width:m.width,height:m.height,href:s.background.src,preserveAspectRatio:'xMidYMid meet'});
 el('rect',{id:'mapFade',x:m.x,y:m.y,width:m.width,height:m.height,fill:'#ffffff',opacity:s.background.overlayOpacity??0,'pointer-events':'none'});
 s.annotations.forEach(a=>annotation(a,s));
 const lg=el('g',{'data-legend':'true',transform:`translate(${l.legend.x} ${l.legend.y})`});
 el('rect',{x:0,y:0,width:210,height:C.legendHeight(s),rx:12,fill:'#fff',stroke:'#cdd7df','stroke-width':1.5},lg);text(67,35,'图标说明',20,'#294b63',lg);el('line',{x1:18,y1:49,x2:192,y2:49,stroke:'#dde4e9'},lg);
 let y=64;for(const a of C.legendRows(s)){icon(a.kind,33,y+22,32,a.color,lg);text(58,y+27,ICONS[a.kind].name,15,'#294454',lg);y+=44;}
 $('findings').replaceChildren();const findings=C.inspect(s);if(!findings.length)findings.push('本地检查未发现问题。建筑遮挡仍需结合图片检查。');for(const finding of findings){const li=document.createElement('li');let label=finding;const target=s.annotations.find(a=>finding.includes(a.id));for(const a of s.annotations)label=label.replaceAll(a.id,`${ICONS[a.kind].name}（${a.name||'空标签'}）`);if(target){const b=document.createElement('button');b.className='finding-link';b.textContent=label;b.onclick=()=>{selected=target.id;render();};li.appendChild(b);}else li.textContent=label;$('findings').appendChild(li);}syncFields();
}
function syncFields(){const s=scene,a=s?.annotations.find(a=>a.id===selected);$('annotationFields').disabled=!a;$('selectionHint').textContent=a?`设备种类：${ICONS[a.kind].name}`:'点击地图上的图标或标签进行编辑。';$('hiddenLabelNote').hidden=!a||a.labelVisible;if(!a)return;
 for(const [id,key]of Object.entries({nameInput:'name',colorInput:'color',sizeInput:'size',sideInput:'labelSide',fontInput:'fontSize',distanceInput:'leaderDistance'}))$(id).value=a[key];
 for(const [id,key]of Object.entries({visibleInput:'labelVisible',allowLeaderInput:'allowLeader',leaderInput:'leader'}))$(id).checked=a[key];$('leaderInput').disabled=!a.allowLeader;$('distanceInput').disabled=!a.allowLeader;
}
function library(){const q=$('search').value.trim().toLowerCase(),category=$('category').value;$('icons').replaceChildren();for(const [key,item]of Object.entries(ICONS)){if(category&&item.category!==category||q&&!`${key} ${item.name}`.toLowerCase().includes(q))continue;const button=document.createElement('button');button.className='icon-choice';button.classList.toggle('active',key===pending);button.title=item.name;
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 40 40');icon(key,20,20,38,colors[item.category],svg);button.appendChild(svg);const span=document.createElement('span');span.textContent=item.name;button.appendChild(span);button.onclick=guard(()=>{if(!scene)throw new Error('请先导入底图');pending=key;library();render();});$('icons').appendChild(button);}}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('无法读取底图图片'));img.src=src;});}
function fileData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('无法读取文件'));r.readAsDataURL(file);});}
async function setScene(s){const validated=C.validate(s,ICONS),image=await loadImage(validated.background.src);if(image.naturalWidth!==validated.background.width||image.naturalHeight!==validated.background.height)throw new Error('底图实际尺寸与 JSON 不一致');scene=validated;selected=null;pending=null;dirty=false;saveName=(validated.background.name||'地图').replace(/\.[^.]+$/,'')+'-标注.json';library();render();}
function onFile(id,fn){$(id).onchange=guard(async e=>{const f=e.target.files[0];if(!f)return;try{await fn(f);}finally{e.target.value='';}});}
onFile('imageInput',async file=>{if(scene&&(!confirm('导入新底图会开始新项目，请先保存当前 JSON。继续吗？')))return;const src=await fileData(file),img=await loadImage(src);await setScene({version:1,revision:uid(),background:{name:file.name,src,width:img.naturalWidth,height:img.naturalHeight},annotations:[],legend:{x:780,y:20}});dirty=true;message('底图已导入，现在即可保存 JSON。');});
onFile('sceneInput',async file=>{if(dirty&&!confirm('当前修改尚未保存，确定打开其他 JSON 吗？'))return;await setScene(JSON.parse(await file.text()));saveName=file.name;message('项目已恢复：点位和参数保留，说明栏按设备种类固定在右侧。');});
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('saveBtn').onclick=guard(async()=>{
 if(!scene||saving)return;saving=true;
 const snapshot=C.clone(scene),blob=new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json;charset=utf-8'});
 try{
  if(typeof window.showSaveFilePicker==='function'&&window.isSecureContext){
   try{const handle=await window.showSaveFilePicker({id:'planmark-scenes',suggestedName:saveName,types:[{description:'PlanMark 标注文件',accept:{'application/json':['.json']}}]});const writable=await handle.createWritable();await writable.write(blob);await writable.close();saveName=handle.name;if(scene.revision===snapshot.revision)dirty=false;message(`已保存 ${saveName}，包含底图和全部标注。`);return;}
   catch(e){if(e.name==='AbortError'){message('已取消保存，当前标注保留。');return;}if(!['SecurityError','NotAllowedError','NotSupportedError'].includes(e.name))throw e;}
  }
  const name=prompt('此浏览器不支持选择目录。请输入文件名；位置由浏览器下载设置决定（可启用“每次询问保存位置”）。',saveName);
  if(name===null)return;if(!name.trim()||/[<>:"/\\|?*\x00-\x1f]/.test(name))throw new Error('请输入有效文件名，不要包含路径或特殊字符');
  saveName=/\.json$/i.test(name.trim())?name.trim():name.trim()+'.json';download(blob,saveName);if(scene.revision===snapshot.revision)dirty=false;message(`已下载 ${saveName}。此浏览器的保存目录由下载设置控制。`);
 }finally{saving=false;}
});
function svgSource(){const svg=$('drawing').cloneNode(true),l=C.layout(scene);svg.querySelectorAll('[data-selection]').forEach(n=>n.remove());svg.removeAttribute('id');svg.removeAttribute('style');svg.removeAttribute('hidden');svg.setAttribute('width',l.width);svg.setAttribute('height',l.height);return new XMLSerializer().serializeToString(svg);}
async function pngBlob(maxSide=3840){if(!scene)throw new Error('请先导入底图');await document.fonts.ready;const l=C.layout(scene),scale=maxSide/Math.max(l.width,l.height),canvas=document.createElement('canvas');canvas.width=Math.round(l.width*scale);canvas.height=Math.round(l.height*scale);const url=URL.createObjectURL(new Blob([svgSource()],{type:'image/svg+xml;charset=utf-8'}));try{const img=await loadImage(url);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 导出失败')),'image/png'));}finally{URL.revokeObjectURL(url);}}
let exportingPNG=false;
async function savePNG(){
 if(!scene||exportingPNG)return;exportingPNG=true;
 const name=(scene.background.name||'方案').replace(/\.[^.]+$/,'')+'-标注.png';
 try{
  let handle=null;
  if(typeof window.showSaveFilePicker==='function'&&window.isSecureContext){
   try{handle=await window.showSaveFilePicker({id:'planmark-png',suggestedName:name,types:[{description:'PNG 图片',accept:{'image/png':['.png']}}]});}
   catch(e){if(e.name==='AbortError'){message('已取消导出，标注保留。');return;}if(!['SecurityError','NotAllowedError','NotSupportedError'].includes(e.name))throw e;}
  }
  const blob=await pngBlob();
  if(handle){const stream=await handle.createWritable();try{await stream.write(blob);await stream.close();}catch(e){await stream.abort().catch(()=>{});throw e;}message(`已保存 ${handle.name}，长边 3840 像素。`);return;}
  const config=await fetch('/api/export-config').then(r=>{if(!r.ok)throw new Error('另存为需要本地服务，请通过项目本地地址打开页面');return r.json();});
  const png=await fileData(blob);
  const response=await fetch('/api/export-png',{method:'POST',headers:{'Content-Type':'application/json','X-PlanMark-Token':config.token},body:JSON.stringify({png,name})});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'保存失败');
  message(result.cancelled?'已取消导出，标注保留。':`已保存 ${result.path}，长边 3840 像素。`);
 }finally{exportingPNG=false;}
}
$('pngBtn').onclick=guard(savePNG);
for(const [id,key]of Object.entries({nameInput:'name',colorInput:'color',sizeInput:'size',sideInput:'labelSide',fontInput:'fontSize',visibleInput:'labelVisible',allowLeaderInput:'allowLeader',leaderInput:'leader',distanceInput:'leaderDistance'})){
 $(id).onchange=guard(()=>{const candidate=C.clone(scene),a=candidate.annotations.find(a=>a.id===selected);if(!a)return;const input=$(id);a[key]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;if(key==='allowLeader'&&!a.allowLeader)a.leader=false;try{scene=C.validate(candidate,ICONS);changed();render();}catch(e){syncFields();throw e;}});
}
$('deleteBtn').onclick=guard(()=>{scene.annotations=scene.annotations.filter(a=>a.id!==selected);selected=null;changed();render();});
$('checkBtn').onclick=()=>{render();message('本地检查已更新。');};
$('fadeInput').oninput=guard(()=>{if(!scene)return;scene.background.overlayOpacity=Number($('fadeInput').value)/100;changed();render();});
$('cancelPlacement').onclick=()=>{pending=null;library();render();};$('search').oninput=library;$('category').onchange=library;
function point(e){const svg=$('drawing'),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
$('drawing').onpointerdown=guard(e=>{if(!scene||e.button!==0)return;if(e.target.closest('[data-legend]'))return;const p=point(e),target=e.target.closest('[data-ann]');
 if(target){e.preventDefault();const id=target.getAttribute('data-ann');selected=id;drag={id,start:p,original:{x:scene.annotations.find(a=>a.id===id).x,y:scene.annotations.find(a=>a.id===id).y},moved:false,before:C.clone(scene)};pending=null;$('drawing').setPointerCapture(e.pointerId);render();library();return;}
 if(!pending){selected=null;syncFields();render();return;}const m=C.layout(scene).map;if(p.x<m.x||p.x>m.x+m.width||p.y<m.y||p.y>m.y+m.height)return;
 if(scene.annotations.length>=200)throw new Error('当前版本最多支持 200 个标注');
 selected=uid();scene.annotations.push({id:selected,kind:pending,name:ICONS[pending].name,color:colors[ICONS[pending].category],x:(p.x-m.x)/m.width,y:(p.y-m.y)/m.height,size:40,fontSize:17,labelSide:'right',labelVisible:true,allowLeader:false,leader:false,leaderDistance:40});pending=null;changed();library();render();message('标注已放置。可在右侧填写功率或参数。');
});
$('drawing').onpointermove=e=>{if(!drag)return;const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(Math.abs(dx)+Math.abs(dy)<2&&!drag.moved)return;drag.moved=true;
 const a=scene.annotations.find(a=>a.id===drag.id),m=C.layout(scene).map;a.x=clamp(drag.original.x+dx/m.width,0,1);a.y=clamp(drag.original.y+dy/m.height,0,1);render();};
function finishDrag(){if(drag?.moved)changed();drag=null;}
$('drawing').onpointerup=finishDrag;$('drawing').onlostpointercapture=finishDrag;$('drawing').onpointercancel=()=>{if(drag){scene=drag.before;drag=null;render();}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){pending=null;library();render();}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
window.EngineeringAnnotator={getScene:()=>C.clone(scene),setScene,inspect:()=>scene?C.inspect(scene):[],exportPNG:pngBlob};
$('iconCount').textContent=Object.keys(ICONS).length;library();render();
