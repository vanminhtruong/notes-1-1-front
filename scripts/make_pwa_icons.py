from PIL import Image, ImageDraw
from pathlib import Path
root=Path(r"C:\Users\ASUS\Documents\plant\duan\Front\public")
for size in (192,512):
    im=Image.new("RGBA",(size,size),(18,18,18,255))
    d=ImageDraw.Draw(im)
    s=size/512
    box=tuple(round(x*s) for x in (95,65,417,447))
    radius=round(48*s)
    d.rounded_rectangle(box,radius=radius,fill=(35,35,35,255),outline=(146,146,146,255),width=max(2,round(5*s)))
    for y,width in ((180,190),(235,190),(290,125)):
        d.rounded_rectangle((round(160*s),round((y-9)*s),round((160+width)*s),round((y+9)*s)),radius=round(8*s),fill=(224,224,224,255))
    d.ellipse(tuple(round(x*s) for x in (282,306,414,438)),fill=(235,235,235,255))
    d.line(tuple((round(x*s),round(y*s)) for x,y in ((309,370),(332,394),(387,344))),fill=(25,25,25,255),width=max(5,round(17*s)),joint="curve")
    im.save(root/f"offline-icon-{size}.png")
    print("Wrote icon",size)
