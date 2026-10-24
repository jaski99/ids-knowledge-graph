#!/bin/sh
# Copia la fonte unica graph/graph.json nella web app (web/graph.json, ignorato da git).
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cp "$ROOT/graph/graph.json" "$ROOT/web/graph.json"
echo "copiato graph/graph.json -> web/graph.json"
