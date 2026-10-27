"""Contratti per i nodi banca di X3 (docs/IMPROVEMENT_PLAN.md §3 e §4.1).

Fonti dati:
- gli esercizi si leggono dai nodi ``tipo_esercizio`` in ``graph/parts/area-*.json``;
- le lezioni v3 si leggono da ``graph/lezioni/banca-*.json``.

Verifiche:
- i 3 nodi banca esistono come tipo_esercizio (aree 3 / 2 / 3) con prerequisiti verso nodi main;
- le 13 firme di D1 §3 sono presenti nello stesso ordine e con la stessa firma;
- i valori limite di D1 §3 sono presenti nel testo/soluzione;
- le formule incerti (costoPulizia 151-500, costoconsegna 2001-5000) sono marcate '[da verificare]';
- i boundary derivati (computeCarSharingFee) sono marcati 'derivati';
- il formato tipo_esame segue §4.1 (prefisso 'Parte ...' + ' (<fonte>)');
- ogni blocco ```java nelle lezioni ha graffe bilanciate e una class/interface;
- nessun punteggio inventato fuori §1.2 del piano.
"""
import json
import re
from pathlib import Path

from kg import load_graph

ROOT = Path(__file__).resolve().parents[1]

PARTS = {}
for p in (ROOT / "graph" / "parts").glob("area-*-banche.json"):
    for nodo in json.loads(p.read_text(encoding="utf-8")):
        PARTS[nodo["id"]] = nodo

LEZIONI = {}
for p in (ROOT / "graph" / "lezioni").glob("banca-*.json"):
    d = json.loads(p.read_text(encoding="utf-8"))
    LEZIONI[d["id"] if "id" in d else p.stem] = d

BVA_ID = "banca-esercizi-bva-guerra"
PAT_ID = "banca-esercizi-pattern-guerra"
TEA_ID = "banca-domande-teoria-guerra"

# 13 firme di D1 §3, stesso ordine e stessa firma (senza tipo di ritorno)
FIRME_D1 = [
    "calcolaCostoSpedizione(int numero, int peso, int tariffa)",
    "calcolaCostoAccessi(int num, float sconto, float costo, int Quota_fissa)",
    "calcolaCostoSpedizione(int km, double peso, int tariffa)",
    "costoPulizia(int dimensione, float costo1, float costo2, float cf)",
    "costoconsegna(int distanza, float costo1, float costo2)",
    "stimaCostoPosa(int lunghezza, int materiale, int manodopera)",
    "calcolaManodopera(int livello_tecnico, float costo_orario, float durata)",
    "costoPiazzola(float costo, int area, int quota_fissa)",
    "calcolaCostoStampa(int numero, int tariffa1, int tariffa2)",
    "computeCarSharingFee(int driving_time, int stop_time, int reservation_time)",
    "computeGroupFee(double basePrice, int n_passengers, int n_under18, double discount)",
    "computeBikeSharingFee(int use_time, int stop_time, int km_traveled)",
    "costo_noleggio(int days, int km, double carModel)",
]

# Valori limite documentati in D1 §3 (per firma)
BOUNDARY_D1 = {
    "calcolaCostoSpedizione(int numero, int peso, int tariffa)": ["50", "51", "150", "151", "500", "501"],
    "calcolaCostoAccessi(int num, float sconto, float costo, int Quota_fissa)": ["9", "10", "29", "30", "49", "50"],
    "calcolaCostoSpedizione(int km, double peso, int tariffa)": ["0.49", "0.5", "4.99", "5", "9.99", "10"],
    "costoPulizia(int dimensione, float costo1, float costo2, float cf)": ["49", "50", "150", "151", "500", "501"],
    "costoconsegna(int distanza, float costo1, float costo2)": ["1999", "2000", "2001", "4999", "5000", "5001"],
    "stimaCostoPosa(int lunghezza, int materiale, int manodopera)": ["100", "101", "250", "251", "1000", "1001"],
    "calcolaManodopera(int livello_tecnico, float costo_orario, float durata)": ["0.99", "1", "3", "3.01", "6", "6.01"],
    "costoPiazzola(float costo, int area, int quota_fissa)": ["14", "15", "39", "40", "100", "101"],
    "calcolaCostoStampa(int numero, int tariffa1, int tariffa2)": ["200", "201", "450", "451", "700", "701"],
    "computeGroupFee(double basePrice, int n_passengers, int n_under18, double discount)": ["1", "9", "10", "11"],
    "computeBikeSharingFee(int use_time, int stop_time, int km_traveled)": ["4", "5", "6", "49", "50", "51"],
    "costo_noleggio(int days, int km, double carModel)": ["999", "1000", "1001", "99999", "100000", "100001"],
}

INCERTE = {
    "costoPulizia(int dimensione, float costo1, float costo2, float cf)",
    "costoconsegna(int distanza, float costo1, float costo2)",
}

TIPO_ESAME_RE = re.compile(
    r"^(Parte 1 Design 1\.4: .+|Parte 2 Testing: classi di equivalenza e boundary|Parte 3 Teoria: .+)\s*\(.+\)$"
)
# Punteggi: "N pt/punti" (documentati in §1.2) o barra preceduta da spazio (es. " /100");
# le formule tipo ".../100" hanno una lettera prima della barra e non matchano.
PUNTEGGIO_RE = re.compile(r"\b\d+\s*(pt|punti)\b|(?<![\w·/])/\s*\d+\b|30\s*e\s*lode", re.I)


ALL_NODES = {n["id"]: n for n in load_graph()["nodi"]}


def _parte(nid):
    assert nid in PARTS, f"nodo parts mancante: {nid}"
    return PARTS[nid]


def _lezione(nid):
    assert nid in LEZIONI, f"lezione mancante: {nid}"
    return LEZIONI[nid]


def test_nodi_banca_presenti():
    bva = _parte(BVA_ID)
    pat = _parte(PAT_ID)
    tea = _parte(TEA_ID)
    assert bva["tipo"] == "tipo_esercizio" and bva["area"] == 3
    assert pat["tipo"] == "tipo_esercizio" and pat["area"] == 2
    assert tea["tipo"] == "tipo_esercizio" and tea["area"] == 3
    for nid in (BVA_ID, PAT_ID, TEA_ID):
        for prereq in _parte(nid).get("prerequisiti", []):
            assert prereq["id"] in ALL_NODES, f"{nid} ha prerequisito inesistente {prereq['id']}"


def test_tredici_firme_d1_presenze_ordine():
    bva = _parte(BVA_ID)
    firme = []
    for e in bva["esercizi"]:
        m = re.search(r"([A-Za-z_]\w*)\(([^)]*)\)", e["testo"])
        assert m, f"firma non trovata nel testo: {e['testo'][:90]!r}"
        firme.append(m.group(1) + "(" + m.group(2) + ")")
    assert firme == FIRME_D1, f"firme diverse o ordine diverso:\n{firme}\nvs\n{FIRME_D1}"


def test_fonti_esercizi():
    bva = _parte(BVA_ID)
    for e, firma in zip(bva["esercizi"], FIRME_D1):
        assert "sintesi dell'utente" in e["tipo_esame"], e["tipo_esame"]
        assert firma in e["testo"], f"firma {firma} assente nel testo"
        assert "prova" in e["tipo_esame"]


def test_valori_limite_d1_presenti():
    bva = _parte(BVA_ID)
    for e, firma in zip(bva["esercizi"], FIRME_D1):
        if firma in BOUNDARY_D1:
            testo = e["testo"] + e["soluzione"]
            for val in BOUNDARY_D1[firma]:
                assert val in testo, f"valore limite {val} mancante per {firma}"


def test_formule_incerti_marcati():
    bva = _parte(BVA_ID)
    for e, firma in zip(bva["esercizi"], FIRME_D1):
        if firma in INCERTE:
            testo = e["testo"] + e["soluzione"]
            assert "[da verificare]" in testo, f"{firma} manca di '[da verificare]'"


def test_boundary_derivati_computecarsharing():
    bva = _parte(BVA_ID)
    trovato = False
    for e in bva["esercizi"]:
        if "computeCarSharingFee" in e["testo"]:
            trovato = True
            testo = e["testo"] + e["soluzione"]
            assert "derivati" in testo, "computeCarSharingFee deve marcare i boundary 'derivati'"
            for val in ("14", "15", "16", "479", "480", "481"):
                assert val in testo, f"boundary derivato {val} mancante"
    assert trovato, "esercizio computeCarSharingFee non trovato"


def test_tipo_esame_formato_contratto_41():
    for nid in (BVA_ID, PAT_ID, TEA_ID):
        for e in _parte(nid)["esercizi"]:
            assert TIPO_ESAME_RE.match(e["tipo_esame"]), f"tipo_esame non conforme §4.1: {e['tipo_esame']!r}"


def test_blocchi_java_bilanciati_con_classe():
    L = _lezione(PAT_ID)
    blocchi = re.findall(r"```java\n(.*?)```", L.get("spiegazione", ""), re.S)
    for es in L.get("esempi_svolti", []):
        blocchi += re.findall(r"```java\n(.*?)```", es.get("soluzione", ""), re.S)
    assert blocchi, f"{PAT_ID}: nessun blocco ```java nelle lezioni"
    for b in blocchi:
        assert b.count("{") == b.count("}"), f"graffe non bilanciate: {b[:60]!r}"
        assert re.search(r"\b(class|interface)\b", b), f"blocco java senza class/interface: {b[:60]!r}"


def test_lezioni_struttura_minima():
    for nid in (BVA_ID, PAT_ID, TEA_ID):
        L = _lezione(nid)
        assert len(L.get("intuizione", "")) >= 80
        assert len(L.get("spiegazione", "")) >= 1500, f"spiegazione {nid}: {len(L.get('spiegazione',''))} caratteri"
        assert len(re.findall(r"^#{2,3} ", L.get("spiegazione", ""), re.M)) >= 2
        assert len(L.get("analogia", "")) >= 40
        assert len(L.get("collegamenti_prior", [])) >= 2
        assert len(L.get("esempi_svolti", [])) >= 2
        assert len(L.get("errori_comuni", [])) >= 2
        assert len(L.get("domande_autoverifica", [])) >= 3
        righe = [r for r in L.get("riepilogo", "").splitlines() if r.strip()]
        assert len(righe) <= 5, f"riepilogo di {nid} ha {len(righe)} righe"


# Punteggi dichiarati in §1.2/§1.3 del piano: citabili, non "inventati".
PUNTEGGI_LECITI = ["3-5 pt", "4-5 pt", "10-11 pt", "4 pt", "3 pt", "2 pt"]


def _senza_leciti(testo):
    t = testo
    for lic in PUNTEGGI_LECITI:
        t = t.replace(lic, "")
    return t


def test_nessun_punteggio_inventato():
    for nid in (BVA_ID, PAT_ID, TEA_ID):
        for e in _parte(nid)["esercizi"]:
            assert not PUNTEGGIO_RE.search(_senza_leciti(e["testo"])), f"punteggio inventato in testo {e['tipo_esame']}"
            assert not PUNTEGGIO_RE.search(_senza_leciti(e["soluzione"])), f"punteggio inventato in soluzione {e['tipo_esame']}"
        L = _lezione(nid)
        for campo in (L.get("intuizione", ""), L.get("spiegazione", ""), L.get("analogia", "")):
            assert not PUNTEGGIO_RE.search(_senza_leciti(campo)), f"punteggio inventato in lezione {nid}"
        for es in L.get("esempi_svolti", []):
            assert not PUNTEGGIO_RE.search(_senza_leciti(es.get("soluzione", "")))