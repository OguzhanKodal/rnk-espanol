from pathlib import Path
import json
from PIL import Image,ImageChops,ImageFilter
root=Path(__file__).resolve().parents[1] / 'docs/ekran/modern/after'
report=[]
for label,on,off in [('real','22-cycle-selected','23-cycle-cleared'),('arabic-fixture','27-fixture-selected','28-fixture-cleared'),('handle-move','22-cycle-selected','24-cycle-handle-moved'),('native-drag','30-native-selection','31-native-drag')]:
 a=Image.open(root/(on+'.png')).convert('RGB');b=Image.open(root/(off+'.png')).convert('RGB')
 # Reserved chrome above; stop above the toolbar shadow, which starts at y=1669.
 # No mask is seeded by changed pixels. Glyph cores include both selection ink colors.
 box=(0,405,a.width,1660) if a.width == 1206 else (0,130,a.width,560)
 mask=Image.new('L',a.size);target=mask.load()
 for im in (a,b):
  for y in range(box[1],box[3]):
   xs=[x for x,c in enumerate(im.crop((0,y,a.width,y+1)).get_flattened_data()) if c in {(201,221,240),(54,107,166)}]
   if xs:
    for x in range(min(xs),max(xs)+1): target[x,y]=255
 mask=mask.filter(ImageFilter.MaxFilter(9));roi=Image.new('L',a.size);roi.paste(255,box)
 diff=Image.composite(ImageChops.difference(a,b),Image.new('RGB',a.size),ImageChops.subtract(roi,mask))
 count=sum(p!=(0,0,0) for p in diff.get_flattened_data())
 diff.save(root/(label+'-selection-diff.png'))
 # Color-independent solid glyph cores include selected Latin and Arabic ink.
 inks={(53,46,38),(23,43,64),(181,55,49),(112,25,35)}
 def core(im):
  out=Image.new('L',im.size);out.putdata([255 if c in inks else 0 for c in im.get_flattened_data()]);return out
 handle=Image.new('L',a.size);handle.putdata([255 if c==(54,107,166) else 0 for c in a.get_flattened_data()]);handle=handle.filter(ImageFilter.MaxFilter(9))
 glyph=ImageChops.multiply(ImageChops.difference(core(a),core(b)),ImageChops.subtract(roi,handle));gc=sum(p!=0 for p in glyph.get_flattened_data());glyph.save(root/(label+'-glyph-diff.png'))
 report.append(dict(pair=label,roi=box,changed_pixels_outside_selection=count,changed_solid_glyph_pixels=gc))
print(json.dumps(report,indent=2));(root/'pixel-report.json').write_text(json.dumps(report,indent=2)+'\n')
assert all(r['changed_pixels_outside_selection']==0 and r['changed_solid_glyph_pixels']==0 for r in report)
