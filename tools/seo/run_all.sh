#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "=== SEO: regenerate all ==="
python3 tools/seo/generate_sitemap.py
python3 tools/seo/inject_canonical_og.py
python3 tools/seo/inject_schema.py
python3 tools/seo/update_titles.py
python3 tools/seo/fix_alt_tags.py
echo "=== Done ==="
