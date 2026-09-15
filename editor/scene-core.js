(function(root){
'use strict';
const clone=v=>JSON.parse(JSON.stringify(v)), sides=['right','bottom','left','top'];
const check=(ok,msg)=>{if(!ok)throw new Error(msg)};
const number=(v,min,max,name)=>check(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max,`${name} 超出范围`);
const color=v=>check(typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v),'颜色必须是六位十六进制色值');
function validate(s,icons){
 check(s&&s.version===1,'不支持此 JSON 格式，请使用 PlanMark v1 保存的项目');
 check(typeof s.revision==='string'&&s.revision.length>0,'缺少项目版本标识');
 check(s.background&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s.background.src),'JSON 必须内嵌 PNG、JPEG 或 WebP 底图');
 number(s.background.width,1,40000,'底图宽度');number(s.background.height,1,40000,'底图高度');
 number(s.background.overlayOpacity??0,0,1,'底图淡化');
 check(Array.isArray(s.annotations)&&s.annotations.length<=200,'标注列表不合法（最多 200 个）');
 const ids=new Set();
 for(const a of s.annotations){
  check(a&&typeof a.id==='string'&&a.id.length>0&&!ids.has(a.id),'标注 ID 缺失或重复');ids.add(a.id);
  check(typeof a.kind==='string'&&Object.hasOwn(icons,a.kind),'无法识别的 SVG 图标');
  check(typeof a.name==='string'&&a.name.length<=100,'名称最长 100 字');color(a.color);
  number(a.x,0,1,'点位 x');number(a.y,0,1,'点位 y');number(a.size,24,64,'图标大小');number(a.fontSize,12,28,'标签字号');
  check(sides.includes(a.labelSide),'标签方向不合法');check(typeof a.labelVisible==='boolean','缺少标签显示状态');
  check(typeof a.allowLeader==='boolean'&&typeof a.leader==='boolean','缺少引线状态');check(!a.leader||a.allowLeader,'此标注未允许使用引线');number(a.leaderDistance,12,80,'引线距离');
 }
 const result=clone(s);result.background.overlayOpacity??=0;result.legend={position:'right-center'};return result;
}
function legendRows(s){const rows=new Map();for(const a of s.annotations)if(!rows.has(a.kind))rows.set(a.kind,{kind:a.kind,color:a.color});return [...rows.values()];}
function wrap(text,max=10){const chars=Array.from(text||'未命名');const rows=[];for(let i=0;i<chars.length;i+=max)rows.push(chars.slice(i,i+max).join(''));return rows;}
function legendHeight(s){return 64+legendRows(s).length*44;}
function layout(s){const map={x:20,y:20,width:740,height:740*s.background.height/s.background.width},height=Math.max(560,map.height+40,legendHeight(s)+40);return {width:1000,height,map,legend:{x:780,y:(height-legendHeight(s))/2}};}
function labelBox(a,s){const m=layout(s).map,x=m.x+a.x*m.width,y=m.y+a.y*m.height;const lines=wrap(a.name,16),w=Math.max(...lines.map(l=>Array.from(l).reduce((n,c)=>n+(/[\u0000-\u007f]/.test(c)?.6:1)*a.fontSize,0)))+20,h=lines.length*(a.fontSize+4)+12,gap=a.leader?a.leaderDistance:2,r=a.size/2;let bx=x+r+gap,by=y-h/2;
 if(a.labelSide==='left')bx=x-r-gap-w;
 if(a.labelSide==='top'){bx=x-w/2;by=y-r-gap-h;}
 if(a.labelSide==='bottom'){bx=x-w/2;by=y+r+gap;}
 return {x:bx,y:by,w,h,lines,cx:x,cy:y};
}
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function inspect(s){const out=[],l=layout(s),rects=[];
 for(const a of s.annotations){const b=labelBox(a,s);rects.push({id:a.id,type:'图标',x:b.cx-a.size/2,y:b.cy-a.size/2,w:a.size,h:a.size});if(a.labelVisible)rects.push({id:a.id,type:'标签',...b});}
 rects.push({id:'legend',type:'说明栏',x:l.legend.x,y:l.legend.y,w:210,h:legendHeight(s)});
 for(let i=0;i<rects.length;i++){const a=rects[i];if(a.x<0||a.y<0||a.x+a.w>l.width||a.y+a.h>l.height)out.push(`${a.id} ${a.type}超出画面`);for(let j=i+1;j<rects.length;j++){const b=rects[j];if(a.id!==b.id&&overlap(a,b))out.push(`${a.id} ${a.type}与 ${b.id} ${b.type}重叠`);}}
 const kinds=new Map();
 for(const a of s.annotations){
  if(!a.labelVisible&&a.name.trim())out.push(`${a.id} 标签已隐藏，参数不会显示在导出图中`);
  const rgb=a.color.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  if(1.05/(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]+.05)<3)out.push(`${a.id} 背景色偏浅，白色图标对比不足`);
  if(kinds.has(a.kind)&&kinds.get(a.kind)!==a.color.toLowerCase())out.push(`${a.id} 同类图标使用不同颜色，说明栏只显示一种代表色`);
  else kinds.set(a.kind,a.color.toLowerCase());
 }
 return [...new Set(out)];
}
const api={validate,clone,legendRows,legendHeight,layout,labelBox,inspect,wrap};
if(typeof module!=='undefined')module.exports=api;else root.PlanMarkCore=api;
})(typeof window==='undefined'?globalThis:window);
