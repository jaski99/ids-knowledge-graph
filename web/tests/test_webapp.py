"""Smoke test della web app: file, riferimenti, build, server statico e unit test JS."""
import re, shutil, subprocess, threading, urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import pytest

WEB = Path(__file__).resolve().parent.parent
ROOT = WEB.parent


def test_index_riferisce_moduli_esistenti():
    html = (WEB / "index.html").read_text(encoding="utf-8")
    assert '<html lang="it">' in html
    for src in re.findall(r'(?:src|href)="((?:js|css)/[^"]+)"', html):
        assert (WEB / src).is_file(), src


def test_import_relativi_esistono():
    for js in (WEB / "js").rglob("*.js"):
        for imp in re.findall(r"from '(\.[^']+)'", js.read_text(encoding="utf-8")):
            assert (js.parent / imp).resolve().is_file(), f"{js.name}: {imp}"


def test_build_copia_graph():
    subprocess.run(["sh", str(WEB / "build.sh")], check=True, capture_output=True)
    assert (WEB / "graph.json").read_bytes() == (ROOT / "graph" / "graph.json").read_bytes()


@pytest.mark.skipif(shutil.which("node") is None, reason="node non installato")
def test_unit_js():
    r = subprocess.run(["node", "--test", "tests/"], cwd=WEB, capture_output=True, text=True)
    assert r.returncode == 0, r.stdout[-2000:] + r.stderr[-2000:]


def test_http_server_serve_app():
    subprocess.run(["sh", str(WEB / "build.sh")], check=True, capture_output=True)
    srv = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(WEB)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}/"
    try:
        for path in ["", "graph.json", "js/main.js", "css/style.css"]:
            with urllib.request.urlopen(base + path, timeout=5) as r:
                assert r.status == 200, path
    finally:
        srv.shutdown()
