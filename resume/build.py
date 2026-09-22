"""Builds Kabir-Kenth-Resume.pdf into the repository root.

Design constraints, so they don't get lost:
  * One page. Letter. Single column, single frame, no tables, no images,
    no header/footer, so an ATS extracts the text in reading order.
  * Base-14 Helvetica only. Nothing embedded, nothing to fail to subset.
  * Plain "|" separators and plain hyphens in dates. Non-breaking spaces and
    bullet glyphs in the contact line are a known parser irritant.
  * Job title on its own line, then company / location / dates underneath.
    That is the shape resume parsers expect.

Build:  sh resume/build.sh      (or Cmd+Shift+B in VS Code)
The first run sets up a private Python environment (.venv) with reportlab.

Editing by hand
---------------
  * All the resume text is in the story below, top to bottom in the same
    order it appears on the page. Change the words inside the quotes.
  * Long text is split into several "..." pieces on consecutive lines.
    Python joins them, so keep the space at the end of each piece.
  * <b>bold</b> works anywhere. A plain & is fine (it gets escaped for you).
  * Bullet:            b("text")
    Job or project:    role("Title", "Company | Location | Dates")
    Earlier positions: one ("Title", "Company", "Year") row each in EARLIER
    Skills:            one ("Label", [items]) row each in SKILLS. A skills line
                       only ever wraps between items, never inside one.
  * Every build prints how much room is left on the page and warns you if
    the resume has spilled onto a second page.
  * resume/resume.md is only a readable copy. The PDF is built from this file.
"""

import re
from pathlib import Path

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Flowable
from reportlab.lib.colors import HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth

OUT = Path(__file__).resolve().parent.parent / "Kabir-Kenth-Resume.pdf"

INK = HexColor("#111111")
MUTED = HexColor("#4a4a4a")
RULE = HexColor("#999999")

PAGE_W, PAGE_H = LETTER
MARGIN_L = MARGIN_R = 0.52 * inch
MARGIN_T, MARGIN_B = 0.33 * inch, 0.21 * inch
TEXT_W = PAGE_W - MARGIN_L - MARGIN_R - 12  # the Frame adds 6pt padding on each side

NAME    = ParagraphStyle("name",    fontName="Helvetica-Bold",   fontSize=18.5, leading=20.5, textColor=INK,   spaceAfter=2)
CONTACT = ParagraphStyle("contact", fontName="Helvetica",        fontSize=8.6,  leading=10.6, textColor=MUTED, spaceAfter=0)
SECTION = ParagraphStyle("section", fontName="Helvetica-Bold",   fontSize=9.5,  leading=11.0, textColor=INK,   spaceBefore=5.5, spaceAfter=0.8)
SUMMARY = ParagraphStyle("summary", fontName="Helvetica",        fontSize=9.0,  leading=11.0, textColor=INK,   spaceAfter=0)
ROLE    = ParagraphStyle("role",    fontName="Helvetica-Bold",   fontSize=9.6,  leading=11.2, textColor=INK,   spaceBefore=4.4, spaceAfter=0)
ORG     = ParagraphStyle("org",     fontName="Helvetica-Oblique",fontSize=8.5,  leading=10.2, textColor=MUTED, spaceAfter=1.8)
BULLET  = ParagraphStyle("bullet",  fontName="Helvetica",        fontSize=9.0,  leading=10.7, textColor=INK,   leftIndent=10, bulletIndent=1, spaceAfter=1.5)
SKILL   = ParagraphStyle("skill",   fontName="Helvetica",        fontSize=9.0,  leading=10.9, textColor=INK,   spaceAfter=1.2)
ONELINE = ParagraphStyle("oneline", fontName="Helvetica",        fontSize=9.0,  leading=10.7, textColor=INK,   spaceAfter=0.3)


class Rule(Flowable):
    def __init__(self, thickness=0.6, color=RULE, space_before=1.5, space_after=2.5):
        Flowable.__init__(self)
        self.thickness, self.color, self.sb, self.sa = thickness, color, space_before, space_after

    def wrap(self, aw, ah):
        self.w = aw
        return (self.w, self.thickness + self.sb + self.sa)

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.sa, self.w, self.sa)


def section(title):
    return [Paragraph(title.upper(), SECTION), Rule()]


def amp(text):
    """Escape a bare & so "S&P" can be typed as-is. Existing &amp; etc. are left alone."""
    return re.sub(r"&(?!#?\w+;)", "&amp;", text)


def role(title, meta):
    return [Paragraph(amp(title), ROLE), Paragraph(amp(meta), ORG)]


def b(text):
    return Paragraph(amp(text), BULLET, bulletText="•")


def earlier(rows):
    """A small heading, then each earlier position on a line of its own."""
    out = [Paragraph("Earlier Experience", ROLE)]
    for title, *details in rows:
        out.append(Paragraph(" | ".join([f"<b>{amp(title)}</b>"] + [amp(d) for d in details]), ONELINE))
    return out


def skill_line(label, items):
    """'Label: a, b, c' that wraps only between items, never in the middle of one,
    and never leaves a single item stranded on the last line."""
    font, size = SKILL.fontName, SKILL.fontSize
    width = lambda t, f=font: stringWidth(t, f, size)
    avail = TEXT_W - 2  # a little slack so ReportLab never re-wraps a line we measured
    texts = [it + ("," if i < len(items) - 1 else "") for i, it in enumerate(items)]

    lines, cur, cur_w = [], [], width(label + ": ", "Helvetica-Bold")
    for t in texts:
        w = width(t) if not cur else width(" " + t)
        if cur and cur_w + w > avail:
            lines.append(cur)
            cur, cur_w = [t], width(t)
        else:
            cur.append(t)
            cur_w += w
    lines.append(cur)
    if len(lines) > 1 and len(lines[-1]) == 1 and len(lines[-2]) > 2:
        lines[-1].insert(0, lines[-2].pop())

    body = "<br/>".join(" ".join(amp(t) for t in line) for line in lines)
    return Paragraph(f"<b>{amp(label)}:</b> {body}", SKILL)


story = []

# ---------- header ----------
story.append(Paragraph("KABIR KENTH", NAME))
story.append(Paragraph("Brampton, ON | kabirkenth@outlook.com | (647) 970-8110", CONTACT))
story.append(Paragraph("kabirkenth.me | linkedin.com/in/kabirkenth | github.com/KabirKenth", CONTACT))
story.append(Rule(thickness=1.1, color=INK, space_before=3, space_after=3.5))

# ---------- summary ----------
story.append(Paragraph(
    "Software engineer, McMaster B.Eng. (Nov 2025). Three systems I built run in production: an LLM "
    "job-application platform, a weekday news-sentiment pipeline, and a two-sided freight marketplace. "
    "Years of bookkeeping and freight dispatch came first, which is why I build tools that take manual "
    "re-entry out of a process.",
    SUMMARY))

# ---------- experience ----------
story += section("Experience")

story += role("Software Engineer Intern",
              "Bulk Buys | Brampton, ON | Jan 2023 - Apr 2023 | e-commerce SMB")
story.append(b("Built a Python integration that synced Amazon repricing data into Zoho One, ending a manual "
               "re-entry task that had been costing roughly <b>$6,000 a year</b> in staff time."))
story.append(b("Containerised the team's Python services in Docker, which cut environment setup time and put a "
               "stop to the machine-specific failures we kept hitting."))

story += role("Dispatch and Data Entry Clerk",
              "Fortel Express | Ontario | Summer 2022")
story.append(b("Keyed and reconciled bills of lading, dispatch records and driver logs across systems that shared "
               "no common load identifier. One mis-keyed load number could hold an invoice for weeks. FreightSwipe "
               "came directly out of this job."))

story += role("Bookkeeper and Office Administrator",
              "2512484 Ontario Inc. | Brampton, ON | Sep 2014 - Mar 2020 | family business")
story.append(b("Kept the books and owned client relationships end to end for five and a half years, run alongside "
               "full-time engineering study."))

# One row per position: ("Title", "Company", "Year", optional note). Newest first.
EARLIER = [
    ("Retail Operations", "Costco Wholesale", "2021"),
    ("Operations Manager", "Benchmark Sports", "2019", "contract"),
    ("Assembly Line", "FCA Fiat Chrysler", "2016"),
]
story += earlier(EARLIER)

# ---------- projects ----------
story += section("Projects")

story += role("ApplyTron: LLM Job Application Platform",
              "Live at app.kabirkenth.me | 2026 | Next.js, TypeScript, Supabase, Claude API, Playwright, Vitest, Railway")
story.append(b("Ingests job listings, scores each one against a parsed resume with the Claude API, and generates a "
               "tailored ATS-safe PDF through react-pdf. Multi-user and authenticated."))
story.append(b("No document reaches an employer without a person approving it first. The gate is a guarded state "
               "machine sitting behind row-level security in Postgres."))
story.append(b("A Playwright worker on Railway fills and submits application forms, screenshotting each one for "
               "review before it submits. Vitest covers the security boundaries and the business rules."))

story += role("Market Sentiment Pipeline: News Sentiment and Graded Signals",
              "Live at market-sentiment-pipeline.vercel.app | 2026 | Python, PostgreSQL, Gemini, scikit-learn, Railway")
story.append(b("A weekday Railway cron job pulls prices and headlines for five stocks and scores the news with Gemini."))
story.append(b("Postgres upserts on natural keys skip unchanged rows, so a rerun changes 0 rows. Version one "
               "appended and double-counted."))
story.append(b("A Random Forest calls the next session, a SQL view grades each call against the next close, and a "
               "public dashboard shows the hit rate beside a naive baseline."))

story += role("FreightSwipe: Two-Sided Freight Matching Platform",
              "Live at freightswipe.vercel.app | 2025 - 2026 | React 19, Express, PostgreSQL, Prisma, Playwright, Vercel")
story.append(b("One load record that both sides read from, which removes the two-copy reconciliation I used to do by "
               "hand at Fortel. A load only reaches in-transit after the shipper and the trucker have each confirmed it."))
story.append(b("The React bundle and the Express API deploy as a single Vercel app so the auth cookie stays "
               "first-party: no SameSite=None, no CORS preflight, no second cold start."))
story.append(b("A read-only Playwright smoke suite signs in as each role and checks that all 16 routes actually "
               "render, not just return 200. It exits non-zero, so a blank page blocks the merge."))

# ---------- education ----------
story += section("Education")
story += role("B.Eng., Software Engineering and Management",
              "McMaster University | Hamilton, ON | Graduated Nov 2025 | Algorithms, Data Structures, Cloud Computing, Database Systems")
story.append(b("Capstone: Teamfill, a React and Firebase platform matching athletes to pickup teams, built by a team "
               "working in Scrum."))

# ---------- skills ----------
story += section("Technical Skills")
# One row per category: ("Label", [items]).
SKILLS = [
    ("Languages and Data", ["Python", "TypeScript", "JavaScript (ES6+)", "SQL", "PostgreSQL", "BigQuery",
                            "Prisma"]),
    ("Backend and Pipelines", ["Node.js", "Express", "REST APIs", "Apache Airflow", "ETL/ELT",
                               "JWT and httpOnly cookie auth", "bcrypt", "Joi validation", "rate limiting",
                               "idempotent loads"]),
    ("Cloud, Frontend and Testing", ["GCP", "Docker", "Vercel", "Railway", "Supabase", "Firebase", "React",
                                     "Next.js", "Playwright", "Vitest", "CI/CD", "Agile (Scrum)"]),
]
for label, items in SKILLS:
    story.append(skill_line(label, items))


doc = BaseDocTemplate(str(OUT), pagesize=LETTER,
                      leftMargin=MARGIN_L, rightMargin=MARGIN_R,
                      topMargin=MARGIN_T, bottomMargin=MARGIN_B,
                      title="Kabir Kenth - Resume", author="Kabir Kenth",
                      subject="Software Engineer")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f", showBoundary=0)
PAGES = []
doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=lambda c, d: PAGES.append(c.getPageNumber()))])
doc.build(story)

pages = len(PAGES)
spare = (frame._y - frame._y1p) / inch
print(f"built -> {OUT}")
if pages > 1:
    print(f"WARNING: the resume is now {pages} pages. Trim some text to get it back to one.")
else:
    print(f"1 page, {spare:.2f} in of space left at the bottom")
