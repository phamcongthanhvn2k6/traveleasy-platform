# -*- coding: utf-8 -*-
"""
Script to generate 5 professional Word (.docx) and Markdown (.md) documents
matching the Google Docs tabs layout:
1. SRS tham khảo (01_SRS_tham_khao.docx)
2. SRS TravelEasy / SRS thunder deli (02_SRS_TravelEasy.docx & 02_SRS_thunder_deli.docx)
3. backlog (03_backlog.docx)
4. report sprint 1 (04_report_sprint_1.docx)
5. planning sprint 2 (05_planning_sprint_2.docx)
Bonus:
6. report sprint 2 & planning sprint 3 (06_report_sprint_2_planning_sprint_3.docx)
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

OUTPUT_DIR = os.path.join(os.getcwd(), "docs", "google-docs-export")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------- DOCX STYLING HELPERS -----------------
COLOR_PRIMARY = RGBColor(30, 58, 138)    # Deep Navy (#1E3A8A)
COLOR_SECONDARY = RGBColor(37, 99, 235)  # Royal Blue (#2563EB)
COLOR_DARK = RGBColor(30, 41, 59)        # Slate Dark (#1E293B)
COLOR_MUTED = RGBColor(100, 116, 139)    # Gray (#64748B)

HEX_HEADER_BG = "1E3A8A"     # Deep Navy
HEX_ROW_EVEN = "F8FAFC"      # Slate 50
HEX_ROW_ODD = "FFFFFF"       # White
HEX_BORDER = "CBD5E1"        # Light gray border

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def style_table(table, header_bg=HEX_HEADER_BG):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header row
    for cell in table.rows[0].cells:
        set_cell_background(cell, header_bg)
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.size = Pt(9.5)
                run.font.name = "Arial"
                
    # Data rows
    for r_idx, row in enumerate(table.rows[1:], start=1):
        bg = HEX_ROW_EVEN if r_idx % 2 == 0 else HEX_ROW_ODD
        for cell in row.cells:
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(9)
                    run.font.name = "Arial"
                    run.font.color.rgb = COLOR_DARK

def create_base_doc(title, subtitle, author="Nhóm 7 - Dự Án TravelEasy"):
    doc = docx.Document()
    
    # 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
        # Header / Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.text = f"{title} | {author}"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        if hp.runs:
            hp.runs[0].font.size = Pt(8)
            hp.runs[0].font.color.rgb = COLOR_MUTED
            hp.runs[0].font.name = "Arial"
            
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Tài liệu bảo mật nội bộ — TravelEasy Platform — Chuẩn quản lý dự án Agile/Scrum"
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if fp.runs:
            fp.runs[0].font.size = Pt(8)
            fp.runs[0].font.color.rgb = COLOR_MUTED
            fp.runs[0].font.name = "Arial"

    # Title Block
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run(title)
    run_title.font.name = "Arial"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY
    
    if subtitle:
        p_sub = doc.add_paragraph()
        p_sub.paragraph_format.space_after = Pt(12)
        run_sub = p_sub.add_run(subtitle)
        run_sub.font.name = "Arial"
        run_sub.font.size = Pt(11)
        run_sub.font.italic = True
        run_sub.font.color.rgb = COLOR_SECONDARY

    # Divider
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(18)
    run_meta = p_meta.add_run(f"📌 Đơn vị: {author}  |  📅 Ngày cập nhật: 04/11/2026  |  Trạng thái: Hoàn thiện (Verified)")
    run_meta.font.name = "Arial"
    run_meta.font.size = Pt(9)
    run_meta.font.color.rgb = COLOR_MUTED
    
    return doc

def add_heading_1(doc, text):
    h = doc.add_heading(level=1)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    run = h.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY
    return h

def add_heading_2(doc, text):
    h = doc.add_heading(level=2)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    run = h.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = COLOR_SECONDARY
    return h

def add_heading_3(doc, text):
    h = doc.add_heading(level=3)
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(2)
    run = h.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(10.5)
    run.font.bold = True
    run.font.color.rgb = COLOR_DARK
    return h

def add_body(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.color.rgb = COLOR_DARK
    return p

def add_callout(doc, text, title="LƯU Ý QUAN TRỌNG"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, "EFF6FF") # Light blue
    set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
    
    # Left border thick
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="36" w:space="0" w:color="2563EB"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"💡 {title}\n")
    r_title.font.name = "Arial"
    r_title.font.bold = True
    r_title.font.size = Pt(9.5)
    r_title.font.color.rgb = COLOR_PRIMARY
    
    r_text = p.add_run(text)
    r_text.font.name = "Arial"
    r_text.font.size = Pt(9)
    r_text.font.color.rgb = COLOR_DARK
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix + " ")
        r_pre.font.name = "Arial"
        r_pre.font.bold = True
        r_pre.font.size = Pt(10)
        r_pre.font.color.rgb = COLOR_DARK
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.color.rgb = COLOR_DARK
    return p

print("Loaded generator base.")
