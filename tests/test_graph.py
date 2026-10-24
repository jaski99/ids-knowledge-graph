import copy
import pytest
from jsonschema import Draft202012Validator
import re
from kg import load_graph, load_schema, topo_order, build, dumps, load_parts, GRAPH

G = load_graph()
NODES = G["nodi"]
IDS = [n["id"] for n in NODES]


def test_schema_is_valid():
    Draft202012Validator.check_schema(load_schema())


@pytest.mark.parametrize("node", NODES, ids=IDS)
def test_node_matches_schema(node):
    errs = list(Draft202012Validator(load_schema()).iter_errors(node))
    assert not errs, [e.message for e in errs]


def test_areas_declared():
    assert {a["id"] for a in G["aree"]} == {1, 2, 3, 4, 5}


def test_ids_unique():
    assert len(IDS) == len(set(IDS))


def test_prerequisites_exist():
    s = set(IDS)
    missing = [(n["id"], p) for n in NODES for p in n["prerequisiti"] if p["id"] not in s]
    assert not missing


def test_no_self_loops():
    assert not [n["id"] for n in NODES if n["id"] in [p["id"] for p in n["prerequisiti"]]]


def test_no_cycles_and_topo_order():
    order = topo_order(NODES)
    assert sorted(order) == sorted(IDS)
    pos = {i: k for k, i in enumerate(order)}
    for n in NODES:
        for p in n["prerequisiti"]:
            assert pos[p["id"]] < pos[n["id"]]


def test_cycle_is_detected():
    nodes = copy.deepcopy(NODES[:2])
    nodes[0]["prerequisiti"] = [{"id": nodes[1]["id"], "forza": "soft", "motivo": "test ciclo"}]
    nodes[1]["prerequisiti"] = [{"id": nodes[0]["id"], "forza": "hard", "motivo": "test ciclo"}]
    with pytest.raises(ValueError):
        topo_order(nodes)


def test_every_node_has_resource():
    assert all(len(n["risorse"]) >= 1 for n in NODES)


def test_text_refs_point_to_declared_books():
    books = set(G["testi"])
    bad = [(n["id"], r["libro"]) for n in NODES for r in n["riferimenti_testo"] if r["libro"] not in books]
    assert not bad


def test_graph_json_is_up_to_date():
    assert GRAPH.read_text(encoding="utf-8") == dumps(build()), "esegui: python scripts/kg.py build"


def test_parts_naming_and_area():
    for name, nodes in load_parts().items():
        m = re.fullmatch(r"area-([1-5])\.json", name)
        assert m, f"nome part non valido: {name}"
        assert isinstance(nodes, list)
        assert all(n["area"] == int(m.group(1)) for n in nodes), name


def test_skill_nodes_have_worked_exercises():
    bad = [n["id"] for n in NODES if n["tipo"] in ("abilita", "tipo_esercizio") and not n["esercizi"]]
    assert not bad


def test_schema_rejects_skill_without_exercises():
    from jsonschema import Draft202012Validator
    node = copy.deepcopy(next(n for n in NODES if n["tipo"] == "abilita"))
    node["esercizi"] = []
    assert list(Draft202012Validator(load_schema()).iter_errors(node))
