#!/bin/sh
# Build the site and copy the static output to the repo root (served by GitHub Pages at barusik.com).
set -e
cd "$(dirname "$0")"
npm ci && npx next build
cd .. && find . -mindepth 1 -maxdepth 1 ! -name _src ! -name .git ! -name README.md -exec rm -rf {} + && cp -r _src/out/. . && rm -rf _src/out
echo "Built. Commit and push."
