"""Contratti per i sei nodi X2 del round 2."""
import json
import re
from pathlib import Path

from jsonschema import Draft202012Validator

from kg import load_graph, load_schema

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "uml-diagramma-package": (2, "abilita", "media", {
        "uml-diagramma-classi": "hard",
        "decomposizione-funzionale": "soft",
        "coesione-accoppiamento": "soft",
    }),
    "esercizio-tesina-individuale": (2, "tipo_esercizio", "alta", {
        "requisiti-processo-specifica": "hard",
        "esercizio-class-diagram-da-testo": "hard",
        "esercizio-pattern-motivato-java": "hard",
        "uml-diagramma-package": "soft",
        "uml-diagramma-sequenza": "soft",
        "uml-diagramma-attivita": "soft",
    }),
    "clean-architecture-accoppiamento-componenti": (2, "concetto", "media", {
        "clean-architecture-coesione-componenti": "hard",
        "coesione-accoppiamento": "soft",
        "metriche-software": "soft",
    }),
    "design-pattern-builder": (2, "abilita", "bassa", {
        "design-pattern-introduzione": "hard",
        "design-pattern-simple-factory": "soft",
        "design-pattern-decorator": "soft",
    }),
    "commenti-codice": (3, "concetto", "media", {
        "buone-pratiche-programmazione": "hard",
        "refactoring": "soft",
    }),
    "analisi-statica": (3, "concetto", "bassa", {
        "ispezione-codice": "hard",
        "code-smell": "soft",
        "metrica-complessita-ciclomatica": "soft",
    }),
}
MERMAID_START = re.compile(
    r"^(flowchart|graph|classDiagram|sequenceDiagram|stateDiagram(-v2)?|erDiagram|gantt|pie|timeline|mindmap|gitGraph|journey|quadrantChart)\b"
)
SCORE = re.compile(r"\b\d+\s*(?:pt\b|punti\b)|\b(?:punti|punteggio)\s*[:=]\s*\d+", re.I)


def _nodes():
    return {n["id"]: n for n in load_graph()["nodi"] if n["id"] in EXPECTED}


def _lesson_text(node):
    return json.dumps(node, ensure_ascii=False)


def test_sei_nodi_r2_presenti_con_metadati_e_prerequisiti_esatti():
    all_nodes = load_graph()["nodi"]
    all_ids = [n["id"] for n in all_nodes]
    assert len(all_ids) == len(set(all_ids))
    nodes = {n["id"]: n for n in all_nodes if n["id"] in EXPECTED}
    assert set(nodes) == set(EXPECTED)
    graph_ids = set(all_ids)
    new_ids = set(EXPECTED)
    for node_id, (area, tipo, priorita, prereq) in EXPECTED.items():
        node = nodes[node_id]
        assert (node["area"], node["tipo"], node["priorita"]["livello"]) == (area, tipo, priorita)
        actual = {p["id"]: p["forza"] for p in node["prerequisiti"]}
        assert actual == prereq
        # The table explicitly gives the tesina a soft edge to the package node,
        # which is another X2 node in this branch; all other prerequisites are
        # existing main nodes.
        branch_local = {"uml-diagramma-package"} if node_id == "esercizio-tesina-individuale" else set()
        assert set(actual) <= (graph_ids - new_ids) | branch_local
        assert all(p["motivo"].strip() for p in node["prerequisiti"])


def test_schema_e_lezione_v3_complete_per_i_nodi_r2():
    validator = Draft202012Validator(load_schema())
    nodes = _nodes()
    for node in nodes.values():
        errors = list(validator.iter_errors(node))
        assert not errors, (node["id"], [e.message for e in errors])
        lesson = node["lezione"]
        assert len(lesson["spiegazione"]) >= 1500
        assert len(lesson["esempi_svolti"]) >= 2
        assert len(lesson["errori_comuni"]) >= 2
        assert len(lesson["domande_autoverifica"]) >= 3
        assert len(lesson["riepilogo"].splitlines()) <= 5
        assert node["esercizi"]
        assert node["checklist_ripasso"]
        assert len(lesson["collegamenti_prior"]) >= 2
        for example in lesson["esempi_svolti"]:
            assert len(example["passi"]) >= 2
            assert all(re.match(r"\s*\d+[.)]\s+", step) for step in example["passi"])


def test_lezioni_r2_hanno_mermaid_sintatticamente_coerente():
    for node in _nodes().values():
        source = node["lezione"]["spiegazione"]
        assert source.count("```") % 2 == 0, node["id"]
        blocks = re.findall(r"^```(\w*)\n(.*?)^```", source, re.M | re.S)
        mermaid = [body.strip() for lang, body in blocks if lang == "mermaid"]
        assert mermaid, node["id"]
        for body in mermaid:
            lines = [line.strip() for line in body.splitlines() if line.strip()]
            assert lines and MERMAID_START.match(lines[0]), (node["id"], lines[:1])
            assert not re.search(r"\[\s*\d+\.\s", body), node["id"]
            assert not re.search(r"</?[A-Za-z]", body), node["id"]
            if lines[0].startswith(("flowchart", "graph")):
                assert sum(line.startswith("subgraph ") for line in lines) == sum(line == "end" for line in lines), node["id"]
                assert any("-->" in line or "-.->" in line for line in lines[1:]), node["id"]


def test_fonti_dati_e_accenti_richiesti():
    all_text = "\n".join(_lesson_text(n) for n in _nodes().values())
    assert "sintesi dell’utente" in all_text or "sintesi dell'utente" in all_text
    assert "[da verificare]" in all_text
    for word in ("è", "perché", "più", "già", "può"):
        assert word in all_text, f"accento mancante: {word}"


def test_nessun_punteggio_inventato_fuori_dal_piano():
    text = "\n".join(_lesson_text(n) for n in _nodes().values())
    assert not SCORE.search(text)


def test_risorse_r2_sono_url_documentati_e_marcati_verificati():
    for node in _nodes().values():
        assert node["risorse"]
        for resource in node["risorse"]:
            assert resource["verificato"] is True
            assert resource["url"].startswith("https://")
    assert any("coursecatalogue" in r["url"] for r in _nodes()["esercizio-tesina-individuale"]["risorse"])
