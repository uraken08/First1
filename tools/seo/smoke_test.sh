#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

PAGES=(
  "index.html"
  "studio/index.html"
  "school/index.html"
  "school/pm/index.html"
  "school/brows/index.html"
  "portfolio/index.html"
  "about/index.html"
  "contacts/index.html"
  "privacy/index.html"
)

errors=0

check() {
  local file="$1"
  local pattern="$2"
  local label="$3"
  if ! grep -q "$pattern" "$file"; then
    echo "  ✗ $file: missing $label"
    errors=$((errors + 1))
  fi
}

echo "=== sitemap.xml ==="
[[ -f sitemap.xml ]] && echo "  ✓ exists" || { echo "  ✗ missing"; errors=$((errors+1)); }

echo "=== robots.txt ==="
grep -q "Sitemap: https://agentpermanent.ru/sitemap.xml" robots.txt || { echo "  ✗ no Sitemap directive"; errors=$((errors+1)); }
echo "  ✓ Sitemap directive present"

echo ""
echo "=== Per-page checks ==="
for f in "${PAGES[@]}"; do
  echo "$f"
  check "$f" 'rel="canonical"'              "canonical"
  check "$f" 'property="og:title"'          "og:title"
  check "$f" 'property="og:description"'    "og:description"
  check "$f" 'property="og:image"'          "og:image"
  check "$f" 'name="twitter:card"'          "twitter:card"
  check "$f" 'application/ld+json'          "JSON-LD schema"
done

echo ""
echo "=== portfolio empty-alt ==="
empty=$(grep -c 'alt=""' portfolio/index.html || true)
if [[ "$empty" -gt 5 ]]; then
  echo "  ✗ portfolio: $empty empty alt tags (expected ≤ 5)"
  errors=$((errors + 1))
else
  echo "  ✓ portfolio: $empty empty alt tags"
fi

echo ""
if [[ "$errors" -eq 0 ]]; then
  echo "✅ All SEO smoke tests passed."
  exit 0
else
  echo "❌ $errors errors."
  exit 1
fi
