# Programma: Ingegneria del Software (INF-36) — UNIMORE

La fonte per l'offerta **2026/27** è la scheda di catalogo [S1]; la pagina del docente [S2], la prova storica di terzi [S6] e la sintesi dell'utente [D1] sono evidenze diverse. Una modalità storica non descrive automaticamente l'esame della coorte corrente. Per le versioni delle prove si veda [EXAM_FORMAT.md](EXAM_FORMAT.md).

## [S1] Scheda ufficiale 2026/27

- Ingegneria del Software **INF-36**, corso di laurea in Ingegneria Informatica UNIMORE: **9 CFU, 108 ore**, di cui **81 ore di lezione e 27 di laboratorio**. Titolare: **Francesco Guerra**; docente: **Federica Rollo** [S1].
- L'obiettivo comprende specifica dei requisiti, progettazione, implementazione, testing, distribuzione e manutenzione di sistemi software [S1].

| Voce del programma [S1] | CFU | Contenuti principali |
|---|---:|---|
| Specifica dei requisiti | 2,5 | Obiettivi e input dei requisiti, generazione delle specifiche, casi d'uso UML. |
| Progettazione | 3,5 | Alto livello e dettaglio, stili architetturali, decomposizione, ORM/JPA/Hibernate, qualità e metriche, coesione/accoppiamento, UML e design pattern. |
| Implementazione e testing | 1,5 | Best practice, refactoring, testing e ispezione, Path Analysis, Boundary Value Analysis, JUnit, programmazione difensiva, Maven e Git. |
| Distribuzione e manutenzione | 0,5 | Gestione delle configurazioni, post-produzione e licenze. |
| Ingegneria del software AI-native | 1,0 | LLM e agenti nel ciclo di vita, opportunità e rischi del codice generato, verifica umana e assistenti AI. **È ufficiale nella scheda 2026/27**, non una frequenza attribuibile alle prove storiche. |

La scheda descrive uno **scritto di 2 ore** con 3–4 domande aperte, esercizi di design su diagrammi UML e pattern ed esercizi di testing su una funzione. Fra i diagrammi nomina anche il **package diagram** [S1]. Prevede inoltre una **tesina individuale**, distinta dallo scritto: descrizione di un prodotto software, requisiti e diagrammi UML, revisione del progetto con pattern. I criteri descritti comprendono precisione/correttezza, completezza del design e dei pattern ed «effetto wow»; i dettagli applicativi non qui riportati sono **[da verificare]** sulla scheda [S1].

**Attenzione ai pesi:** la scheda riporta circa **30%** per le domande aperte, **55%** per design e **55%** per testing: la somma è **140%**, quindi la ripartizione è incoerente. Non correggerla per supposizione né usarla per calcolare un voto; chiedere chiarimento e verificare gli avvisi del corso [S1]. La scheda indica che le slide sono rese disponibili agli studenti tramite **Dolly** e che sono previsti laboratori [S1].

## [S2] Pagina didattica del docente

L'overview pubblica di Francesco Guerra descrive quattro blocchi: requisiti; progettazione; implementazione e testing; distribuzione e manutenzione. Comprende ORM/JPA/Hibernate, metriche, coesione/accoppiamento, UML e pattern, Path Analysis, BVA, JUnit, programmazione difensiva, Maven, Git, configurazioni e licenze [S2]. La pagina consultata **non elenca** l'unità AI-native e non descrive il formato della prova o la tesina; questo non smentisce la scheda 2026/27 [S1] e non permette di datare il cambiamento.

## [S6] Prova pubblica del 13/01/2017 — fonte terza

Una trascrizione su Studocu, caricata da terzi e **non** pubblicata come archivio ufficiale UNIMORE, riporta una prova a.a. 2016/17 con design, testing e domande. La durata, i punti e i tempi riportati per questa sola prova sono nel [registro delle versioni](EXAM_FORMAT.md#prova-del-13012017--s6-fonte-terza); non si estendono agli altri appelli. Comprende modellazione UML e pattern, classi di equivalenza e valori limite su una funzione, e domande di teoria [S6].

Il 13/01/2017 [S6] non va identificato con il 23/01/2017 e lo scenario di negozio alimentare nella sintesi dell'utente [D1]: possono essere prove distinte. La trascrizione terza non verifica la ricostruzione dell'utente.

## [D1] Sintesi dell'utente sulle prove 2017–2025

[DATI_PROVE_GUERRA.md](DATI_PROVE_GUERRA.md) è una **sintesi dell'utente** di 13 prove; gli originali del corpus non sono disponibili nel repository. Scenari, struttura storica, frequenze, funzioni, soglie e durate ivi riportati sono **dati dell'utente**, non statistiche ufficiali o verifiche indipendenti [D1]. Le formule di `costoPulizia` e `costoconsegna` indicate come «probabile» o mancanti restano **[da verificare]**, senza completarle per ipotesi.

La priorità di studio proposta dall'utente è: testing meccanico; class diagram; pattern principali; diagrammi dinamici; teoria ricorrente; temi minori. La mappatura dei nodi esistenti è in `graph/meta.json`; il riepilogo generato è [NODES.md](NODES.md). Frequenze e priorità non dimostrano che un argomento verrà chiesto in una prova futura.

## Stato delle evidenze

| Stato | Affermazione e provenienza |
|---|---|
| **FATTO** | La scheda 2026/27 indica carico, docenti distinti, cinque voci e CFU, scritto più tesina, package diagram e unità AI-native [S1]. I pesi pubblicati sono incoerenti. |
| **FATTO** | La pagina del docente descrive i quattro blocchi tradizionali, senza esporre la modalità d'esame nella pagina consultata [S2]. |
| **FATTO** | È disponibile una trascrizione di terzi della prova del 13/01/2017: non è una fonte istituzionale e attesta solo quel documento storico [S6]. |
| **DATO DELL'UTENTE** | Struttura, frequenze e funzioni delle 13 prove sono ricostruiti nella sintesi dell'utente; le formule incerte rimangono **[da verificare]** [D1]. |
| **DATO DELL'UTENTE** | Il fac-simile 2016/17 e il dettaglio del 5/11/2025 registrati in [EXAM_FORMAT.md](EXAM_FORMAT.md) provengono da materiale/ricostruzione forniti dall'utente; non sono stati autenticati indipendentemente. |
| **NON TROVATO** | Raccolta pubblica ufficiale del docente con gli originali dell'intero corpus 2017–2025; conferma indipendente delle soglie storiche e dei pesi attuali corretti. |
| **NON TROVATO** | Slide o esercitazioni ufficiali scaricabili pubblicamente nella ricerca; la scheda dichiara l'uso di Dolly, ma questo non dimostra l'assenza dei materiali [S1]. |
| **NON TROVATO** | Graduatoria ufficiale per singolo pattern o frequenza dei temi; indici verificati per HFDP, GoF, Fowler, Miles e UML @ Classroom. |

## Testi: discrepanza da chiarire, chiavi invariate

La scheda 2026/27 [S1] elenca Tsui, *Software Engineering*, **3ª edizione**; *Head First Design Patterns* (**2014**); GoF, *Design Patterns* (1994); Fowler, *UML Distilled*; Seidl et al., *UML @ Classroom* (2015). Non specifica qui un'edizione di Fowler.

Il grafo e [CONTRACTS.md](CONTRACTS.md) conservano invece le chiavi e i riferimenti storici: `TSUI` (*Essentials of Software Engineering*, **5ª ed. 2022**), `HFDP` (**2ª ed. 2020**) e anche `MILES` (*Learning UML 2.0*), non elencato nella scheda consultata. `MARTIN` è un riferimento extra, non un testo attribuito al docente. Non è stato verificato se la lista storica corrisponda a una coorte precedente: chiedere conferma, senza sostituire o rinominare le chiavi `testi`.

## Fonti

- **[S1]** UNIMORE Course Catalogue, [INF-36, offerta 2026/27](https://unimore.coursecatalogue.cineca.it/corsi/2024/10296/insegnamenti/2026/27351/2022/10001?schemaid=22867): scheda ufficiale; consultazione documentata in [R3](research/R3-programma-unimore.md).
- **[S2]** Francesco Guerra, [Teaching activities](https://fguerra73.github.io/teaching/): overview del docente, consultazione documentata in [R3](research/R3-programma-unimore.md). Il [sorgente della pagina nel repository pubblico](https://github.com/fguerra73/fguerra73.github.io/blob/42e5ef462625bd6eb655d490c06fd79f5e68c0e4/_pages/teaching.md) è stato consultato e il suo URL verificato il 27/10/2026; la pagina renderizzata non era raggiungibile dal sandbox.
- **[S6]** [Prova del 13/01/2017 su Studocu](https://www.studocu.com/it/document/universita-degli-studi-di-modena-e-reggio-emilia/ingegneria-del-software-e-lab/esame-13-gennaio-2017-domanderisposte/1380133): trascrizione di terzi, non fonte istituzionale; consultazione documentata in [R3](research/R3-programma-unimore.md).
- **[D1]** [DATI_PROVE_GUERRA.md](DATI_PROVE_GUERRA.md): sintesi dell'utente; originali del corpus non disponibili.
