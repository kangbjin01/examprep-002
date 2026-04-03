#!/bin/bash
# Extract text from SAT PDF and save to temp file for agent processing
# Usage: ./scripts/extract-sat-from-pdf.sh "/path/to/pdf"

PDF_PATH="$1"
if [ -z "$PDF_PATH" ]; then
  echo "Usage: $0 <pdf_path>"
  exit 1
fi

BASENAME=$(basename "$PDF_PATH" .pdf)
OUT_DIR="/tmp/sat-extract"
mkdir -p "$OUT_DIR"
OUT_FILE="$OUT_DIR/${BASENAME}.txt"

/opt/homebrew/bin/pdftotext "$PDF_PATH" "$OUT_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
  LINES=$(wc -l < "$OUT_FILE")
  echo "$OUT_FILE ($LINES lines)"
else
  echo "FAILED: $PDF_PATH"
  exit 1
fi
