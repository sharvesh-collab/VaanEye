#!/usr/bin/env python3
"""Render the generated PPTX to PDF + PNG via reportlab (no LibreOffice needed)."""
import sys
from pptx import Presentation
from pptx.util import Emu
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
from reportlab.lib.utils import simpleSplit

SRC="/home/user/VaanEye_SIH2026_Idea_Presentation.pptx"
OUT="/home/user/VaanEye_SIH2026_Idea_Presentation.pdf"
PT=72.0
prs=Presentation(SRC)
W=Emu(prs.slide_width).inches*PT; H=Emu(prs.slide_height).inches*PT

def rgb(c):
    try: return Color(c[0]/255,c[1]/255,c[2]/255)
    except Exception: return Color(1,1,1)

def font_for(bold):
    return "Helvetica-Bold" if bold else "Helvetica"

c=canvas.Canvas(OUT,pagesize=(W,H))
for slide in prs.slides:
    for sh in slide.shapes:
        x=Emu(sh.left).inches*PT; y=Emu(sh.top).inches*PT
        w=Emu(sh.width).inches*PT; h=Emu(sh.height).inches*PT
        Y=H-y-h
        # --- pictures ---
        if sh.shape_type==13 or sh.__class__.__name__=="Picture":
            try:
                import io
                from reportlab.lib.utils import ImageReader
                blob=sh.image.blob
                c.drawImage(ImageReader(io.BytesIO(blob)),x,Y,w,h,mask='auto')
            except Exception as e:
                pass
            continue
        # --- geometry ---
        if sh.shape_type is not None and sh.has_text_frame and sh.shape_type != 17:
            st=getattr(sh,'shape_type',None)
        if sh.__class__.__name__=="Shape":
            fill=None; line=None; lw=0
            try:
                if sh.fill.type is not None and sh.fill.type==1:
                    fill=rgb(sh.fill.fore_color.rgb)
            except Exception: pass
            try:
                if sh.line.fill.type==1:
                    line=rgb(sh.line.color.rgb); lw=(sh.line.width or 12700)/12700.0
            except Exception: pass
            try: at=sh.auto_shape_type
            except Exception: at=None
            if fill or line:
                if fill: c.setFillColor(fill)
                if line: c.setStrokeColor(line); c.setLineWidth(lw)
                mode=(1 if fill else 0, 1 if line else 0)
                if at==MSO_SHAPE.OVAL:
                    c.ellipse(x,Y,x+w,Y+h,stroke=mode[1],fill=mode[0])
                elif at==MSO_SHAPE.ROUNDED_RECTANGLE:
                    r=min(w,h)*0.22
                    c.roundRect(x,Y,w,h,r,stroke=mode[1],fill=mode[0])
                elif at==MSO_SHAPE.RIGHT_ARROW:
                    p=c.beginPath(); p.moveTo(x,Y+h*0.3); p.lineTo(x+w*0.6,Y+h*0.3)
                    p.lineTo(x+w*0.6,Y+h); p.lineTo(x+w,Y+h*0.5); p.lineTo(x+w*0.6,Y)
                    p.lineTo(x+w*0.6,Y+h*0.3); p.close()
                    c.drawPath(p,stroke=mode[1],fill=mode[0])
                elif at==MSO_SHAPE.DOWN_ARROW:
                    p=c.beginPath(); p.moveTo(x+w*0.3,Y+h); p.lineTo(x+w*0.7,Y+h)
                    p.lineTo(x+w*0.7,Y+h*0.4); p.lineTo(x+w,Y+h*0.4); p.lineTo(x+w*0.5,Y)
                    p.lineTo(x,Y+h*0.4); p.lineTo(x+w*0.3,Y+h*0.4); p.close()
                    c.drawPath(p,stroke=mode[1],fill=mode[0])
                else:
                    c.rect(x,Y,w,h,stroke=mode[1],fill=mode[0])
        # --- text ---
        if sh.has_text_frame and sh.text_frame.text.strip():
            tf=sh.text_frame
            cy=H-y  # start at top
            # vertical centering for shapes with single line
            lines=[]
            for p in tf.paragraphs:
                runs=[(r.text,r.font.size.pt if r.font.size else 11,
                       bool(r.font.bold), rgb(r.font.color.rgb) if (r.font.color and r.font.color.type is not None) else Color(1,1,1))
                      for r in p.runs]
                if not runs: continue
                lines.append((p.alignment,(p.line_spacing or 1.2),runs))
            if not lines: continue
            maxsz=max(r[1] for _,_,rs in lines for r in rs)
            cy-= maxsz*0.98
            if sh.__class__.__name__=="Shape":
                total=sum(max(r[1] for r in rs)*ls for _,ls,rs in lines)
                cy=H-y-h/2-maxsz*0.35
            for al,ls,runs in lines:
                sz=max(r[1] for r in runs)
                # wrap: build word-wrapped segments using total width
                txt="".join(r[0] for r in runs)
                c.setFont(font_for(runs[0][2]),sz)
                wrapped=simpleSplit(txt,font_for(runs[0][2]),sz,w) or [txt]
                if len(runs)>1 or len(wrapped)<=1:
                    # draw runs inline (may overflow slightly on long rich lines)
                    if len(wrapped)>1 and len(runs)>1:
                        # approximate: wrap the concatenated text, lose per-run color after first
                        for wl in wrapped:
                            c.setFont(font_for(runs[0][2]),sz); c.setFillColor(runs[0][3])
                            tw=c.stringWidth(wl,font_for(runs[0][2]),sz)
                            xx=x if al!=PP_ALIGN.CENTER else x+(w-tw)/2
                            if al==PP_ALIGN.RIGHT: xx=x+w-tw
                            c.drawString(xx,cy,wl); cy-=sz*ls
                        continue
                    tw=sum(c.stringWidth(t,font_for(b),s) for t,s,b,_ in runs)
                    xx=x if al!=PP_ALIGN.CENTER else x+(w-tw)/2
                    if al==PP_ALIGN.RIGHT: xx=x+w-tw
                    for t,s,b,col in runs:
                        c.setFont(font_for(b),s); c.setFillColor(col)
                        c.drawString(xx,cy,t); xx+=c.stringWidth(t,font_for(b),s)
                    cy-=sz*ls
                else:
                    t,s,b,col=runs[0]
                    for wl in wrapped:
                        c.setFont(font_for(b),s); c.setFillColor(col)
                        tw=c.stringWidth(wl,font_for(b),s)
                        xx=x if al!=PP_ALIGN.CENTER else x+(w-tw)/2
                        if al==PP_ALIGN.RIGHT: xx=x+w-tw
                        c.drawString(xx,cy,wl); cy-=s*ls
    c.showPage()
c.save()
print("pdf ->",OUT)

import pymupdf
d=pymupdf.open(OUT)
for i,p in enumerate(d): p.get_pixmap(dpi=92).save(f"/tmp/p{i+1}.png")
print("pages",d.page_count)
