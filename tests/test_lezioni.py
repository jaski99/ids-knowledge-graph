"""Schema v3: lezioni complete e regole di qualità (vedi docs/CONTRACTS.md, 'Lezioni')."""
import copy
import os
import re
import pytest
from jsonschema import Draft202012Validator
from kg import load_graph, load_schema

G = load_graph()
NODES = G["nodi"]
IDS = {n["id"] for n in NODES}
WITH = [n for n in NODES if "lezione" in n]
MERMAID_START = re.compile(r"^(flowchart|graph|classDiagram|sequenceDiagram|stateDiagram(-v2)?|erDiagram|gantt|pie|timeline|mindmap|gitGraph|journey|quadrantChart)\b")
BOOK_REFERRAL = re.compile(r"(vedi|consulta|leggi|rimando a(l)?|si veda)\s+(il\s+)?(libro|testo|manuale|capitolo|cap\.)", re.I)


def test_lezioni_complete():
    """Fallisce finché esistono nodi senza lezione. Disattivabile con KG_ALLOW_TODO=1."""
    todo = sorted(IDS - {n["id"] for n in WITH})
    if os.environ.get("KG_ALLOW_TODO") == "1":
        pytest.skip(f"KG_ALLOW_TODO=1: {len(todo)} lezioni TODO")
    assert not todo, f"{len(todo)} nodi senza lezione (TODO): {', '.join(todo)}"


def test_almeno_le_lezioni_pilota():
    assert {"esercizio-black-box-scaglioni", "design-pattern-observer"} <= {n["id"] for n in WITH}


def _blocks(md):
    return re.findall(r"^```(\w*)\n(.*?)^```", md, re.S | re.M)


@pytest.mark.parametrize("node", WITH, ids=[n["id"] for n in WITH])
def test_qualita_lezione(node):
    L = node["lezione"]
    md = L["spiegazione"]
    assert md.count("```") % 2 == 0, "blocchi di codice non chiusi"
    assert len(re.findall(r"^#{2,3} ", md, re.M)) >= 2, "servono almeno 2 sottotitoli (## o ###)"
    blocks = _blocks(md)
    assert any(lang in ("java", "mermaid") for lang, _ in blocks), "serve almeno un blocco ```java o ```mermaid"
    for lang, body in blocks:
        if lang == "mermaid":
            assert MERMAID_START.match(body.strip()), f"mermaid: tipo di diagramma non riconosciuto: {body[:30]!r}"
            assert not re.search(r'\["\s*\d+\.\s', body), 'mermaid: un\'etichetta che inizia con "1. " viene letta come lista markdown ("Unsupported markdown: list")'
    texts = [md, L["intuizione"], L["analogia"]] + [e["soluzione"] for e in L["esempi_svolti"]]
    assert not any(BOOK_REFERRAL.search(t) for t in texts), "nessun rinvio al libro per capire: la lezione deve essere autosufficiente"
    assert len([r for r in L["riepilogo"].splitlines() if r.strip()]) <= 5, "riepilogo: max 5 righe"
    for c in L["collegamenti_prior"]:
        if "nodo" in c:
            assert c["nodo"] in IDS, f"collegamento a nodo inesistente {c['nodo']}"
    if node["tipo"] in ("abilita", "tipo_esercizio"):
        assert len(L["esempi_svolti"]) >= 2
    assert len(L["domande_autoverifica"]) >= 3


def test_schema_richiede_due_esempi_per_abilita():
    node = copy.deepcopy(next(n for n in WITH if n["tipo"] in ("abilita", "tipo_esercizio")))
    node["lezione"]["esempi_svolti"] = node["lezione"]["esempi_svolti"][:1]
    assert list(Draft202012Validator(load_schema()).iter_errors(node))


def test_schema_richiede_tre_domande():
    node = copy.deepcopy(WITH[0])
    node["lezione"]["domande_autoverifica"] = node["lezione"]["domande_autoverifica"][:2]
    assert list(Draft202012Validator(load_schema()).iter_errors(node))


def test_file_lezioni_validi():
    from kg import load_parts, load_lessons
    ids = {n["id"] for part in load_parts().values() for n in part}
    inline = [n["id"] for part in load_parts().values() for n in part if "lezione" in n]
    assert not inline, f"lezioni inline nei part (spostale in graph/lezioni/<id>.json): {inline}"
    assert set(load_lessons()) <= ids, set(load_lessons()) - ids
