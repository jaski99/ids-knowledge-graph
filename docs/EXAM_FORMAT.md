# Formato esame (dal fac-simile a.a. 2016/17 fornito dall'utente)
Scritto, 2 ore, 30 punti.
- Parte 1 Design (13 pt, ~1h) su un caso di studio testuale (es. biblioteca): 1.1 Use Case + Class diagram (3); 1.2 Sequence diagram coerente con le classi (3); 1.3 Activity diagram (2); 1.4 Design pattern motivato con limiti + class diagram + classi Java minime (5) (soluzione ufficiale: Composite).
- Parte 2 Testing (7 pt, ~20 min): black box su una funzione Java (es. luggageCost(int,double)): classi di equivalenza, test minimi validi/non validi, boundary conditions sui casi validi.
- Parte 3 Domande (10 pt, ~40 min): teoria aperta (es. processo di specifica dei requisiti; software metrics e una metrica a scelta; refactoring scopo e rischi).
Priorità: diagrammi UML (use case, classi, sequenza, attività) e design pattern GoF con codice Java = ALTA; equivalence class + BVA = ALTA; teoria requisiti/metriche/refactoring = ALTA come domande. Ogni nodo tipo_esercizio deve ricalcare questi formati.

# Prova del 5/11/2025 (a.a. 2024/25) — più recente, PESA DI PIÙ
Scritto 2h, sufficienza >17/30, nessun materiale.
- Parte 1 Design (16 pt, 60 min), caso farmacia: 1.1 Class diagram con proprietà, operazioni, direzione e molteplicità delle associazioni (5); 1.2 Sequence (ordine cliente con tessera) + Activity dell'intera app + State diagram degli stati di un acquisto, coerenti con le classi (5); 1.3 Use case (2); 1.4 pattern per mailing list/promozioni = Observer: giustificare, class diagram, classi Java minime (4).
- Parte 2 Testing (3 pt, 10 min): black box calcolaCostoSpedizione(int numero,int peso,int tariffa) a fasce (<=50, 51-150, 151-500, peso<=1000g): classi di equivalenza + BVA solo su 'numero'.
- Parte 3 Domande (11 pt, 30 min): debugging e processo di debugging (3); riconoscere Simple Factory dal codice e pro/contro del metodo static (2); white box e decision coverage (2); dato codice con if/while: diagramma di flusso + test minimi per statement coverage e decision coverage (4).
Priorità aggiornate ALTA: class diagram (molteplicità/direzione), sequence, activity, state diagram, use case, Observer, Composite, Factory (simple/method/abstract), black box EC+BVA, white box (CFG, statement/decision coverage), debugging, refactoring, metriche, specifica requisiti.

# Prove 9/6/2022 e 27/1/2023 (da sintesi dell'utente, testo originale non disponibile)
- 2022: Design su mercato ambulanti; 1.4 = Decorator (accessori opzionali piazzole con costo). Black box costoPiazzola a scaglioni m² (<15, 15..40, 40..100). Domande: ottimizzazione per la velocità (Knuth: premature optimization; make it work/right/fast; profiling); coesione dei componenti Clean Architecture (REP, CCP, CRP); statement e decision coverage; errori nei requisiti e costo di correzione nel ciclo di vita (curva di Boehm; review, prototipi, stakeholder).
- 2023: Design su piscine (badge, accessi, servizi, top 10); 1.4 = Template Method. Black box calcolaCostoAccessi (4 scaglioni). Domande: REP/CCP/CRP; MC/DC; processo requisiti; processo debugging.
# Regole ricorrenti
- 1.4 non chiede mai "descrivi X": scenario operativo -> riconoscere il pattern (Decorator, Template Method, Observer, Composite, Factory...).
- Parte 2 sempre funzione a scaglioni: EC + BVA su un parametro.
- Clean Architecture REP/CCP/CRP richiesta in 2 prove su 3.
- White box: dalle definizioni (statement, decision, MC/DC) al CFG con calcolo dei test.
