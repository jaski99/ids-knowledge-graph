#!/bin/sh
# Costruisce una web app statica: grafo generato e librerie locali da dipendenze bloccate.
set -eu
ROOT=$(CDPATH='' cd -- "$(dirname "$0")/.." && pwd)
WEB="$ROOT/web"
if [ ! -f "$WEB/node_modules/mermaid/dist/mermaid.min.js" ] || ! npm ls --prefix "$WEB" --depth=0 >/dev/null 2>&1; then
  npm ci --prefix "$WEB"
fi
rm -rf "$WEB/vendor"
mkdir -p "$WEB/vendor/licenses"
cp "$ROOT/graph/graph.json" "$WEB/graph.json"
cp "$WEB/node_modules/cytoscape/dist/cytoscape.min.js" "$WEB/vendor/cytoscape.min.js"
cp "$WEB/node_modules/dagre/dist/dagre.min.js" "$WEB/vendor/dagre.min.js"
cp "$WEB/node_modules/cytoscape-dagre/cytoscape-dagre.js" "$WEB/vendor/cytoscape-dagre.js"
cp "$WEB/node_modules/marked/marked.min.js" "$WEB/vendor/marked.min.js"
cp "$WEB/node_modules/dompurify/dist/purify.min.js" "$WEB/vendor/purify.min.js"
cp "$WEB/node_modules/@highlightjs/cdn-assets/highlight.min.js" "$WEB/vendor/highlight.min.js"
cp "$WEB/node_modules/@highlightjs/cdn-assets/styles/github.min.css" "$WEB/vendor/highlight-github.min.css"
cp "$WEB/node_modules/mermaid/dist/mermaid.min.js" "$WEB/vendor/mermaid.min.js"
cp "$WEB/node_modules/cytoscape/LICENSE" "$WEB/vendor/licenses/cytoscape.txt"
cp "$WEB/node_modules/dagre/LICENSE" "$WEB/vendor/licenses/dagre.txt"
cp "$WEB/node_modules/cytoscape-dagre/LICENSE" "$WEB/vendor/licenses/cytoscape-dagre.txt"
cp "$WEB/node_modules/marked/LICENSE.md" "$WEB/vendor/licenses/marked.txt"
cp "$WEB/node_modules/dompurify/LICENSE" "$WEB/vendor/licenses/dompurify.txt"
cp "$WEB/node_modules/dompurify/LICENSE-MPL" "$WEB/vendor/licenses/dompurify-mpl.txt"
cp "$WEB/node_modules/@highlightjs/cdn-assets/LICENSE" "$WEB/vendor/licenses/highlightjs.txt"
cp "$WEB/node_modules/mermaid/LICENSE" "$WEB/vendor/licenses/mermaid.txt"
node "$WEB/scripts/build-precache.js"
echo 'Costruiti graph.json e librerie locali in web/vendor/'
