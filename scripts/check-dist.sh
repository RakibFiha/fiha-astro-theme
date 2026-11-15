#!/usr/bin/env bash
# Sanity-check the built site in dist/ (used by the Site build workflow and `npm run verify`).
# Run from the site's root (its scripts/check-dist.sh wrapper does this).
set -euo pipefail

[ -d dist ] || { echo "dist/ not found. Run 'npm run build' first." >&2; exit 1; }

cv_name() { sed -n 's#^  cvPdf: */\{0,1\}\([^ ]*\.pdf\) *$#\1#p' "content/$1.yaml" | head -1; }
cv_en="$(cv_name en)"; cv_ja="$(cv_name ja)"
[ -n "$cv_en" ] && [ -n "$cv_ja" ] || { echo "No 'cvPdf: /<name>.pdf' in content/en.yaml or ja.yaml" >&2; exit 1; }

missing=0
for f in index.html ja/index.html projects/index.html ja/projects/index.html 404.html "$cv_en" "$cv_ja" _redirects _headers; do
  [ -f "dist/$f" ] || { echo "Missing dist/$f" >&2; missing=1; }
done
[ "$missing" -eq 0 ] || exit 1

leaked="$(find dist \( -name '*.yaml' -o -name 'package.json' -o -name '*.astro' \) -print)"
if [ -n "$leaked" ]; then
  echo "Source files leaked into dist/:" >&2; echo "$leaked" >&2; exit 1
fi

echo "dist/ looks good: $(find dist -type f | wc -l | tr -d ' ') files"
