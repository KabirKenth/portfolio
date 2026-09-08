from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Flowable, KeepTogether)
from reportlab.lib.colors import HexColor, black

INK   = HexColor("#111111")
MUTED = HexColor("#4a4a4a")
RULE  = HexColor("#999999")

NAME = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=18, leading=20, textColor=INK, spaceAfter=2)
CONTACT = ParagraphStyle("contact", fontName="Helvetica", fontSize=8.3, leading=10.2, textColor=MUTED, spaceAfter=0)
SECTION = ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=9.0, leading=10.4, textColor=INK, spaceBefore=4.5, spaceAfter=0.5)
SUMMARY = ParagraphStyle("summary", fontName="Helvetica", fontSize=8.7, leading=10.6, textColor=INK, spaceAfter=0)
ROLE = ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=9.2, leading=10.8, textColor=INK, spaceBefore=3.5, spaceAfter=0)
ORG = ParagraphStyle("org", fontName="Helvetica-Oblique", fontSize=8.3, leading=9.8, textColor=MUTED, spaceAfter=1.2)
BULLET = ParagraphStyle("bullet", fontName="Helvetica", fontSize=8.7, leading=10.2, textColor=INK, leftIndent=10, bulletIndent=1, spaceAfter=1.0)
SKILL = ParagraphStyle("skill", fontName="Helvetica", fontSize=8.7, leading=10.4, textColor=INK, leftIndent=0, spaceAfter=0.6)


class Rule(Flowable):
    def __init__(self, width=None, thickness=0.6, color=RULE, space_before=1.5, space_after=3):
        Flowable.__init__(self)
        self.width_ = width; self.thickness = thickness; self.color = color
        self.sb = space_before; self.sa = space_after
    def wrap(self, aw, ah):
        self.w = self.width_ or aw
        return (self.w, self.thickness + self.sb + self.sa)
    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        y = self.sa
        self.canv.line(0, y, self.w, y)


def section(title):
    return [Paragraph(title.upper(), SECTION), Rule()]


def role(title, meta):
    return [Paragraph(title, ROLE), Paragraph(meta, ORG)]


def b(text):
    return Paragraph(text, BULLET, bulletText="•")


story = []

# ---- header ----
story.append(Paragraph("KABIR KENTH", NAME))
story.append(Paragraph(
    "Brampton, ON &nbsp;&bull;&nbsp; kabirkenth@outlook.com &nbsp;&bull;&nbsp; (647) 970-8110", CONTACT))
story.append(Paragraph(
    "kabirkenth.me &nbsp;&bull;&nbsp; linkedin.com/in/kabirkenth &nbsp;&bull;&nbsp; github.com/KabirKenth", CONTACT))
story.append(Rule(thickness=1.1, color=INK, space_before=3, space_after=4))

# ---- summary ----
story.append(Paragraph(
    "Software engineer, McMaster B.Eng. (Nov 2025). Three systems shipped end to end: a live "
    "multi-user LLM platform with a mandatory human approval gate, a rerun-safe daily Airflow/BigQuery "
    "pipeline, and a two-sided logistics platform. A decade of bookkeeping, operations and dispatch work "
    "behind them &mdash; I automate manual process because I have done it by hand.",
    SUMMARY))

# ---- experience ----
story += section("Experience")

story += role("Software Engineer Intern &nbsp;&mdash;&nbsp; Bulk Buys",
              "Brampton, ON &nbsp;&bull;&nbsp; Jan 2023 &ndash; Apr 2023 &nbsp;&bull;&nbsp; e-commerce SMB")
story.append(b("Eliminated a recurring manual data re-entry task worth <b>$6,000+ annually</b> by building a "
               "Python integration that synchronised Amazon repricing data into Zoho One"))
story.append(b("Cut environment setup time and eliminated machine-specific failures by containerising the "
               "team's Python services in Docker, making deployments reproducible across the team"))

story += role("Dispatch &amp; Data Entry Clerk &nbsp;&mdash;&nbsp; Fortel Express",
              "Ontario &nbsp;&bull;&nbsp; Summer 2022")
story.append(b("Keyed and reconciled freight documentation &mdash; bills of lading, dispatch records and driver "
               "logs &mdash; across operational systems that shared no common load identifier"))
story.append(b("Resolved discrepancies between dispatch, driver and billing records where one mis-keyed load "
               "number could delay an invoice for weeks &mdash; the reconciliation problem I later built "
               "FreightSwipe to remove"))

story += role("Bookkeeper &amp; Office Administrator &nbsp;&mdash;&nbsp; 2512484 Ontario Inc.",
              "Brampton, ON &nbsp;&bull;&nbsp; Sep 2014 &ndash; Mar 2020 &nbsp;&bull;&nbsp; family business")
story.append(b("Maintained and reconciled financial records for the family business across five and a half years, "
               "run alongside full-time engineering study"))
story.append(b("Provided technical support to clients and owned the customer relationships end to end"))

story += role("Operations Manager &nbsp;&mdash;&nbsp; Benchmark Sports: Strength &amp; Conditioning",
              "Brampton, ON &nbsp;&bull;&nbsp; Jun &ndash; Aug 2019 &nbsp;&bull;&nbsp; contract")
story.append(b("Built projection-based growth models in Excel for business forecasting, prepared financial "
               "statements and reports, and performed daily cash reconciliations"))

story += section("Earlier")
story.append(Paragraph(
    "<b>Retail Operations</b> &mdash; Costco Wholesale, Ontario (Summer 2021) &nbsp;&bull;&nbsp; "
    "<b>Assembly Line Worker</b> &mdash; FCA Fiat Chrysler Automobiles, Brampton, ON (Jun &ndash; Jul 2016)", SKILL))

# ---- projects ----
story += section("Projects")

story += role("ApplyTron &nbsp;&mdash;&nbsp; LLM Job Application Platform",
              "Live at app.kabirkenth.me &nbsp;&bull;&nbsp; 2026 &nbsp;&bull;&nbsp; "
              "Next.js, TypeScript, Supabase, Claude API, Playwright, Railway, Docker")
story.append(b("Shipped a live multi-user authenticated platform that ingests job listings, scores each against "
               "a parsed resume with the Claude API, and generates tailored ATS-safe PDFs via react-pdf"))
story.append(b("Enforced a mandatory human approval gate so no document is ever submitted unreviewed, "
               "implemented as a guarded state machine with row-level security in PostgreSQL"))
story.append(b("Automated form submission with a Playwright worker on Railway that captures a screenshot for "
               "review before every submit"))

story += role("Market Sentiment Pipeline &nbsp;&mdash;&nbsp; Daily ELT and Signal",
              "2026 &nbsp;&bull;&nbsp; Python, Apache Airflow, BigQuery, Gemini, Docker, Looker Studio")
story.append(b("Orchestrated a daily containerised ELT pipeline in Airflow ingesting market data and "
               "financial news for S&amp;P 500 equities"))
story.append(b("Eliminated duplicate records across retries and backfills by designing idempotent BigQuery "
               "loads keyed on a natural (ticker, date) merge rather than append"))
story.append(b("Converted unstructured news into sentiment scores with Gemini feeding a Random Forest model, storing "
               "predictions beside outcomes so accuracy is tracked in Looker Studio"))

story += role("FreightSwipe &nbsp;&mdash;&nbsp; Two-Sided Logistics Matching Platform",
              "2025 &nbsp;&bull;&nbsp; React, Node.js, Express, PostgreSQL, Prisma, JWT, Docker")
story.append(b("Designed a single authoritative load record shared by carrier and shipper, removing the "
               "two-copy reconciliation problem I handled manually in freight dispatch"))
story.append(b("Built role-based dashboards and a swipe-deck matching interface over a JWT-authenticated REST API"))

# ---- education ----
story += section("Education")
story += role("B.Eng., Software Engineering &amp; Management &nbsp;&mdash;&nbsp; McMaster University",
              "Hamilton, ON &nbsp;&bull;&nbsp; Graduated Nov 2025 &nbsp;&bull;&nbsp; Algorithms, Data Structures, Cloud Computing, Database Systems")
story.append(b("Capstone: Teamfill &mdash; React and Firebase platform matching athletes to pickup teams, delivered "
               "by a team under Scrum"))

# ---- skills ----
story += section("Technical Skills")
for k, v in [
    ("Languages &amp; Data", "Python, TypeScript, JavaScript (ES6+), SQL, PostgreSQL, BigQuery"),
    ("Backend &amp; Pipelines", "Node.js, Express, Prisma, Apache Airflow, ETL/ELT, REST APIs, JWT auth, idempotent loads"),
    ("Cloud, Frontend &amp; Practice", "GCP, Docker, Vercel, Railway, Supabase, Firebase, React, Next.js, "
                                       "CI/CD, Agile (Scrum)"),
]:
    story.append(Paragraph(f"<b>{k}:</b> {v}", SKILL))


doc = BaseDocTemplate("/tmp/resume/Kabir-Kenth-Resume.pdf", pagesize=LETTER,
                      leftMargin=0.52*inch, rightMargin=0.52*inch,
                      topMargin=0.38*inch, bottomMargin=0.26*inch,
                      title="Kabir Kenth - Resume", author="Kabir Kenth",
                      subject="Software Engineer")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f", showBoundary=0)
doc.addPageTemplates([PageTemplate(id="p", frames=[frame])])
doc.build(story)
print("built")
