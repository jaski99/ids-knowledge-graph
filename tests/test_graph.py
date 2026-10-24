import copy
import pytest
from jsonschema import Draft202012Validator
from kg import load_graph, load_schema, topo_order

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
    missing = [(n["id"], p) for n in NODES for p in n["prerequisiti"] if p not in s]
    assert not missing


def test_no_self_loops():
    assert not [n["id"] for n in NODES if n["id"] in n["prerequisiti"]]


def test_no_cycles_and_topo_order():
    order = topo_order(NODES)
    assert sorted(order) == sorted(IDS)
    pos = {i: k for k, i in enumerate(order)}
    for n in NODES:
        for p in n["prerequisiti"]:
            assert pos[p] < pos[n["id"]]


def test_cycle_is_detected():
    nodes = copy.deepcopy(NODES[:2])
    nodes[0]["prerequisiti"] = [nodes[1]["id"]]
    nodes[1]["prerequisiti"] = [nodes[0]["id"]]
    with pytest.raises(ValueError):
        topo_order(nodes)


def test_every_node_has_resource():
    assert all(len(n["risorse"]) >= 1 for n in NODES)


def test_text_refs_point_to_declared_books():
    books = set(G["testi"])
    bad = [(n["id"], r["libro"]) for n in NODES for r in n["riferimenti_testo"] if r["libro"] not in books]
    assert not bad
