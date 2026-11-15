#!/usr/bin/env bash
# Print the CV pages (generated from content/*.yaml by `astro build`) to PDF with headless Chrome:
#   dist/print/cv-en/  -> the file named by ui.cvPdf in content/en.yaml  (English)
#   dist/print/cv-ja/  -> the file named by ui.cvPdf in content/ja.yaml  (Japanese)
#
# Run from the site's root (its scripts/build-cv.sh wrapper does this), after `npm run build`.
# Output location:
#   default            cv-preview/  (git-ignored; for checking layout locally)
#   CV_OUT_DIR=public  the published files (used by CI and Docker)
#
# Chrome binary: $CHROME (defaults to Google Chrome on macOS). Extra flags: $CHROME_FLAGS.
set -euo pipefail

root="$PWD"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
out_dir="${CV_OUT_DIR:-$root/cv-preview}"
case "$out_dir" in /*) ;; *) out_dir="$root/$out_dir" ;; esac
mkdir -p "$out_dir"

# The PDF file name from `  cvPdf: /Name.pdf` in content/<lang>.yaml.
cv_name() {
  local name
  name="$(sed -n 's#^  cvPdf: */\{0,1\}\([^ ]*\.pdf\) *$#\1#p' "$root/content/$1.yaml" | head -1)"
  [ -n "$name" ] || { echo "No 'cvPdf: /<name>.pdf' under ui: in content/$1.yaml" >&2; exit 1; }
  echo "$name"
}

render() {
  local page="$1" out="$2" src="$root/dist/print/$1/index.html"
  [ -f "$src" ] || { echo "Missing $src. Run 'npm run build' first." >&2; exit 1; }
  # shellcheck disable=SC2086
  "$chrome" --headless=new --disable-gpu --no-pdf-header-footer ${CHROME_FLAGS:-} \
    --print-to-pdf="$out_dir/$out" "file://$src" 2>/dev/null
  echo "Wrote $out_dir/$out"
}

render cv-en "$(cv_name en)"
render cv-ja "$(cv_name ja)"

if [ "$out_dir" = "$root/cv-preview" ]; then
  echo "Local preview only (cv-preview/ is git-ignored). CI publishes the real PDFs to public/."
fi
