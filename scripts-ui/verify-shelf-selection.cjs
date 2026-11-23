const fs=require('fs'),{PNG}=require(process.cwd()+'/node_modules/pngjs');
const dir='docs/ekran/raf-v2/';
const read=n=>PNG.sync.read(fs.readFileSync(dir+n+'.png'));
const rgb=(im,x,y)=>{const i=(y*im.width+x)*4;return (im.data[i]<<16)|(im.data[i+1]<<8)|im.data[i+2]};
const pairs=[['selection-clear','09-pixel-selected','10-pixel-cleared'],['handle-move','09-pixel-selected','11-handle-test'],['native-long-press','06-reader-word-tap','07-reader-selection']];
const ink=new Set([0x352e26,0x172b40,0xb53731,0x701923]);
const results=pairs.map(([label,af,bf])=>{
 const a=read(af),b=read(bf),w=a.width,h=a.height;const mask=new Uint8Array(w*h),handles=new Uint8Array(w*h);let blue=0;
 for(const im of [a,b])for(let y=400;y<1660;y++){
 let lo=w,hi=-1;
 for(let x=0;x<w;x++){let c=rgb(im,x,y);if(c===0xc9ddf0||c===0x366ba6){lo=Math.min(lo,x);hi=Math.max(hi,x);blue++}if(c===0x366ba6)for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){if(x+dx>=0&&x+dx<w)handles[(y+dy)*w+x+dx]=1;}}
 if(hi>=0)for(let yy=y-5;yy<=y+5;yy++)for(let x=Math.max(0,lo-5);x<=Math.min(w-1,hi+5);x++)mask[yy*w+x]=1;
 }
 let changed=0,glyph=0,visible=0,maxDelta=0;
 for(let y=400;y<1660;y++)for(let x=0;x<w;x++){const ca=rgb(a,x,y),cb=rgb(b,x,y),i=y*w+x;if(!mask[i]&&ca!==cb){changed++;const delta=Math.max(...[16,8,0].map(shift=>Math.abs(((ca>>shift)&255)-((cb>>shift)&255))));maxDelta=Math.max(maxDelta,delta);if(delta>1)visible++;}if(!handles[i]&&ink.has(ca)!==ink.has(cb))glyph++;}
 return {pair:label,roi:[0,400,w,1660],selectionPixels:blue,changedPixelsOutsideSelection:changed,changedSolidGlyphPixels:glyph,pixelsAboveOneLevelRasterTolerance:visible,maxChannelDeltaOutsideSelection:maxDelta};
});
fs.writeFileSync(dir+'pixel-report.json',JSON.stringify(results,null,2)+'\n');console.log(results);if(results.some(r=>!r.selectionPixels||r.pixelsAboveOneLevelRasterTolerance))process.exitCode=1;
