# Kabir Kenth — résumé source

The PDF is generated from `build.py`, not from this file. This is the readable copy.
Edit `build.py`, then run `python3 build.py` to regenerate `Kabir-Kenth-Resume.pdf`.

---

**KABIR KENTH**
Brampton, ON · kabirkenth@outlook.com · (647) 970-8110
kabirkenth.me · linkedin.com/in/kabirkenth · github.com/KabirKenth

Software engineer. B.Eng. Software Engineering, McMaster University, Nov 2025. Three systems
designed and shipped end to end: a live multi-user LLM platform with a mandatory human approval gate,
a daily Airflow/BigQuery pipeline built so a rerun cannot double-count, and a two-sided logistics
platform. I automate manual process because I have done it by hand.

## EXPERIENCE

**Software Engineer Intern — Bulk Buys** · Brampton, ON · Jan 2023 – Apr 2023 · e-commerce SMB
- Eliminated a recurring manual data re-entry task worth $6,000+ annually by building a Python integration that synchronised Amazon repricing data into Zoho One
- Cut environment setup time and eliminated machine-specific failures by containerising the team's Python services in Docker, making deployments reproducible across the team

**Dispatch & Data Entry Clerk — Fortel Express** · Ontario · Summer 2022
- Keyed and reconciled freight documentation — bills of lading, dispatch records and driver logs — across operational systems that shared no common load identifier
- Resolved discrepancies between dispatch, driver and billing records where one mis-keyed load number could delay an invoice for weeks — the reconciliation problem I later built FreightSwipe to remove

**Retail Operations — Costco Wholesale** · Ontario · Summer 2021
- Inventory replenishment and cycle counts against daily throughput targets on a high-volume floor where stock-record accuracy determined product availability

## PROJECTS

**ApplyTron — LLM Job Application Platform** · Live at app.kabirkenth.me · 2026
*Next.js, TypeScript, Supabase, Claude API, Playwright, Railway, Docker*
- Shipped a live multi-user authenticated platform that ingests job listings, scores each against a parsed resume with the Claude API, and generates tailored ATS-safe PDFs via react-pdf
- Enforced a mandatory human approval gate so no document is ever submitted unreviewed, implemented as a guarded state machine with row-level security in PostgreSQL
- Automated form submission with a Playwright worker on Railway that captures a screenshot for review before every submit

**Market Sentiment Pipeline — Daily ELT and Signal** · 2026
*Python, Apache Airflow, BigQuery, Gemini, Docker, Looker Studio*
- Orchestrated a daily containerised ELT pipeline in Airflow ingesting market data and financial news for S&P 500 equities
- Eliminated duplicate records across retries and backfills by designing idempotent BigQuery loads keyed on a natural (ticker, date) merge rather than append
- Converted unstructured news into quantified sentiment scores with Gemini feeding a Random Forest model, storing predictions alongside outcomes so accuracy is tracked in Looker Studio

**FreightSwipe — Two-Sided Logistics Matching Platform** · 2025
*React, Node.js, Express, PostgreSQL, Prisma, JWT, Docker*
- Designed a single authoritative load record shared by carrier and shipper, removing the two-copy reconciliation problem I handled manually in freight dispatch
- Built role-based dashboards and a swipe-deck matching interface over a JWT-authenticated REST API, with an explicit load state machine

## EDUCATION

**B.Eng., Software Engineering & Management — McMaster University**
Hamilton, ON · Graduated Nov 2025 · Algorithms, Data Structures, Cloud Computing, Database Systems
- Capstone: Teamfill — React and Firebase platform matching athletes to pickup teams, delivered by a team under Scrum

## TECHNICAL SKILLS

**Languages & Data:** Python, TypeScript, JavaScript (ES6+), SQL, PostgreSQL, BigQuery
**Backend & Pipelines:** Node.js, Express, Prisma, Apache Airflow, ETL/ELT, REST APIs, JWT auth, idempotent loads
**Cloud, Frontend & Practice:** GCP, Docker, Vercel, Railway, Supabase, Firebase, React, Next.js, CI/CD, Agile (Scrum)

---

## Removed from the previous version, and why

- **"About Me" summary** — "passionate about building robust, maintainable systems" applies to every engineer alive. Replaced with a specific claim about what was shipped.
- **Two in-progress certifications** — the feedback was blunt: incomplete credentials listed prominently read as insecurity. Add them back when they're finished.
- **"Participated in Agile ceremonies, authored technical documentation"** — attending standups is table stakes, not an achievement.
- **"In Development" on the job automator** — it's live at app.kabirkenth.me with working auth. It reads as shipped now, because it is.
- **Undated FreightSwipe** — now dated 2025.
