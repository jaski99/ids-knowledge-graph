#!/usr/bin/env python3
"""Controllo online delle risorse (HEAD, fallback GET). Non fa parte dei test offline.
Uscita 1 se almeno un URL risponde 404/410 o non e' raggiungibile."""
import sys, urllib.request, urllib.error
from kg import load_graph

UA = {"User-Agent": "Mozilla/5.0 (ids-kg url checker)"}

def status(url):
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, method=method, headers=UA)
            with urllib.request.urlopen(req, timeout=15) as r:
                return r.status
        except urllib.error.HTTPError as e:
            if method == "HEAD" and e.code in (403, 405, 501):
                continue
            return e.code
        except Exception as e:
            if method == "GET":
                return f"ERR {type(e).__name__}"
    return "ERR"

def main():
    urls = {}
    for n in load_graph()["nodi"]:
        for r in n["risorse"]:
            urls.setdefault(r["url"], []).append(n["id"])
    bad = 0
    for u, ids in sorted(urls.items()):
        s = status(u)
        ok = isinstance(s, int) and s < 400
        bad += not ok
        print(f"{'OK ' if ok else 'BAD'} {s} {u} <- {', '.join(ids)}")
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
