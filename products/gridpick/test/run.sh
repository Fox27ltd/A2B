#!/usr/bin/env bash
# Runs the detection suite in real Chromium. No dependencies, no test framework.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHROME="${CHROME:-$(command -v chromium || command -v chromium-browser || command -v google-chrome || echo /opt/pw-browsers/chromium-1194/chrome-linux/chrome)}"
OUT=$("$CHROME" --headless --no-sandbox --disable-gpu --virtual-time-budget=4000 \
  --dump-dom "file://$DIR/fixtures.html" 2>/dev/null \
  | sed -n '/<pre id="out">/,/<\/pre>/p' | sed 's/<[^>]*>//g')
echo "$OUT"
echo "$OUT" | grep -q "ALL ASSERTIONS PASSED" || { echo "SUITE FAILED"; exit 1; }
