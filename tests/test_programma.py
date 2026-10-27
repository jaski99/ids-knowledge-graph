"""Contratto X1: fonti, programma, frequenze e priorità della base.

I part suffissati di X2/X3 possono contenere nodi non ancora mappati:
la copertura obbligatoria qui riguarda soltanto i part base area-N.json.
"""
from collections import Counter

import pytest

from kg import ROOT, load_graph, load_parts


GRAPH = load_graph()
PROGRAMMA = GRAPH["programma"]
VOCI = PROGRAMMA["voci"]
FREQUENZE = PROGRAMMA["frequenze"]
NODI = {n["id"]: n for n in GRAPH["nodi"]}
ASSEGNAZIONI = [(voce, item) for voce in VOCI for item in voce["nodi"]]
PER_ID = {item["id"]: item for _, item in ASSEGNAZIONI}


PRIORITA = [
    ("alta", "classi-equivalenza boundary-value-analysis esercizio-black-box-scaglioni grafo-flusso-controllo criteri-copertura esercizio-white-box-copertura black-box-vs-white-box"),
    ("alta", "uml-diagramma-classi uml-associazioni-molteplicita esercizio-class-diagram-da-testo esercizio-diagrammi-coerenti"),
    ("alta", "design-pattern-decorator design-pattern-template-method design-pattern-observer design-pattern-simple-factory design-pattern-strategy riconoscere-pattern-scenario esercizio-pattern-motivato-java"),
    ("alta", "uml-diagramma-sequenza uml-diagramma-attivita uml-diagramma-stati uml-casi-uso esercizio-use-case-da-testo"),
    ("alta", "debugging requisiti-processo-specifica esercizio-domanda-processo-requisiti requisiti-costo-errori-boehm clean-architecture-coesione-componenti ottimizzazione-codice refactoring domanda-refactoring"),
    ("alta", "design-pattern-composite"),
    ("media", "design-pattern-factory-method design-pattern-abstract-factory"),
    ("media", "metriche-software metrica-complessita-ciclomatica esercizio-domanda-metriche principi-solid"),
    ("media", "llm-agenti-ciclo-vita rischi-codice-generato verifica-umana-codice-ai assistenti-ai-sviluppo domanda-ids-ai-native"),
]


def test_syllabus_distingue_fonti_e_limiti():
    syllabus = (ROOT / "docs" / "SYLLABUS.md").read_text(encoding="utf-8")
    for testo in ("INF-36", "2026/27", "81 ore", "27 di laboratorio", "titolare", "Federica Rollo", "tesina", "package", "140%", "incoerent", "FATTO", "DATO DELL'UTENTE", "NON TROVATO", "[S1]", "[S2]", "[S6]", "[D1]", "[da verificare]"):
        assert testo.lower() in syllabus.lower(), testo
    assert "fonte terza" in syllabus.lower()
    assert "sintesi dell'utente" in syllabus.lower()
    assert "3ª edizione" in syllabus and "5ª ed. 2022" in syllabus


def test_formati_esame_restano_versioni_distinte():
    registro = (ROOT / "docs" / "EXAM_FORMAT.md").read_text(encoding="utf-8")
    for testo in ("5/11/2025", "Fac-simile 2016/17", "13/01/2017", "2017–2025",
                  "Scheda 2026/27", "[S1]", "[S6]", "[D1]", "140%",
                  "incoerenti", "tesina separata", "[da verificare]"):
        assert testo.lower() in registro.lower(), testo
    assert "non sono un unico formato" in registro
    assert "non calcolare un voto" in registro


def test_metadata_corso_e_fonti_separate():
    corso = GRAPH["corso"]
    assert isinstance(corso["docente"], str)  # la web app lo visualizza come testo
    assert "Francesco Guerra (titolare)" in corso["docente"]
    assert "Federica Rollo (docente)" in corso["docente"]
    assert corso["fonte_programma"] == "https://unimore.coursecatalogue.cineca.it/corsi/2024/10296/insegnamenti/2026/27351/2022/10001?schemaid=22867"
    assert "[S2]" in corso["nota"]
    for label in ("[S1]", "[S2]", "[S6]", "[D1]", "140%", "incoerenti", "tesina"):
        assert label in GRAPH["nota_esame"]
    assert all("sintesi dell'utente" in t["fonte"] for t in GRAPH["trappole"])


def test_voci_e_cfu_ufficiali():
    attese = {
        1: ("Specifica dei requisiti", 2.5),
        2: ("Progettazione", 3.5),
        3: ("Implementazione e testing", 1.5),
        4: ("Distribuzione e manutenzione", 0.5),
        5: ("Ingegneria del software AI-native", 1.0),
    }
    assert len(VOCI) == len(attese)
    assert {v["area"]: (v["voce"], v["cfu"]) for v in VOCI} == attese
    assert sum(v["cfu"] for v in VOCI) == 9
    assert PROGRAMMA["fonte"] == "[S1]"
    assert "sintesi dell'utente" in PROGRAMMA["fonte_frequenze"]
    assert "[D1]" in PROGRAMMA["fonte_frequenze"]


def test_mappatura_base_completa_senza_id_inesistenti_o_duplicati():
    parts = load_parts()
    base = {n["id"] for area in range(1, 6) for n in parts[f"area-{area}.json"]}
    id_mappati = [item["id"] for _, item in ASSEGNAZIONI]
    assert base <= set(id_mappati)  # i part suffissati sono mappati dall'integrazione
    assert not (set(id_mappati) - set(NODI))
    assert not [nid for nid, count in Counter(id_mappati).items() if count > 1]
    for voce, item in ASSEGNAZIONI:
        assert NODI[item["id"]]["area"] == voce["area"]
        assert set(item["parti_esame"]) <= {"Design", "Testing", "Teoria", "Tesina"}
        assert len(item["parti_esame"]) == len(set(item["parti_esame"]))
        assert set(item["frequenze"]) <= FREQUENZE.keys()
        assert len(item["frequenze"]) == len(set(item["frequenze"]))


def test_frequenze_del_piano_con_provenienza_e_senza_generalizzazioni():
    attese = {
        "testing-black-box": 13, "pattern-decorator": 6, "pattern-template-method": 4,
        "pattern-factory": 2, "pattern-observer": 1, "pattern-strategy": 1,
        "pattern-builder": 1, "teoria-requisiti": 6, "teoria-white-box": 4,
        "teoria-mcdc": 1, "teoria-debugging": 3, "teoria-clean-architecture": 3,
        "teoria-coesione": 1, "teoria-refactoring": 2, "teoria-observer-java": 2,
        "teoria-post-vendita": 2, "teoria-simple-factory": 1, "teoria-ottimizzazione": 1,
        "teoria-commenti": 1, "teoria-analisi-statica": 1, "teoria-solid": 1,
        "teoria-metriche": 1, "teoria-ids": 1, "teoria-implementazione": 1,
        "teoria-black-white": 1,
    }
    for chiave, numero in attese.items():
        assert FREQUENZE[chiave]["prove"] == numero
        assert FREQUENZE[chiave]["totale"] == 13
    for chiave in ("diagramma-classi", "diagramma-casi-uso"):
        assert FREQUENZE[chiave]["qualitativa"] == "sempre"
        assert "prove" not in FREQUENZE[chiave]
    for chiave in ("diagramma-sequenza", "diagramma-attivita", "diagramma-stati"):
        assert FREQUENZE[chiave]["qualitativa"] == "quasi sempre"
        assert "prove" not in FREQUENZE[chiave]
    assert PER_ID["classi-equivalenza"]["frequenze"] == ["testing-black-box"]
    assert "testing-black-box" not in PER_ID["grafo-flusso-controllo"]["frequenze"]
    assert not PER_ID["design-pattern-factory-method"]["frequenze"]
    assert not PER_ID["design-pattern-abstract-factory"]["frequenze"]
    assert all(not item["frequenze"] for voce, item in ASSEGNAZIONI if voce["area"] == 5)


@pytest.mark.parametrize("livello, ids", PRIORITA)
def test_priorita_del_piano(livello, ids):
    for nid in ids.split():
        priorita = NODI[nid]["priorita"]
        assert priorita["livello"] == livello, nid
        assert "[S1]" in priorita["motivazione"] and "[S2]" in priorita["motivazione"], nid
        fonte_storica = "[S6]" if nid == "design-pattern-composite" else "[D1]"
        assert fonte_storica in priorita["motivazione"], nid
        if nid != "design-pattern-composite":
            assert "sintesi dell'utente" in priorita["motivazione"], nid
