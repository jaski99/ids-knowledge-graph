<!-- generato da scripts/gen_docs.py: non modificare a mano -->

# Piano di studio — Ingegneria del Software

Ordine topologico dei nodi (ogni prerequisito prima del nodo che lo usa); a parità di vincoli prima la priorità **ALTA**, poi area e id. Sessioni da circa 2 ore (un nodo non viene mai spezzato).

## Tempo totale per area

| area | nodi | alta | tempo |
|---|---|---|---|
| 1. Specifica dei requisiti | 9 | 6 | 6 h 45 min |
| 2. Progettazione | 38 | 20 | 27 h 10 min |
| 3. Implementazione e testing | 22 | 12 | 13 h 10 min |
| 4. Distribuzione e manutenzione | 7 | 0 | 3 h 00 min |
| 5. Ingegneria del software AI-native | 5 | 0 | 2 h 20 min |
| **Totale** | 81 | 38 | **52 h 25 min** |

## Sessione 1 (2 h 15 min)

1. [ ] **Obiettivi della specifica dei requisiti** (`requisiti-obiettivi`) — area 1, concetto, priorità ALTA, 45 min. Prerequisiti: —
2. [ ] **Diagramma UML dei casi d'uso** (`uml-casi-uso`) — area 1, abilita, priorità ALTA, 90 min. Prerequisiti: requisiti-obiettivi

## Sessione 2 (2 h 15 min)

3. [ ] **Diagramma UML delle classi** (`uml-diagramma-classi`) — area 2, abilita, priorità ALTA, 90 min. Prerequisiti: requisiti-obiettivi
4. [ ] **Associazioni: molteplicità, navigabilità, ruoli** (`uml-associazioni-molteplicita`) — area 2, abilita, priorità ALTA, 45 min. Prerequisiti: uml-diagramma-classi

## Sessione 3 (2 h 05 min)

5. [ ] **Esercizio d'esame: class diagram da un caso di studio** (`esercizio-class-diagram-da-testo`) — area 2, tipo_esercizio, priorità ALTA, 45 min. Prerequisiti: uml-diagramma-classi, uml-associazioni-molteplicita
6. [ ] **Diagramma UML degli stati (state machine)** (`uml-diagramma-stati`) — area 2, abilita, priorità ALTA, 45 min. Prerequisiti: uml-diagramma-classi
7. [ ] **Testing: livelli, tipi e terminologia** (`testing-livelli-tipi`) — area 3, concetto, priorità ALTA, 35 min. Prerequisiti: requisiti-obiettivi

## Sessione 4 (2 h 15 min)

8. [ ] **Black box e white box testing** (`black-box-vs-white-box`) — area 3, concetto, priorità ALTA, 25 min. Prerequisiti: testing-livelli-tipi
9. [ ] **Partizione in classi di equivalenza** (`classi-equivalenza`) — area 3, abilita, priorità ALTA, 40 min. Prerequisiti: black-box-vs-white-box, requisiti-obiettivi
10. [ ] **Analisi dei valori limite (Boundary Value Analysis)** (`boundary-value-analysis`) — area 3, abilita, priorità ALTA, 40 min. Prerequisiti: classi-equivalenza, requisiti-obiettivi
11. [ ] **Grafo di flusso di controllo (CFG)** (`grafo-flusso-controllo`) — area 3, abilita, priorità ALTA, 30 min. Prerequisiti: black-box-vs-white-box

## Sessione 5 (2 h 05 min)

12. [ ] **Criteri di copertura: statement, decision, condition, MC/DC** (`criteri-copertura`) — area 3, concetto, priorità ALTA, 40 min. Prerequisiti: grafo-flusso-controllo
13. [ ] **Descrizione testuale di un caso d'uso (scenari)** (`casi-uso-descrizione-testuale`) — area 1, abilita, priorità MEDIA, 40 min. Prerequisiti: uml-casi-uso
14. [ ] **Esercizio d'esame: use case da un caso di studio testuale** (`esercizio-use-case-da-testo`) — area 1, tipo_esercizio, priorità ALTA, 45 min. Prerequisiti: uml-casi-uso, casi-uso-descrizione-testuale

## Sessione 6 (2 h 15 min)

15. [ ] **Diagramma UML di attività** (`uml-diagramma-attivita`) — area 2, abilita, priorità ALTA, 60 min. Prerequisiti: casi-uso-descrizione-testuale, uml-diagramma-classi
16. [ ] **Diagramma UML di sequenza** (`uml-diagramma-sequenza`) — area 2, abilita, priorità ALTA, 75 min. Prerequisiti: uml-diagramma-classi, casi-uso-descrizione-testuale

## Sessione 7 (2 h 10 min)

17. [ ] **Esercizio d'esame: sequence, activity e state coerenti con le classi** (`esercizio-diagrammi-coerenti`) — area 2, tipo_esercizio, priorità ALTA, 40 min. Prerequisiti: uml-diagramma-sequenza, uml-diagramma-attivita, uml-diagramma-stati, esercizio-class-diagram-da-testo
18. [ ] **Input dei requisiti: stakeholder ed elicitazione** (`requisiti-input-stakeholder`) — area 1, concetto, priorità MEDIA, 30 min. Prerequisiti: requisiti-obiettivi
19. [ ] **Processo di specifica dei requisiti e documento SRS** (`requisiti-processo-specifica`) — area 1, concetto, priorità ALTA, 60 min. Prerequisiti: requisiti-input-stakeholder, requisiti-obiettivi

## Sessione 8 (1 h 35 min)

20. [ ] **Costo degli errori nei requisiti (curva di Boehm)** (`requisiti-costo-errori-boehm`) — area 1, concetto, priorità ALTA, 35 min. Prerequisiti: requisiti-processo-specifica, requisiti-input-stakeholder
21. [ ] **Scrivere requisiti verificabili** (`requisiti-scrittura-verificabile`) — area 1, abilita, priorità MEDIA, 30 min. Prerequisiti: requisiti-processo-specifica, requisiti-obiettivi
22. [ ] **Esercizio d'esame: domanda teorica sui requisiti** (`esercizio-domanda-processo-requisiti`) — area 1, tipo_esercizio, priorità ALTA, 30 min. Prerequisiti: requisiti-processo-specifica, requisiti-scrittura-verificabile

## Sessione 9 (1 h 30 min)

23. [ ] **Esercizio d'esame: black box su una funzione a scaglioni (classi di equivalenza + BVA)** (`esercizio-black-box-scaglioni`) — area 3, tipo_esercizio, priorità ALTA, 60 min. Prerequisiti: classi-equivalenza, boundary-value-analysis, requisiti-scrittura-verificabile
24. [ ] **Obiettivi della progettazione: alto livello e dettaglio** (`progettazione-obiettivi-livelli`) — area 2, concetto, priorità MEDIA, 30 min. Prerequisiti: requisiti-obiettivi

## Sessione 10 (1 h 45 min)

25. [ ] **Coesione e accoppiamento dei moduli** (`coesione-accoppiamento`) — area 2, concetto, priorità ALTA, 60 min. Prerequisiti: progettazione-obiettivi-livelli
26. [ ] **Design pattern: concetto e classificazione** (`design-pattern-introduzione`) — area 2, concetto, priorità ALTA, 45 min. Prerequisiti: coesione-accoppiamento, uml-diagramma-classi

## Sessione 11 (1 h 45 min)

27. [ ] **Pattern Composite** (`design-pattern-composite`) — area 2, abilita, priorità ALTA, 50 min. Prerequisiti: design-pattern-introduzione, uml-associazioni-molteplicita
28. [ ] **Pattern Adapter** (`design-pattern-adapter`) — area 2, abilita, priorità MEDIA, 30 min. Prerequisiti: design-pattern-introduzione
29. [ ] **Pattern Singleton** (`design-pattern-singleton`) — area 2, abilita, priorità MEDIA, 25 min. Prerequisiti: design-pattern-introduzione

## Sessione 12 (2 h 15 min)

30. [ ] **Pattern State** (`design-pattern-state`) — area 2, abilita, priorità MEDIA, 40 min. Prerequisiti: design-pattern-introduzione, uml-diagramma-stati
31. [ ] **Principi SOLID** (`principi-solid`) — area 2, concetto, priorità MEDIA, 50 min. Prerequisiti: coesione-accoppiamento
32. [ ] **Coesione dei componenti (Clean Architecture): REP, CCP, CRP** (`clean-architecture-coesione-componenti`) — area 2, concetto, priorità ALTA, 45 min. Prerequisiti: principi-solid, coesione-accoppiamento

## Sessione 13 (2 h 15 min)

33. [ ] **Pattern Decorator** (`design-pattern-decorator`) — area 2, abilita, priorità ALTA, 50 min. Prerequisiti: design-pattern-introduzione, principi-solid, uml-associazioni-molteplicita
34. [ ] **Pattern Observer** (`design-pattern-observer`) — area 2, abilita, priorità ALTA, 50 min. Prerequisiti: design-pattern-introduzione, principi-solid, uml-associazioni-molteplicita
35. [ ] **Simple Factory e static factory method** (`design-pattern-simple-factory`) — area 2, abilita, priorità ALTA, 35 min. Prerequisiti: design-pattern-introduzione, principi-solid

## Sessione 14 (2 h 15 min)

36. [ ] **Pattern Strategy** (`design-pattern-strategy`) — area 2, abilita, priorità ALTA, 40 min. Prerequisiti: design-pattern-introduzione, principi-solid
37. [ ] **Pattern Template Method** (`design-pattern-template-method`) — area 2, abilita, priorità ALTA, 45 min. Prerequisiti: design-pattern-introduzione, principi-solid
38. [ ] **Riconoscere il pattern dallo scenario** (`riconoscere-pattern-scenario`) — area 2, abilita, priorità ALTA, 50 min. Prerequisiti: design-pattern-composite, design-pattern-observer, design-pattern-decorator, design-pattern-template-method, design-pattern-strategy, design-pattern-state, design-pattern-simple-factory, design-pattern-adapter

## Sessione 15 (2 h 15 min)

39. [ ] **Esercizio d'esame: pattern motivato + class diagram + Java minimo** (`esercizio-pattern-motivato-java`) — area 2, tipo_esercizio, priorità ALTA, 45 min. Prerequisiti: riconoscere-pattern-scenario, uml-associazioni-molteplicita, principi-solid
40. [ ] **Esercizio d'esame: riconoscere il pattern dal codice** (`esercizio-riconosci-pattern-dal-codice`) — area 2, tipo_esercizio, priorità ALTA, 20 min. Prerequisiti: design-pattern-simple-factory, riconoscere-pattern-scenario
41. [ ] **Pattern Factory Method** (`design-pattern-factory-method`) — area 2, abilita, priorità MEDIA, 35 min. Prerequisiti: design-pattern-simple-factory, design-pattern-introduzione
42. [ ] **Pattern Abstract Factory** (`design-pattern-abstract-factory`) — area 2, abilita, priorità MEDIA, 35 min. Prerequisiti: design-pattern-factory-method, design-pattern-introduzione

## Sessione 16 (2 h 10 min)

43. [ ] **Caratteristiche di qualità del progetto** (`qualita-progettazione`) — area 2, concetto, priorità MEDIA, 30 min. Prerequisiti: coesione-accoppiamento
44. [ ] **Metriche software** (`metriche-software`) — area 2, concetto, priorità MEDIA, 60 min. Prerequisiti: qualita-progettazione, coesione-accoppiamento
45. [ ] **Clean Architecture: accoppiamento tra componenti** (`clean-architecture-accoppiamento-componenti`) — area 2, concetto, priorità MEDIA, 40 min. Prerequisiti: clean-architecture-coesione-componenti, coesione-accoppiamento, metriche-software

## Sessione 17 (1 h 45 min)

46. [ ] **Calcolare la complessità ciclomatica** (`metrica-complessita-ciclomatica`) — area 2, abilita, priorità MEDIA, 40 min. Prerequisiti: metriche-software
47. [ ] **Esercizio d'esame: domanda teorica sulle metriche** (`esercizio-domanda-metriche`) — area 2, tipo_esercizio, priorità MEDIA, 25 min. Prerequisiti: metriche-software, metrica-complessita-ciclomatica
48. [ ] **Stili architetturali** (`stili-architetturali`) — area 2, concetto, priorità MEDIA, 40 min. Prerequisiti: progettazione-obiettivi-livelli

## Sessione 18 (1 h 55 min)

49. [ ] **Buona programmazione e best practices** (`buone-pratiche-programmazione`) — area 3, concetto, priorità MEDIA, 40 min. Prerequisiti: coesione-accoppiamento, principi-solid
50. [ ] **Code smell** (`code-smell`) — area 3, concetto, priorità MEDIA, 30 min. Prerequisiti: buone-pratiche-programmazione, coesione-accoppiamento
51. [ ] **Refactoring** (`refactoring`) — area 3, concetto, priorità ALTA, 45 min. Prerequisiti: code-smell, design-pattern-introduzione, principi-solid

## Sessione 19 (2 h 15 min)

52. [ ] **Domanda d'esame: refactoring (cos'è, a cosa serve, rischi)** (`domanda-refactoring`) — area 3, tipo_esercizio, priorità ALTA, 30 min. Prerequisiti: refactoring, code-smell, metriche-software
53. [ ] **Ottimizzazione del codice e ottimizzazione prematura** (`ottimizzazione-codice`) — area 3, concetto, priorità ALTA, 45 min. Prerequisiti: buone-pratiche-programmazione, refactoring, qualita-progettazione
54. [ ] **Commenti nel codice** (`commenti-codice`) — area 3, concetto, priorità MEDIA, 25 min. Prerequisiti: buone-pratiche-programmazione, refactoring
55. [ ] **Path analysis e complessità ciclomatica di McCabe** (`complessita-ciclomatica`) — area 3, abilita, priorità MEDIA, 35 min. Prerequisiti: grafo-flusso-controllo, metrica-complessita-ciclomatica

## Sessione 20 (1 h 50 min)

56. [ ] **Esercizio d'esame: da codice a CFG e test minimi per la copertura** (`esercizio-white-box-copertura`) — area 3, tipo_esercizio, priorità ALTA, 40 min. Prerequisiti: criteri-copertura, grafo-flusso-controllo, complessita-ciclomatica
57. [ ] **Controllo di versione con Git** (`git-versionamento`) — area 3, abilita, priorità MEDIA, 40 min. Prerequisiti: —
58. [ ] **Ispezione e revisione del codice** (`ispezione-codice`) — area 3, concetto, priorità MEDIA, 30 min. Prerequisiti: buone-pratiche-programmazione, code-smell

## Sessione 21 (1 h 45 min)

59. [ ] **Programmazione difensiva e asserzioni** (`programmazione-difensiva`) — area 3, concetto, priorità MEDIA, 30 min. Prerequisiti: buone-pratiche-programmazione
60. [ ] **Unit testing con JUnit 5** (`junit-5`) — area 3, abilita, priorità MEDIA, 40 min. Prerequisiti: boundary-value-analysis, testing-livelli-tipi, programmazione-difensiva
61. [ ] **Debugging e processo di debugging** (`debugging`) — area 3, abilita, priorità ALTA, 35 min. Prerequisiti: testing-livelli-tipi, git-versionamento, junit-5, classi-equivalenza

## Sessione 22 (2 h 00 min)

62. [ ] **Gestione delle configurazioni (SCM)** (`gestione-configurazioni`) — area 4, concetto, priorità MEDIA, 35 min. Prerequisiti: git-versionamento
63. [ ] **Licenze software: proprietarie, permissive e copyleft** (`licenze-software`) — area 4, concetto, priorità MEDIA, 30 min. Prerequisiti: —
64. [ ] **Copyleft e compatibilità tra licenze** (`compatibilita-licenze`) — area 4, abilita, priorità MEDIA, 25 min. Prerequisiti: licenze-software
65. [ ] **LLM e agenti nel ciclo di vita del software** (`llm-agenti-ciclo-vita`) — area 5, concetto, priorità MEDIA, 30 min. Prerequisiti: testing-livelli-tipi, requisiti-processo-specifica, gestione-configurazioni

## Sessione 23 (1 h 50 min)

66. [ ] **Assistenti AI per generazione, comprensione, modifica, refactoring e testing** (`assistenti-ai-sviluppo`) — area 5, abilita, priorità MEDIA, 30 min. Prerequisiti: llm-agenti-ciclo-vita, refactoring, junit-5, design-pattern-introduzione, git-versionamento
67. [ ] **Opportunità, limiti e rischi del codice generato** (`rischi-codice-generato`) — area 5, concetto, priorità MEDIA, 30 min. Prerequisiti: llm-agenti-ciclo-vita, licenze-software, programmazione-difensiva
68. [ ] **Verifica umana del codice generato** (`verifica-umana-codice-ai`) — area 5, abilita, priorità MEDIA, 30 min. Prerequisiti: rischi-codice-generato, ispezione-codice, boundary-value-analysis, criteri-copertura
69. [ ] **Domanda d'esame: ingegneria del software AI-native** (`domanda-ids-ai-native`) — area 5, tipo_esercizio, priorità MEDIA, 20 min. Prerequisiti: rischi-codice-generato, verifica-umana-codice-ai, assistenti-ai-sviluppo, debugging

## Sessione 24 (2 h 10 min)

70. [ ] **Decomposizione funzionale** (`decomposizione-funzionale`) — area 2, abilita, priorità BASSA, 30 min. Prerequisiti: progettazione-obiettivi-livelli
71. [ ] **Diagramma UML dei package** (`uml-diagramma-package`) — area 2, abilita, priorità MEDIA, 35 min. Prerequisiti: uml-diagramma-classi, decomposizione-funzionale, coesione-accoppiamento
72. [ ] **Esercizio: tesina individuale del corso** (`esercizio-tesina-individuale`) — area 2, tipo_esercizio, priorità ALTA, 30 min. Prerequisiti: requisiti-processo-specifica, esercizio-class-diagram-da-testo, esercizio-pattern-motivato-java, uml-diagramma-package, uml-diagramma-sequenza, uml-diagramma-attivita
73. [ ] **Design pattern Builder** (`design-pattern-builder`) — area 2, abilita, priorità BASSA, 35 min. Prerequisiti: design-pattern-introduzione, design-pattern-simple-factory, design-pattern-decorator

## Sessione 25 (1 h 50 min)

74. [ ] **Object Relational Mapping, problematiche e JPA/Hibernate** (`orm-object-relational-mapping`) — area 2, concetto, priorità BASSA, 60 min. Prerequisiti: progettazione-obiettivi-livelli, uml-associazioni-molteplicita
75. [ ] **Diagrammi UML di componenti e deployment** (`uml-componenti-deployment`) — area 2, concetto, priorità BASSA, 25 min. Prerequisiti: stili-architetturali, uml-diagramma-classi
76. [ ] **Analisi statica del codice** (`analisi-statica`) — area 3, concetto, priorità BASSA, 25 min. Prerequisiti: ispezione-codice, code-smell, metrica-complessita-ciclomatica

## Sessione 26 (2 h 00 min)

77. [ ] **Build automation con Maven** (`maven`) — area 3, abilita, priorità BASSA, 30 min. Prerequisiti: junit-5
78. [ ] **Integrazione e consegna continua (CI/CD)** (`ci-cd`) — area 4, concetto, priorità BASSA, 30 min. Prerequisiti: maven, gestione-configurazioni, junit-5
79. [ ] **Versionamento semantico e changelog** (`versionamento-semantico`) — area 4, abilita, priorità BASSA, 15 min. Prerequisiti: gestione-configurazioni
80. [ ] **Rilascio e post-produzione** (`release-post-produzione`) — area 4, concetto, priorità BASSA, 20 min. Prerequisiti: gestione-configurazioni, versionamento-semantico
81. [ ] **Manutenzione del software: tipi e costi** (`tipi-manutenzione`) — area 4, concetto, priorità MEDIA, 25 min. Prerequisiti: release-post-produzione, refactoring, requisiti-costo-errori-boehm
