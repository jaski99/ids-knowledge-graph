# Registro delle versioni dell'esame

Le righe descrivono **fonti e versioni distinte**: non sono un unico formato invariabile. Il fac-simile e la ricostruzione 2025 sono stati forniti dall'utente; [D1] è la sintesi dell'utente, [S6] una trascrizione di terzi e [S1] la scheda ufficiale della coorte 2026/27. I riferimenti completi sono in [SYLLABUS.md](SYLLABUS.md#fonti) e [IMPROVEMENT_PLAN.md §1.2](IMPROVEMENT_PLAN.md).

## Confronto delle versioni — piano §1.2

| Fonte | Durata | Design | Testing | Teoria | Note |
|---|---|---|---|---|---|
| Prova 5/11/2025, ricostruzione fornita dall'utente | 2 h | 16 pt, 60 min: 1.1 classi 5; 1.2 sequenza + attività + stati 5; 1.3 casi d'uso 2; 1.4 Observer 4 | 3 pt, 10 min: classi di equivalenza + BVA su `numero` | 11 pt, 30 min: debugging 3; Simple Factory/`static` 2; white box e decision coverage 2; CFG + statement/decision coverage 4 | Sufficienza >17/30; nessun materiale. Dati della ricostruzione, non verifica indipendente. |
| Fac-simile 2016/17, fornito dall'utente | 2 h | 13 pt, ~1 h: 1.1 use case + classi 3; 1.2 sequenza 3; 1.3 attività 2; 1.4 pattern 5 | 7 pt, ~20 min | 10 pt, ~40 min | Soluzione 1.4 indicata come ufficiale nel materiale fornito: Composite. |
| Prova 13/01/2017 [S6], Studocu, fonte terza | 2h15 | 14 pt, 70 min | 6 pt, 20 min | 10 pt, 30 min | Punti per singola consegna non riportati nella ricerca R3. Non è una fonte istituzionale. |
| Sintesi dell'utente 2017–2025 [D1 §1] | 1h15, 1h20, 2 h o 2h15 | 14–16 pt (60–85 min) | 3–5 pt (10–20 min) | 10–11 pt (30 min) | Soglia >17/30 oppure >18/20 secondo l'appello. Originali non disponibili. |
| Scheda 2026/27 [S1] | 2 h | Esercizi di design con UML e pattern | Esercizi su una funzione | 3–4 domande aperte | Pesi 30%/55%/55%, somma **140%**: incoerenti, non calcolare un voto; tesina separata. |

I tempi per singola parte sono riportati come nelle rispettive fonti; eventuale tempo non attribuito e differenze di somma sono **[da verificare]**, non vanno riempiti per supposizione. Gli intervalli di [D1] non vanno combinati per ricostruire un appello preciso.

## Fac-simile 2016/17 — materiale fornito dall'utente

- **Design:** caso testuale, ad esempio biblioteca; use case e class diagram; sequence coerente con le classi; activity; pattern motivato con limiti, class diagram e classi Java minime. La soluzione 1.4 del materiale fornito indica Composite.
- **Testing:** black box su una funzione Java, ad esempio `luggageCost(int,double)`: classi di equivalenza, test minimi validi/non validi e boundary conditions sui casi validi.
- **Teoria:** domande aperte, ad esempio processo di specifica dei requisiti, metriche e una metrica a scelta, refactoring con scopo e rischi.

## Prova 5/11/2025 — ricostruzione fornita dall'utente

- **Design:** caso farmacia; 1.1 class diagram con proprietà, operazioni, direzione e molteplicità; 1.2 sequence dell'ordine cliente con tessera, activity dell'app e state degli stati di un acquisto, coerenti con le classi; 1.3 use case; 1.4 Observer per mailing list/promozioni, motivazione, class diagram e Java minimo.
- **Testing:** black box `calcolaCostoSpedizione(int numero,int peso,int tariffa)` a fasce (fino a 50, 51–150, 151–500; peso fino a 1000 g): classi di equivalenza e BVA sul solo `numero`. Per i limiti e le formule si consulti [D1] come sintesi dell'utente, non come originale verificato.
- **Teoria:** debugging e processo; Simple Factory dal codice e pro/contro di `static`; white box e decision coverage; dato un metodo con `if`/`while`, CFG e test minimi per statement e decision coverage.

## Prova del 13/01/2017 — [S6], fonte terza

La trascrizione Studocu riporta una prova storica con scenari di ristorante e alberi addobbati, modellazione UML e pattern, una funzione di pedaggio a fasce per classi di equivalenza e valori limite, domande su SRS, coesione/accoppiamento e composizione/ereditarietà [S6]. I punti e i tempi documentati per parte sono **solo quelli della tabella**. Non confondere questa prova con il diverso appello e scenario di gennaio riportati nella sintesi dell'utente [D1].

## Prove del 9/6/2022 e 27/1/2023 — sintesi dell'utente

Gli originali non sono disponibili; i dettagli seguenti sono dati dell'utente [D1] e della documentazione già fornita, non trascrizioni autenticate.

- **2022:** mercato ambulanti, Decorator per accessori opzionali delle piazzole; black box `costoPiazzola` a scaglioni; teoria su ottimizzazione, coesione dei componenti REP/CCP/CRP, statement/decision coverage ed errori nei requisiti e costo di correzione.
- **2023:** piscine, badge, accessi, servizi e top ten; Template Method; black box `calcolaCostoAccessi` a scaglioni; teoria su REP/CCP/CRP, MC/DC, processo dei requisiti e debugging.

## Sintesi dell'utente 2017–2025 — [D1]

Nella sintesi dell'utente, i diagrammi sono qualificati così: use case **sempre** (1–2 pt); class diagram **sempre** (4–6 pt); sequence **quasi sempre** (1–5 pt); activity **quasi sempre** (2–3 pt); state **quasi sempre** (1–2 pt). Sono dati qualitativi e intervalli della sintesi, non punteggi da assegnare a una prova specifica [D1 §2].

Il piano [§1.3](IMPROVEMENT_PLAN.md) conta gli argomenti riportati nella tabella di [D1]: per esempio testing black box a scaglioni in **13 prove su 13 secondo la sintesi dell'utente**. I conteggi per pattern e teoria sono indicati nella mappatura generata [NODES.md](NODES.md), con il tema generale e la provenienza. Non significano che ogni sotto-abilità o domanda specifica sia comparsa in tutte quelle prove. Le formule marcate «probabile» o mancanti in [D1] sono **[da verificare]**.

## Scheda 2026/27 — [S1]

La scheda ufficiale descrive lo scritto di 2 ore con domande aperte, design e testing, e una **tesina individuale** distinta; menziona il package diagram e l'unità AI-native. Le percentuali 30%/55%/55% sommano 140%: **non normalizzarle e non calcolare un voto** finché non sono chiarite. Le consegne e i tempi storici non completano automaticamente questa modalità. Vedi [SYLLABUS.md](SYLLABUS.md#s1-scheda-ufficiale-202627).
