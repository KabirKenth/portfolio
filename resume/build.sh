#!/bin/sh
# Rebuilds Kabir-Kenth-Resume.pdf.
# The first run creates a private Python environment (.venv in the repo root)
# and installs reportlab into it. After that it just builds.
#
# Run from anywhere:  sh resume/build.sh
set -e
cd "$(dirname "$0")/.."

if [ ! -x .venv/bin/python ]; then
  echo "First run: setting up .venv with reportlab (one time only)..."
  python3 -m venv .venv
  .venv/bin/python -m pip install --quiet --upgrade pip
  .venv/bin/python -m pip install --quiet reportlab
fi

.venv/bin/python resume/build.py
