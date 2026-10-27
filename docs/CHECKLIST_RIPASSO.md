<!-- generato da scripts/gen_docs.py: non modificare a mano -->

# Checklist di ripasso — Ingegneria del Software

## Trappole note dalle prove d'esame

- [ ] **Es. 1.4 - pattern** (fac-simile 2016/17 fornito dall'utente; prove storiche secondo la sintesi dell'utente [D1]). Trappola: Il testo non nomina mai il pattern: descrive uno scenario. → Riconosci lo scenario: gerarchia parte-tutto → Composite; accessori opzionali con costo → Decorator; algoritmo a passi fissi con varianti → Template Method; evento che notifica un insieme variabile di interessati → Observer. Motiva la scelta e indica i limiti.
- [ ] **Ottimizzazione del codice** (prova 9/6/2022, sintesi dell'utente [D1]). Trappola: Dire che la velocità va ottimizzata fin dall'inizio. → Knuth: 'premature optimization is the root of all evil'. Make it work, make it right, make it fast: si ottimizza dopo il profiling, solo sui veri colli di bottiglia, senza sacrificare leggibilità.
- [ ] **Errori nei requisiti** (prova 9/6/2022, sintesi dell'utente [D1]). Trappola: Dire che gli errori di analisi si correggono facilmente in programmazione. → Curva di Boehm: il costo di correzione cresce lungo il ciclo di vita (fino a ~100 volte in produzione). Prevenzione: review delle specifiche, prototipi, coinvolgimento degli stakeholder.
- [ ] **Coesione dei componenti** (prove 9/6/2022 e 27/1/2023, sintesi dell'utente [D1]). Trappola: Rispondere con la coesione delle classi invece che dei componenti. → Enuncia REP (granulo di riuso = granulo di rilascio), CCP (classi che cambiano insieme stanno insieme, SRP sui componenti), CRP (non dipendere da ciò che non usi, ISP sui componenti) e la loro tensione.
- [ ] **Black box a scaglioni** (testing black box nelle 13 prove secondo la sintesi dell'utente [D1]). Trappola: Dimenticare le classi non valide o fare la BVA su tutti i parametri quando ne è chiesto uno solo. → Classi valide e non valide per ogni parametro; test minimi: una classe non valida per test, le valide combinate; BVA solo sui casi validi e solo sul parametro richiesto (es. 'numero' nel 5/11/2025).
- [ ] **Coerenza tra diagrammi** (fac-simile 2016/17 fornito dall'utente e prova 5/11/2025, sintesi dell'utente [D1]). Trappola: Sequence/activity/state con oggetti o metodi che non esistono nel class diagram. → Ogni lifeline è un'istanza di una classe progettata; ogni messaggio è un'operazione di quella classe.
- [ ] **Simple Factory e static** (prova 5/11/2025, sintesi dell'utente [D1]). Trappola: Chiamarla Factory Method o non discutere lo static. → È una Simple Factory (non un pattern GoF). Static: comodo, senza istanza, ma non si può sottoclassare né sostituire nei test.
- [ ] **White box** (prove 2022, 2023 e 5/11/2025, sintesi dell'utente [D1]). Trappola: Confondere statement coverage con decision coverage (un while va percorso sia vero sia falso). → Disegna il CFG; statement = ogni nodo; decision = ogni ramo vero/falso di ogni if/while; MC/DC = ogni condizione influenza da sola l'esito.

## Area 1. Specifica dei requisiti

### Obiettivi della specifica dei requisiti (priorità ALTA)

- [ ] Funzionale vs non funzionale
- [ ] Requisito verificabile e non ambiguo
- [ ] Requisito = cosa, non come
- [ ] Costo dell'errore cresce con la fase

### Diagramma UML dei casi d'uso (priorità ALTA)

- [ ] Attori fuori dal confine del sistema
- [ ] include = sempre, extend = condizionale
- [ ] include: base → incluso; extend: estensione → base
- [ ] Generalizzazione tra attori

### Descrizione testuale di un caso d'uso (scenari) (priorità MEDIA)

- [ ] Pre/post condizioni
- [ ] Scenario principale numerato
- [ ] Alternativi ed eccezioni con riferimento al passo

### Esercizio d'esame: use case da un caso di studio testuale (priorità ALTA)

- [ ] Attori = ruoli, non persone
- [ ] Casi d'uso = obiettivi dell'attore
- [ ] Generalizzazione per il cliente tesserato
- [ ] Max 10 minuti
- [ ] Trappola: casi d'uso come passi interni ('salva nel DB')
- [ ] Trappola: freccia extend dalla base all'estensione (è il contrario)

### Input dei requisiti: stakeholder ed elicitazione (priorità MEDIA)

- [ ] Stakeholder ≠ utente finale
- [ ] Interviste, questionari, osservazione, workshop, prototipi
- [ ] Conflitti tra stakeholder vanno negoziati

### Processo di specifica dei requisiti e documento SRS (priorità ALTA)

- [ ] Elicitazione → analisi → specifica → validazione → gestione
- [ ] Sezioni SRS
- [ ] Qualità: corretto, non ambiguo, completo, coerente, verificabile, tracciabile

### Costo degli errori nei requisiti (curva di Boehm) (priorità ALTA)

- [ ] Trappola: dire 'costa un po' di più' → risposta attesa: cresce di ordini di grandezza con la fase
- [ ] Citare review, prototipi, stakeholder, tracciabilità
- [ ] Un esempio concreto vale punti

### Scrivere requisiti verificabili (priorità MEDIA)

- [ ] Atomico, misurabile, testabile
- [ ] NF sempre quantificati
- [ ] Un requisito = un criterio di accettazione

### Esercizio d'esame: domanda teorica sui requisiti (priorità ALTA)

- [ ] Scaletta 5 fasi
- [ ] Risposta attesa: chiudere con il costo degli errori tardivi (Boehm)
- [ ] 1 esempio F + 1 NF
- [ ] Qualità SRS
- [ ] Perché costa correggere tardi


## Area 2. Progettazione

### Diagramma UML delle classi (priorità ALTA)

- [ ] Visibilità + - # ~
- [ ] Corsivo/<<abstract>> per classi astratte
- [ ] Composizione = rombo pieno, ciclo di vita legato
- [ ] Trappola: mettere chiavi esterne come attributi (è un modello OO, non un DB)

### Associazioni: molteplicità, navigabilità, ruoli (priorità ALTA)

- [ ] Molteplicità su ENTRAMBI gli estremi
- [ ] Molteplicità vicino alla classe a cui si riferisce
- [ ] Freccia = navigabilità = attributo in Java
- [ ] Trappola: mettere la molteplicità dal lato sbagliato
- [ ] 0..1 vs 1: obbligatorietà

### Esercizio d'esame: class diagram da un caso di studio (priorità ALTA)

- [ ] Sostantivi → classi/attributi, verbi → operazioni
- [ ] Tipi agli attributi
- [ ] Stato come enum o attributo (serve per lo state diagram)
- [ ] Trappola: diagramma senza operazioni → il sequence non è coerente

### Diagramma UML degli stati (state machine) (priorità ALTA)

- [ ] Etichetta: evento [guardia] / azione
- [ ] Stato = condizione stabile, non un'azione (Trappola: 'Pagare' come stato)
- [ ] Stati = valori dell'enum nel class diagram
- [ ] Stato iniziale obbligatorio, finale se il ciclo termina

### Diagramma UML di attività (priorità ALTA)

- [ ] Rombo = decisione/merge, barra = fork/join
- [ ] Guardie tra [ ] su ogni uscita, mutuamente esclusive
- [ ] Un solo nodo iniziale
- [ ] Trappola: usare fork per una scelta alternativa

### Diagramma UML di sequenza (priorità ALTA)

- [ ] Lifeline = oggetto :Classe
- [ ] alt (if/else), opt (if), loop
- [ ] Messaggio = operazione della classe destinataria
- [ ] Trappola: messaggi verso classi non associate/navigabili

### Obiettivi della progettazione: alto livello e dettaglio (priorità MEDIA)

- [ ] Alto livello = componenti + interfacce
- [ ] Dettaglio = classi, algoritmi, dati
- [ ] NF guidano l'architettura

### Coesione e accoppiamento dei moduli (priorità ALTA)

- [ ] Scala della coesione (coincidentale, logica, temporale, procedurale, comunicativa, sequenziale, funzionale)
- [ ] Scala dell'accoppiamento (contenuto, comune, controllo, stamp, dati)
- [ ] Obiettivo: alta coesione, basso accoppiamento
- [ ] Trappola: invertire gli estremi delle scale

### Design pattern: concetto e classificazione (priorità ALTA)

- [ ] Tre categorie GoF
- [ ] Nome/problema/soluzione/conseguenze
- [ ] Ogni pattern ha anche LIMITI (vanno scritti all'esame)

### Pattern Composite (priorità ALTA)

- [ ] Albero parte-tutto + trattamento uniforme
- [ ] Composite contiene 0..* Component (ricorsione)
- [ ] Limite: vincolare i tipi dei figli
- [ ] Trappola: far ereditare Settore da Scaffale invece di usare l'interfaccia comune

### Pattern Adapter (priorità MEDIA)

- [ ] Target, Adapter, Adaptee
- [ ] Object adapter (composizione) preferibile
- [ ] Adapter cambia interfaccia; Decorator la mantiene

### Pattern Singleton (priorità MEDIA)

- [ ] Costruttore privato + static getInstance
- [ ] Thread safety (eager/holder/enum)
- [ ] Limiti: stato globale, test

### Pattern State (priorità MEDIA)

- [ ] Una classe per stato, il contesto delega
- [ ] Le transizioni le decidono gli stati (≠ Strategy)
- [ ] Mappa diretta da state diagram

### Principi SOLID (priorità MEDIA)

- [ ] S: una ragione di cambiamento
- [ ] O: estendi senza modificare
- [ ] L: sottotipo sostituibile
- [ ] I: interfacce piccole
- [ ] D: dipendi da astrazioni
- [ ] Trappola: SRP non è 'un solo metodo'

### Coesione dei componenti (Clean Architecture): REP, CCP, CRP (priorità ALTA)

- [ ] REP = riuso/rilascio, CCP = cambiano insieme (SRP), CRP = usate insieme (ISP)
- [ ] Risposta attesa: citare la tensione (triangolo) tra i tre
- [ ] Trappola: confonderli con i principi di accoppiamento (ADP, SDP, SAP)
- [ ] Esempio concreto di suddivisione

### Pattern Decorator (priorità ALTA)

- [ ] Parole chiave: opzioni/accessori/supplementi combinabili
- [ ] Decorator È un Component E HA un Component
- [ ] Costo = costo avvolto + supplemento
- [ ] Trappola: usare sottoclassi per ogni combinazione (esplosione di classi)

### Pattern Observer (priorità ALTA)

- [ ] Uno-a-molti, iscrizione dinamica
- [ ] Subject: attach/detach/notify; Observer: update
- [ ] Push vs pull
- [ ] Limiti: ordine notifiche, cascata, memory leak
- [ ] Parole chiave nello scenario: iscriversi, notificare, avvisare, mailing list

### Simple Factory e static factory method (priorità ALTA)

- [ ] Non è GoF: è un idioma
- [ ] Pro static: niente istanza, punto unico, nome espressivo
- [ ] Contro static: niente override, difficile da mockare, viola OCP
- [ ] Risposta attesa: nome del pattern + pro + contro, in 5-6 righe

### Pattern Strategy (priorità ALTA)

- [ ] Algoritmi intercambiabili, scelti dal client
- [ ] Elimina switch sul tipo (OCP)
- [ ] Diverso da State: in State le transizioni le decide lo stato stesso

### Pattern Template Method (priorità ALTA)

- [ ] Metodo template final + passi abstract/hook
- [ ] Ereditarietà (TM) vs composizione (Strategy)
- [ ] Parole chiave: 'segue sempre gli stessi passi, ma...'
- [ ] Trappola: rendere il template ridefinibile (va final)

### Riconoscere il pattern dallo scenario (priorità ALTA)

- [ ] Albero → Composite
- [ ] Iscriviti/avvisa → Observer
- [ ] Opzioni combinabili con costo → Decorator
- [ ] Stessi passi, varianti → Template Method
- [ ] Algoritmo scelto a runtime → Strategy
- [ ] Trappola: scegliere Strategy quando le opzioni si sommano (è Decorator)

### Esercizio d'esame: pattern motivato + class diagram + Java minimo (priorità ALTA)

- [ ] Scaletta: pattern, perché, alternativa scartata, limiti, diagramma, Java
- [ ] Ruoli del pattern annotati sulle classi del dominio
- [ ] Trappola: dimenticare i LIMITI (chiesti esplicitamente)
- [ ] Java minimo: interfaccia + 2 classi + metodo chiave

### Esercizio d'esame: riconoscere il pattern dal codice (priorità ALTA)

- [ ] static + switch + new → Simple Factory
- [ ] Costruttore privato + getInstance → Singleton
- [ ] Riceve e avvolge lo stesso tipo → Decorator
- [ ] Lista di listener + notify → Observer

### Pattern Factory Method (priorità MEDIA)

- [ ] Metodo factory astratto + sottoclassi
- [ ] Spesso usato dentro un Template Method
- [ ] Tabella: Simple (switch) / Method (ereditarietà) / Abstract (famiglie)

### Pattern Abstract Factory (priorità MEDIA)

- [ ] Famiglie di prodotti coerenti
- [ ] Facile aggiungere famiglie, difficile aggiungere prodotti
- [ ] Factory iniettata nel client

### Caratteristiche di qualità del progetto (priorità MEDIA)

- [ ] Qualità esterne vs attributi interni
- [ ] ISO 9126/25010: 6-8 caratteristiche
- [ ] Manutenibilità ← coesione/accoppiamento

### Metriche software (priorità MEDIA)

- [ ] Dimensione, complessità, OO (CK)
- [ ] Per la metrica scelta: definizione, formula, esempio, interpretazione, limiti
- [ ] Trappola: dire che una metrica misura direttamente la 'qualità'

### Clean Architecture: accoppiamento tra componenti (priorità MEDIA)

- [ ] ADP: dipendenze acicliche
- [ ] SDP: dipendere da componenti più stabili
- [ ] SAP: componenti stabili sufficientemente astratti
- [ ] I=Ce/(Ca+Ce), A=astratti/totale, A+I=1
- [ ] Nessuna soglia del docente attribuita

### Calcolare la complessità ciclomatica (priorità MEDIA)

- [ ] V(G)=E−N+2 = decisioni+1
- [ ] Contare && e || come decisioni se si conta per condizioni
- [ ] Verificare con due formule

### Esercizio d'esame: domanda teorica sulle metriche (priorità MEDIA)

- [ ] Scaletta in 4 punti
- [ ] Esempio numerico
- [ ] Limiti delle metriche

### Stili architetturali (priorità MEDIA)

- [ ] Layered, client-server, pipe&filter, MVC, event-driven, repository
- [ ] Ogni stile: qualità favorite e limiti
- [ ] Trappola: confondere MVC (stile/pattern di presentazione) con 3-tier

### Decomposizione funzionale (priorità BASSA)

- [ ] Top-down: funzione → sottofunzioni
- [ ] Confronto con OO: dati incapsulati

### Diagramma UML dei package (priorità MEDIA)

- [ ] Package = raggruppamento logico
- [ ] Freccia dal package dipendente a quello usato
- [ ] «import» e «access» specificano l’accesso
- [ ] Package ≠ componente ≠ deployment

### Esercizio d'esame: sequence, activity e state coerenti con le classi (priorità ALTA)

- [ ] Checklist finale: ogni messaggio è un'operazione?
- [ ] Ogni messaggio segue un'associazione navigabile?
- [ ] Stati = valori dell'enum?
- [ ] Azioni dell'activity = casi d'uso/operazioni?

### Esercizio: tesina individuale del corso (priorità ALTA)

- [ ] Prodotto software
- [ ] Requisiti e diagrammi UML
- [ ] Revisione del progetto con pattern
- [ ] Criteri nominati, senza inventare pesi
- [ ] Scadenze e formati: [da verificare sulla scheda S1]

### Design pattern Builder (priorità BASSA)

- [ ] Prodotto separato dalla costruzione
- [ ] Metodi fluenti e build()
- [ ] Validazione degli invarianti
- [ ] Studio dentistico ricostruito da [D1]
- [ ] Builder ≠ Factory ≠ Decorator

### Banca esercizi: pattern di progettazione (prove Guerra) (priorità ALTA)

- [ ] Accessori combinabili con costo → Decorator
- [ ] Stessi passi con varianti → Template Method
- [ ] Iscriviti/avvisa → Observer
- [ ] Creazione con switch → Simple Factory
- [ ] Algoritmo scelto a runtime → Strategy
- [ ] Scrivere sempre i LIMITI del pattern scelto

### Object Relational Mapping, problematiche e JPA/Hibernate (priorità BASSA)

- [ ] Impedance mismatch: identità, ereditarietà, associazioni, granularità
- [ ] FK sul lato molti
- [ ] Lazy/eager e N+1

### Diagrammi UML di componenti e deployment (priorità BASSA)

- [ ] Interfaccia fornita = lollipop, richiesta = socket
- [ ] Deployment: nodi, artefatti, canali


## Area 3. Implementazione e testing

### Testing: livelli, tipi e terminologia (priorità ALTA)

- [ ] Error → fault → failure
- [ ] Unit, integration, system, acceptance + regressione
- [ ] Verifica ≠ validazione
- [ ] Il testing mostra la presenza di difetti, non la loro assenza

### Black box e white box testing (priorità ALTA)

- [ ] Black box = dalla specifica
- [ ] White box = dal codice
- [ ] Sono complementari

### Partizione in classi di equivalenza (priorità ALTA)

- [ ] Valide + non valide per ogni parametro
- [ ] Un caso non valido per volta
- [ ] I casi validi possono coprire più classi

### Analisi dei valori limite (Boundary Value Analysis) (priorità ALTA)

- [ ] min-ε, min, min+ε, max-ε, max, max+ε
- [ ] ε = 1 per gli int, 0,1 per i double (scrivilo nella risposta)
- [ ] I limiti esclusi (<60) vanno testati da tutte e due le parti
- [ ] Test parametrici JUnit

### Grafo di flusso di controllo (CFG) (priorità ALTA)

- [ ] if = 2 archi; while = arco di ritorno
- [ ] Condizioni composte espanse
- [ ] Numera nodi e archi

### Criteri di copertura: statement, decision, condition, MC/DC (priorità ALTA)

- [ ] Statement ⊂ decision ⊂ MC/DC ⊂ multiple condition
- [ ] Condition coverage NON implica decision coverage
- [ ] MC/DC: n+1 test, ogni condizione cambia da sola l'esito

### Esercizio d'esame: black box su una funzione a scaglioni (classi di equivalenza + BVA) (priorità ALTA)

- [ ] FORMULARIO: retta numerica → classi V/NV → test minimi (un NV per volta) → TB min-ε/min/min+ε e max-ε/max/max+ε → output atteso
- [ ] Dichiara sempre ε e se i limiti sono inclusi o esclusi
- [ ] Classe valida senza limite superiore: testa un valore grande
- [ ] Segnala i salti di prezzo o i buchi tra scaglioni
- [ ] Scrivi l'output atteso numerico per OGNI caso

### Banca esercizi: classi di equivalenza e boundary value analysis (prove Guerra) (priorità ALTA)

- [ ] Uno scaglione = una classe valida
- [ ] Una sola classe non valida per test (error masking)
- [ ] Valori limite esattamente ai bordi delle classi
- [ ] Se la formula è '[da verificare]', l'output non è certo

### Buona programmazione e best practices (priorità MEDIA)

- [ ] DRY, KISS, YAGNI, SRP
- [ ] Nomi parlanti > commenti
- [ ] Stile condiviso nel team

### Code smell (priorità MEDIA)

- [ ] Smell ≠ bug
- [ ] Long Method → Extract Method
- [ ] Duplicated Code → Extract Method/Pull Up
- [ ] Switch → Replace Conditional with Polymorphism

### Refactoring (priorità ALTA)

- [ ] Stesso comportamento esterno, struttura migliore
- [ ] Piccoli passi + test verdi
- [ ] Extract Method, Rename, Move Method, Replace Conditional with Polymorphism

### Domanda d'esame: refactoring (cos'è, a cosa serve, rischi) (priorità ALTA)

- [ ] Definizione → scopi → quando → come → esempi → rischi
- [ ] Rischio principale: regressioni senza test

### Ottimizzazione del codice e ottimizzazione prematura (priorità ALTA)

- [ ] TRAPPOLA: 'ottimizzare sempre e subito' è sbagliato. Prima si misura, poi si ottimizza
- [ ] Knuth 1974: 97% premature optimization, ma non trascurare il 3% critico
- [ ] Make it work → right → fast
- [ ] Profiler → hotspot → algoritmo prima delle micro-ottimizzazioni → nuova misura + test

### Commenti nel codice (priorità MEDIA)

- [ ] Commenta contratti, motivazioni e invarianti non ovvi
- [ ] Non parafrasare codice evidente
- [ ] Javadoc per API quando appropriato
- [ ] TODO/FIXME contestualizzati e temporanei
- [ ] Se serve un commento lungo, valuta refactoring

### Path analysis e complessità ciclomatica di McCabe (priorità MEDIA)

- [ ] V(G) = E − N + 2 = decisioni + 1
- [ ] = n° minimo di test per la basis path coverage
- [ ] Le condizioni composte contano: dichiara la convenzione

### Esercizio d'esame: da codice a CFG e test minimi per la copertura (priorità ALTA)

- [ ] CFG → tabella decisioni → test minimi con output atteso
- [ ] Un ciclo con 2 iterazioni può coprire T e F dell'if con un solo test
- [ ] Indica sempre il cammino coperto

### Controllo di versione con Git (priorità MEDIA)

- [ ] working tree → staging → commit → push
- [ ] branch = puntatore; merge vs rebase
- [ ] Conflitti: marcatori, add, commit

### Ispezione e revisione del codice (priorità MEDIA)

- [ ] Statica: non esegue il codice
- [ ] Fagan: ruoli + 6 fasi + checklist
- [ ] Nella riunione si trovano i difetti, non si correggono

### Programmazione difensiva e asserzioni (priorità MEDIA)

- [ ] Valida gli input pubblici → eccezione
- [ ] assert per gli invarianti interni (-ea)
- [ ] Pre-, postcondizioni, invarianti

### Unit testing con JUnit 5 (priorità MEDIA)

- [ ] @Test, @BeforeEach, assertEquals(atteso, effettivo, delta)
- [ ] assertThrows per le eccezioni
- [ ] @ParameterizedTest + @CsvSource = tabella BVA
- [ ] TDD: red → green → refactor

### Debugging e processo di debugging (priorità ALTA)

- [ ] Riproduci → localizza → causa radice → correggi → test di regressione
- [ ] Testing ≠ debugging
- [ ] Bisezione (git bisect), breakpoint, log

### Analisi statica del codice (priorità BASSA)

- [ ] Statica: analizza senza eseguire
- [ ] Ispezione: revisione umana
- [ ] Dinamica: esegue su input
- [ ] Warning non prova bug né correttezza
- [ ] Verifica contesto e limiti dello strumento

### Build automation con Maven (priorità BASSA)

- [ ] pom.xml: GAV + dependencies + scope
- [ ] validate → compile → test → package → verify → install → deploy
- [ ] Convenzione sulle cartelle

### Banca domande: teoria ricorrente (prove Guerra) (priorità ALTA)

- [ ] Definizione in 1-2 frasi
- [ ] Esempio concreto
- [ ] Limite o contesto di applicazione
- [ ] Non citare punteggi o durate non documentati (§1.2 del piano)


## Area 4. Distribuzione e manutenzione

### Gestione delle configurazioni (SCM) (priorità MEDIA)

- [ ] CI, baseline, change control, status accounting, audit
- [ ] CCB approva le modifiche
- [ ] Riproducibilità delle release

### Licenze software: proprietarie, permissive e copyleft (priorità MEDIA)

- [ ] Permissive: MIT, Apache 2.0 (+ brevetti)
- [ ] Copyleft forte: GPL; debole: LGPL; rete: AGPL
- [ ] Gli obblighi scattano con la distribuzione
- [ ] Senza licenza = tutti i diritti riservati

### Copyleft e compatibilità tra licenze (priorità MEDIA)

- [ ] Permissiva → dentro la GPL: sì
- [ ] Apache 2.0 + GPLv3: sì; + GPLv2: no
- [ ] GPL dentro un prodotto proprietario distribuito: no
- [ ] LGPL con collegamento dinamico: sì

### Integrazione e consegna continua (CI/CD) (priorità BASSA)

- [ ] CI = integrare spesso + build e test automatici
- [ ] Delivery = sempre rilasciabile; deployment = rilascio automatico
- [ ] Una build rotta si ripara subito

### Versionamento semantico e changelog (priorità BASSA)

- [ ] MAJOR = incompatibile, MINOR = feature, PATCH = fix
- [ ] Incrementando MAJOR si azzerano MINOR e PATCH

### Rilascio e post-produzione (priorità BASSA)

- [ ] alpha → beta → RC → GA → EOL
- [ ] Le segnalazioni post-rilascio alimentano la manutenzione

### Manutenzione del software: tipi e costi (priorità MEDIA)

- [ ] Correttiva, adattiva, perfettiva, preventiva
- [ ] La manutenzione è la parte più costosa del ciclo di vita
- [ ] Leggi di Lehman


## Area 5. Ingegneria del software AI-native

### LLM e agenti nel ciclo di vita del software (priorità MEDIA)

- [ ] LLM = previsione probabilistica di token
- [ ] Agente = LLM + strumenti + ciclo
- [ ] Un uso per ogni fase, sempre con verifica umana

### Assistenti AI per generazione, comprensione, modifica, refactoring e testing (priorità MEDIA)

- [ ] Prompt = contesto + specifica + vincoli + casi limite
- [ ] Compiti piccoli, diff revisionati
- [ ] Valori attesi ricalcolati a mano

### Opportunità, limiti e rischi del codice generato (priorità MEDIA)

- [ ] Allucinazioni, casi limite, sicurezza, prompt injection, licenze, debito tecnico, eccesso di fiducia
- [ ] Per ogni rischio: una mitigazione

### Verifica umana del codice generato (priorità MEDIA)

- [ ] Lo sviluppatore resta responsabile
- [ ] Test dalla specifica, non dal codice generato
- [ ] Bug ai limiti: usa la BVA
- [ ] Benchmark ≠ garanzia

### Domanda d'esame: ingegneria del software AI-native (priorità MEDIA)

- [ ] Definizione → usi → opportunità → rischi → verifica umana → conclusione
- [ ] Collega sempre alle tecniche del corso
