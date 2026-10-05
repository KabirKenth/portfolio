#!/bin/sh
# Rebuilds Kabir-Kenth-Resume.pdf from job-hunt/resume/master_resume.json, the one source for the
# public resume and every tailored one. Expects the job-hunt repo next to this one.
# The first run creates a private Python environment (.venv in the repo root)
# and installs reportlab into it. After that it just builds.
#
# Run from anywhere:  sh resume/build.sh
set -e
cd "$(dirname "$0")/.."
RESUME=../job-hunt/resume
[ -f "$RESUME/master_resume.json" ] || { echo "No $RESUME/master_resume.json: clone job-hunt next to portfolio."; exit 1; }

if [ ! -x .venv/bin/python ]; then
  echo "First run: setting up .venv with reportlab (one time only)..."
  python3 -m venv .venv
  .venv/bin/python -m pip install --quiet --upgrade pip
  .venv/bin/python -m pip install --quiet reportlab
fi

.venv/bin/python "$RESUME/render.py" "$RESUME/master_resume.json" Kabir-Kenth-Resume.pdf
