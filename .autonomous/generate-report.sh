#!/bin/bash
# generate-report.sh — render an autonomous-task notes.md to a rich HTML report.
#
# Usage:
#   ./generate-report.sh <notes.md> <output.html> [<title>]
#
# Output: standalone HTML with embedded CSS — color-coded severity badges
# (BLOCKER red / MAJOR orange / MINOR gray), TOC navigation, syntax-
# highlighted code blocks. Designed for operator-facing audit review of
# autonomous-task skill (Advice-ai/claude-skills v5+) runs.
#
# Requires: pandoc (brew install pandoc)
set -euo pipefail

NOTES_MD="${1:?Usage: generate-report.sh <notes.md> <output.html> [<title>]}"
OUTPUT_HTML="${2:?Usage: generate-report.sh <notes.md> <output.html> [<title>]}"
TITLE="${3:-Autonomous task — $(basename "$(dirname "$NOTES_MD")")}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$(dirname "$OUTPUT_HTML")"

pandoc "$NOTES_MD" \
   --standalone \
   --toc \
   --toc-depth=3 \
   --metadata title="$TITLE" \
   --include-in-header="$SCRIPT_DIR/report-style.html" \
   --output "$OUTPUT_HTML"

echo "Generated: $OUTPUT_HTML"
