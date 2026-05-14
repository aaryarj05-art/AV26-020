"""
Helix PDF Report Generator — ReportLab-based PDF generation.
Falls back gracefully if ReportLab/matplotlib not installed.
"""
import io
import random
from datetime import datetime, timedelta

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable
    )
    from reportlab.platypus import Image as RLImage
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False

HELIX_ACCENT = None
HELIX_DARK   = None
HELIX_BORDER = None
DANGER_RED   = None
WARN_AMBER   = None
SUCCESS_GRN  = None
TEXT_MUTED   = None

if HAS_REPORTLAB:
    HELIX_ACCENT = colors.HexColor("#00D4FF")
    HELIX_DARK   = colors.HexColor("#0A0F1E")
    HELIX_BORDER = colors.HexColor("#1F2937")
    DANGER_RED   = colors.HexColor("#EF4444")
    WARN_AMBER   = colors.HexColor("#F59E0B")
    SUCCESS_GRN  = colors.HexColor("#10B981")
    TEXT_MUTED   = colors.HexColor("#9CA3AF")


def _make_trend_chart(region, disease):
    if not HAS_MATPLOTLIB:
        return None
    hist = [max(0, 200 + random.randint(-30, 30) + i * 3) for i in range(30)]
    forecast = [hist[-1] + i * random.randint(2, 8) for i in range(1, 29)]
    ci_up = [v + int(v * 0.12) for v in forecast]
    ci_lo = [max(0, v - int(v * 0.12)) for v in forecast]
    fig, ax = plt.subplots(figsize=(5.5, 2.2))
    fig.patch.set_facecolor("#0A0F1E")
    ax.set_facecolor("#111827")
    ax.plot(range(-30, 0), hist, color="#00D4FF", lw=2, label="Historical")
    ax.plot(range(0, 28), forecast, color="#F59E0B", lw=2, ls="--", label="Forecast")
    ax.fill_between(range(0, 28), ci_lo, ci_up, color="#F59E0B", alpha=0.15)
    ax.axvline(0, color="#EF4444", lw=1, ls=":")
    ax.tick_params(colors="#9CA3AF", labelsize=7)
    for sp in ax.spines.values():
        sp.set_edgecolor("#1F2937")
    ax.legend(fontsize=7, facecolor="#111827", labelcolor="#9CA3AF")
    ax.set_title(f"{disease} — {region}", color="white", fontsize=9, pad=4)
    plt.tight_layout(pad=0.4)
    buf = io.BytesIO()
    fig.savefig(buf, format="PNG", dpi=120, facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf


def _make_bar_chart(labels, values):
    if not HAS_MATPLOTLIB:
        return None
    pal = ["#00D4FF", "#10B981", "#F59E0B", "#EF4444"]
    fig, ax = plt.subplots(figsize=(3.0, 1.8))
    fig.patch.set_facecolor("#0A0F1E")
    ax.set_facecolor("#111827")
    ax.bar(labels, values, color=[pal[i % len(pal)] for i in range(len(labels))],
           edgecolor="#1F2937")
    ax.tick_params(colors="#9CA3AF", labelsize=7)
    for sp in ax.spines.values():
        sp.set_edgecolor("#1F2937")
    ax.set_title("Disease Breakdown", color="white", fontsize=9, pad=4)
    plt.tight_layout(pad=0.4)
    buf = io.BytesIO()
    fig.savefig(buf, format="PNG", dpi=120, facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf


def _make_map_thumbnail():
    if not HAS_MATPLOTLIB:
        return None
    # Simplified India Map representation
    # Coordinates are approximate for a "thumbnail" feel
    regions = {
        "North": (0.5, 0.8),
        "West": (0.2, 0.5),
        "South": (0.4, 0.2),
        "East": (0.8, 0.5),
        "Central": (0.5, 0.5)
    }
    risk_colors = ["#EF4444", "#F59E0B", "#10B981", "#00D4FF", "#F59E0B"]
    
    fig, ax = plt.subplots(figsize=(2.5, 2.5))
    fig.patch.set_facecolor("#0A0F1E")
    ax.set_facecolor("#111827")
    
    # Draw a rough diamond/pentagon for India
    poly = [[0.5, 0.95], [0.8, 0.6], [0.6, 0.1], [0.4, 0.1], [0.1, 0.5]]
    ax.add_patch(plt.Polygon(poly, color="#1F2937", ec="#00D4FF", lw=1))
    
    # Plot region dots
    for i, (name, pos) in enumerate(regions.items()):
        ax.scatter(pos[0], pos[1], color=risk_colors[i], s=50, edgecolors="white", zorder=3)
        ax.text(pos[0], pos[1]-0.05, name, color="white", fontsize=6, ha="center")
        
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    ax.set_title("Regional Risk Map", color="white", fontsize=8, pad=0)
    
    plt.tight_layout(pad=0.1)
    buf = io.BytesIO()
    fig.savefig(buf, format="PNG", dpi=100, facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf


class ReportGenerator:

    def _styles(self):
        return {
            "h1":   ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=18,
                                   textColor=HELIX_ACCENT, alignment=TA_CENTER, spaceAfter=2),
            "sub":  ParagraphStyle("sub", fontName="Helvetica", fontSize=9,
                                   textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=2),
            "sec":  ParagraphStyle("sec", fontName="Helvetica-Bold", fontSize=11,
                                   textColor=HELIX_ACCENT, spaceBefore=10, spaceAfter=4),
            "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9,
                                   textColor=colors.black, leading=14, spaceAfter=4),
            "blt":  ParagraphStyle("blt", fontName="Helvetica", fontSize=9,
                                   textColor=colors.black, leftIndent=10, leading=13, spaceAfter=3),
            "foot": ParagraphStyle("foot", fontName="Helvetica-Oblique", fontSize=7,
                                   textColor=TEXT_MUTED, alignment=TA_CENTER),
        }

    def _header(self, story, s, region, rtype, date_str):
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph("HELIX", s["h1"]))
        story.append(Paragraph("Predictive Biomedical &amp; Public Health Intelligence Platform", s["sub"]))
        story.append(Paragraph(f"<b>{rtype}</b>", s["sub"]))
        story.append(Spacer(1, 2 * mm))
        meta = [["Region", region, "Generated", date_str],
                ["Classification", "CONFIDENTIAL — For Health Authority Use Only", "", ""]]
        t = Table(meta, colWidths=[28*mm, 82*mm, 26*mm, 46*mm])
        t.setStyle(TableStyle([
            ("FONTSIZE", (0,0), (-1,-1), 8),
            ("TEXTCOLOR", (0,0), (0,-1), TEXT_MUTED),
            ("TEXTCOLOR", (2,0), (2,-1), TEXT_MUTED),
            ("FONTNAME", (1,0), (1,-1), "Helvetica-Bold"),
            ("GRID", (0,0), (-1,-1), 0.3, HELIX_BORDER),
            ("BACKGROUND", (0,0), (-1,-1), HELIX_DARK),
            ("TEXTCOLOR", (1,1), (3,1), DANGER_RED),
            ("SPAN", (1,1), (3,1)),
        ]))
        story.append(t)
        story.append(HRFlowable(width="100%", thickness=0.5, color=HELIX_ACCENT, spaceAfter=6))

    def _footer(self, story, s):
        story.append(Spacer(1, 6*mm))
        story.append(HRFlowable(width="100%", thickness=0.3, color=HELIX_BORDER))
        story.append(Spacer(1, 2*mm))
        story.append(Paragraph(
            "Generated by Helix AI Intelligence Platform | "
            "Confidential — For Health Authority Use Only | helix-health.ai",
            s["foot"]))

    def _tbl_style(self):
        return [
            ("BACKGROUND", (0,0), (-1,0), HELIX_DARK),
            ("TEXTCOLOR", (0,0), (-1,0), HELIX_ACCENT),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE", (0,0), (-1,-1), 8.5),
            ("GRID", (0,0), (-1,-1), 0.3, HELIX_BORDER),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F9FAFB")]),
        ]

    # ── Regional Brief ────────────────────────────────────────────────────────
    def generate_regional_brief(self, region: str, disease: str, date_range: str = "Last 30 days") -> bytes:
        if not HAS_REPORTLAB:
            return b"%PDF-1.4 (pip install reportlab to enable PDF generation)"
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
                                topMargin=10*mm, bottomMargin=10*mm,
                                leftMargin=18*mm, rightMargin=18*mm)
        s = self._styles()
        story = []
        now_str = datetime.now().strftime("%d %b %Y %H:%M IST")
        self._header(story, s, region, "HEALTH SURVEILLANCE BRIEFING", now_str)

        risk  = random.randint(30, 92)
        cases = random.randint(200, 4000)
        chg   = random.randint(-10, 35)
        trend = "rising" if chg > 0 else "declining"

        story.append(Paragraph("Executive Summary", s["sec"]))
        story.append(Paragraph(
            f"The {region} region is experiencing a <b>{trend} {disease} situation</b> with "
            f"{cases:,} active cases (risk score {risk}/100). "
            f"Cases have {'increased' if chg>0 else 'decreased'} by <b>{abs(chg)}%</b> vs last week. "
            f"Helix forecasts a peak in <b>{random.randint(7,21)} days</b>.", s["body"]))

        story.append(Paragraph("Risk Assessment", s["sec"]))
        rc = DANGER_RED if risk>=75 else WARN_AMBER if risk>=45 else SUCCESS_GRN
        rl = "CRITICAL" if risk>=75 else "ELEVATED" if risk>=45 else "MODERATE"
        rd = [["Metric","Current","Last Week","Change"],
              ["Risk Score",f"{risk}/100",f"{risk-chg//2}/100",f"{chg:+}%"],
              ["Active Cases",f"{cases:,}",f"{cases-cases*chg//100:,}",f"{chg:+}%"],
              ["Alert Level", rl, "ELEVATED", "↑" if risk>60 else "→"],
              ["Confidence",f"{random.randint(82,96)}%",f"{random.randint(80,94)}%","—"]]
        rt = Table(rd, colWidths=[55*mm,40*mm,40*mm,30*mm])
        rt.setStyle(TableStyle(self._tbl_style() +
                               [("TEXTCOLOR",(1,1),(1,1),rc),
                                ("FONTNAME",(1,1),(1,1),"Helvetica-Bold")]))
        story.append(rt)

        story.append(Paragraph("Case Statistics", s["sec"]))
        deaths = int(cases*random.uniform(0.005,0.02))
        rec    = int(cases*random.uniform(0.6,0.85))
        sd = [["Confirmed","Suspected","Deaths","Recovered"],
              [f"{cases:,}",f"{int(cases*1.4):,}",f"{deaths:,}",f"{rec:,}"]]
        st = Table(sd, colWidths=[42*mm]*4)
        st.setStyle(TableStyle(self._tbl_style() + [
            ("ALIGN",(0,0),(-1,-1),"CENTER"),
            ("TEXTCOLOR",(0,1),(0,1),HELIX_ACCENT),
            ("TEXTCOLOR",(2,1),(2,1),DANGER_RED),
            ("TEXTCOLOR",(3,1),(3,1),SUCCESS_GRN),
            ("FONTNAME",(0,1),(-1,1),"Helvetica-Bold"),
            ("FONTSIZE",(0,1),(-1,1),13),
        ]))
        story.append(st)

        story.append(Paragraph("Case Trend &amp; 4-Week Forecast", s["sec"]))
        cb = _make_trend_chart(region, disease)
        story.append(RLImage(cb, width=165*mm, height=55*mm) if cb
                     else Paragraph("[Install matplotlib for chart]", s["body"]))

        story.append(Paragraph("Environmental Factors", s["sec"]))
        for e in [f"• Rainfall: {random.randint(40,180)} mm/month (above seasonal average)",
                  f"• Humidity: {random.randint(65,92)}% (favours {disease} transmission)",
                  f"• Temperature: {random.randint(26,34)}°C (peak transmission range)",
                  f"• AQI: {random.randint(45,180)} (moderate)"]:
            story.append(Paragraph(e, s["blt"]))

        story.append(Paragraph("Active Alerts", s["sec"]))
        alts = [("CRITICAL",f"Cluster in North {region} — 48h window"),
                ("HIGH",    f"Bed occupancy {random.randint(75,95)}% in 3 facilities"),
                ("MEDIUM",  f"Symptom spike +{random.randint(20,60)}%")]
        ad = [["Severity","Alert","Action"]] + [
             [sv, msg, "Emergency Protocol" if sv=="CRITICAL" else "Notify CMO" if sv=="HIGH" else "Monitor 24h"]
             for sv,msg in alts]
        at = Table(ad, colWidths=[22*mm,92*mm,50*mm])
        sc = {"CRITICAL":DANGER_RED,"HIGH":WARN_AMBER,"MEDIUM":SUCCESS_GRN}
        at.setStyle(TableStyle(self._tbl_style() +
                               [("TEXTCOLOR",(0,i+1),(0,i+1), sc[sv]) for i,(sv,_) in enumerate(alts)] +
                               [("FONTNAME",(0,i+1),(0,i+1),"Helvetica-Bold") for i in range(3)]))
        story.append(at)

        story.append(Paragraph("Resource Status", s["sec"]))
        res_data = [["Resource", "Inventory", "Projected (4wk)", "Gap", "Status"],
                    ["Hospital Beds", "1,200", "1,450", "-250", "CRITICAL"],
                    ["Medicine Units", "50,000", "42,000", "+8,000", "STABLE"],
                    ["Personnel", "450", "520", "-70", "ELEVATED"],
                    ["Ambulances", "42", "45", "-3", "MODERATE"]]
        res_t = Table(res_data, colWidths=[38*mm, 35*mm, 35*mm, 25*mm, 31*mm])
        res_t.setStyle(TableStyle(self._tbl_style() + [
            ("TEXTCOLOR", (4,1), (4,1), DANGER_RED),
            ("TEXTCOLOR", (4,2), (4,2), SUCCESS_GRN),
            ("TEXTCOLOR", (4,3), (4,3), WARN_AMBER),
            ("FONTNAME", (4,1), (4,-1), "Helvetica-Bold"),
        ]))
        story.append(res_t)

        story.append(Paragraph("Recommended Actions", s["sec"]))
        for a in ["1. Pre-position 500 ORS kits to North sub-district within 48h.",
                  "2. Issue public advisory on vector control measures.",
                  "3. Activate 50 overflow beds at District General Hospital.",
                  "4. Deploy 2 rapid response teams to cluster zone.",
                  "5. Daily CMO briefings until risk score < 50."]:
            story.append(Paragraph(a, s["blt"]))

        self._footer(story, s)
        doc.build(story)
        return buf.getvalue()

    # ── National Summary ──────────────────────────────────────────────────────
    def generate_national_summary(self) -> bytes:
        if not HAS_REPORTLAB:
            return b"%PDF-1.4 (pip install reportlab)"
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=10*mm, bottomMargin=10*mm,
                                leftMargin=18*mm, rightMargin=18*mm)
        s = self._styles()
        story = []
        now_str = datetime.now().strftime("%d %b %Y %H:%M IST")
        self._header(story, s, "All India", "NATIONAL HEALTH SURVEILLANCE SUMMARY", now_str)

        total = sum(random.randint(500,5000) for _ in range(5))
        story.append(Paragraph("National Overview", s["sec"]))
        story.append(Paragraph(
            f"India's surveillance system tracks <b>{total:,} active cases</b> across 5 regions. "
            f"Dengue is the primary threat. ML models forecast national peak in "
            f"<b>{random.randint(10,25)} days</b>.", s["body"]))

        regions  = ["Maharashtra","Delhi","Karnataka","Tamil Nadu","Kerala"]
        diseases = ["Dengue","Malaria","Influenza","Cholera"]
        nd = [["Region","Active Cases","Dominant Disease","Risk Score","Trend"]] + [
              [r, f"{random.randint(200,4000):,}", random.choice(diseases),
               f"{random.randint(30,90)}/100", random.choice(["↑ Rising","→ Stable","↓ Declining"])]
              for r in regions]
        nt = Table(nd, colWidths=[38*mm,28*mm,40*mm,28*mm,30*mm])
        nt.setStyle(TableStyle(self._tbl_style()))
        story.append(nt)

        story.append(Paragraph("Disease Distribution", s["sec"]))
        bb = _make_bar_chart(diseases, [random.randint(500,3000) for _ in diseases])
        story.append(RLImage(bb, width=100*mm, height=55*mm) if bb
                     else Paragraph("[Install matplotlib]", s["body"]))

        story.append(Paragraph("National Risk Distribution", s["sec"]))
        mb = _make_map_thumbnail()
        if mb:
            story.append(RLImage(mb, width=60*mm, height=60*mm))
        
        story.append(Paragraph("National Priorities", s["sec"]))
        for p in ["1. Mobilise rapid response teams to Maharashtra and Delhi.",
                  "2. Trigger WHO reporting for clusters >500 cases/district.",
                  "3. Confirm all state health ministries received daily Helix briefings.",
                  "4. Coordinate inter-state resource transfers within 72h."]:
            story.append(Paragraph(p, s["blt"]))

        self._footer(story, s)
        doc.build(story)
        return buf.getvalue()

    # ── Alert Brief ───────────────────────────────────────────────────────────
    def generate_alert_brief(self, alert_id: str) -> bytes:
        if not HAS_REPORTLAB:
            return b"%PDF-1.4 (pip install reportlab)"
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=10*mm, bottomMargin=10*mm,
                                leftMargin=18*mm, rightMargin=18*mm)
        s = self._styles()
        story = []
        now_str = datetime.now().strftime("%d %b %Y %H:%M IST")
        self._header(story, s, f"Alert #{alert_id}", "EMERGENCY ALERT BRIEF", now_str)
        story.append(Paragraph("Alert Summary", s["sec"]))
        story.append(Paragraph(
            f"<b>Alert ID:</b> {alert_id} | <b>Severity:</b> CRITICAL | <b>Triggered:</b> {now_str}",
            s["body"]))
        story.append(Paragraph(
            "Helix AI detected an anomalous disease cluster exceeding 3-sigma deviation. "
            "Immediate response required within <b>12 hours</b>.", s["body"]))
        story.append(Paragraph("Immediate Actions", s["sec"]))
        for a in ["1. Notify District Collector and CMO immediately.",
                  "2. Dispatch Rapid Response Team within 6 hours.",
                  "3. Initiate contact tracing for all confirmed cases.",
                  "4. Submit situation report to State Health Secretary within 24h."]:
            story.append(Paragraph(a, s["blt"]))
        self._footer(story, s)
        doc.build(story)
        return buf.getvalue()

    # ── List recent ───────────────────────────────────────────────────────────
    def list_recent(self):
        now = datetime.now()
        rows = [
            ("Regional Brief","Maharashtra","Dengue",1),
            ("National Summary","All India","Multi",6),
            ("Regional Brief","Delhi","Malaria",12),
            ("Alert Brief","Karnataka","Cholera",18),
            ("Regional Brief","Tamil Nadu","Influenza",24),
            ("National Summary","All India","Multi",30),
            ("Regional Brief","Kerala","Dengue",36),
            ("Alert Brief","Maharashtra","Dengue",42),
            ("Regional Brief","Delhi","Influenza",48),
            ("Regional Brief","Karnataka","Malaria",54),
        ]
        return [{"id":f"RPT-{1000+i}","type":t,"region":r,"disease":d,
                 "generated_at":(now-timedelta(hours=h)).strftime("%Y-%m-%d %H:%M"),
                 "size_kb":random.randint(80,350)}
                for i,(t,r,d,h) in enumerate(rows)]
