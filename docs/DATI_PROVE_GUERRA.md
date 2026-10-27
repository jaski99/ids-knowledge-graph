# Ingegneria del Software UNIMORE (prof. Francesco Guerra) — sintesi dell'utente su 13 prove 2017-2025
Fonte: analisi fornita dall'utente (25-27/10/2026). Le prove originali NON sono disponibili: usare solo questa sintesi + fonti pubbliche verificate. Modello strutturale ispiratore: https://github.com/withmarbleapp/os-taxonomy (DAG di prerequisiti hard/soft con motivazione, criteri di padronanza, tipi di nodo).

## 1. Esame
Struttura fissa in 3 parti: Design 14-16 pt (60-85 min), Testing 3-5 pt (10-20 min), Teoria 10-11 pt (30 min). Durata 1h15, 1h20, 2h o 2h15. Soglia >17/30 oppure >18/20 a seconda dell'appello. Obiettivo utente: 30 e lode. Testing = parte piu' meccanica e redditizia; design = la piu' ampia; teoria ripetitiva con risposte brevi.

## 2. Parte 1 Design
Diagrammi (frequenza, punti): Use Case sempre 1-2; Class Diagram sempre 4-6 (classi, attributi, metodi, associazioni, molteplicita', direzione); Sequence quasi sempre 1-5 (processo principale); Activity quasi sempre 2-3 (flusso completo); State quasi sempre 1-2 (stati di un'entita': ordine, prenotazione, visita, noleggio, sosta, riparazione, acquisto).
Scenari: sistemi gestionali con utenti, oggetti prenotabili/vendibili, stati, contatori dinamici, notifiche/sconti automatici, report giornalieri. Visti: Farmacia (medicinali/cosmetici, vendite, prenotazioni, tessera fedelta', mailing list), Piscina (abbonamenti, accessi, badge, capienza, top ten mensile), Negozio alimentari (ordini online, prodotti generici/vegetariani, soglie min/max, reintegro), Presenze universitarie (edifici, aule, capienza, registrazione giornaliera), Rider (consegne, quartieri, ristoranti, clienti, top ten), Halloween (squadre, luoghi, bottino caramelle/cioccolatini), Laboratorio riparazioni (preventivo, riparazione, componenti, reclami), Mercato ambulanti (piazzole normali/premium, prenotazioni, lotteria), Laboratorio informatico (postazioni, aree, prenotazioni, attivita' progettuali), Sosta a pagamento (zone, vie, borsellino virtuale, multe), Studio dentistico (pazienti, visite, fascicolo sanitario, pagamenti), Musei (reperti, teche, prenotazioni, capienza, recensioni), Noleggio auto (mini/economy/lusso, accessori, parcheggi, danni).
Pattern ricorrenti: Decorator (oggetti base + accessori/optional che modificano costo/descrizione: aule con microfoni, piazzole con corrente, postazioni con monitor, visite luxury, consegne delicate; Open/Closed, composizione, evita esplosione di sottoclassi); Template Method (procedura fissa con passi variabili: ordini con imballaggio speciale, controllo auto, riparazione; riuso, inversione di controllo, hook); Observer (notifiche automatiche: mailing list promozioni 2025, arrivo prodotto; disaccoppiamento, publish/subscribe, O/C); Factory (varianti prodotto: cioccolatini 'cioba' standard/bianco/mini; incapsulamento creazione, DIP); Strategy (varianti di algoritmo: resistenza in 3 modalita'; O/C, composizione, elimina condizionali). Piu' frequenti: Decorator e Template Method; Observer anche in teoria.
Coerenza tra diagrammi: ogni messaggio del Sequence = metodo pubblico nel Class Diagram; stati dello State = attributi/stati di una classe del Class; l'Activity usa operazioni delle classi progettate; molteplicita' e direzioni delle associazioni sempre indicate.

## 3. Parte 2 Testing
Schema: funzioni con 3-4 parametri, soglie numeriche, casi non gestiti oltre un limite; richiesti equivalence class e boundary conditions sul parametro principale.
Funzioni (anno): 
1) calcolaCostoSpedizione(int numero,int peso,int tariffa) 2025: 2 EUR fino a 50 pagine incluso; tariffa*peso*numero per 51-150; 450*peso*numero per 151-500; non gestiti >500 pagine e peso >1 kg. Boundary numero: 50,51,150,151,500,501.
2) calcolaCostoAccessi(int num,float sconto,float costo,int Quota_fissa) 2023: num*costo+quota_fissa se <10; num*costo*sconto+quota_fissa 10-29; num*costo*sconto*0.5+quota_fissa 30-49; non gestito >=50. Boundary num: 9,10,29,30,49,50.
3) calcolaCostoSpedizione(int km,double peso,int tariffa) 2017-01: 1 EUR se peso<0.5; tariffa*km*peso 0.5-5 escluso; 2*tariffa*km*peso 5-10 escluso; non gestite tratte>2000 km e peso>10. Boundary peso: 0.49,0.5,4.99,5,9.99,10.
4) costoPulizia(int dimensione,float costo1,float costo2,float cf) 2021-02: cf se <50 mq; cf+dimensione*costo1 50-150; cf+dimensione*costo1 (probabile costo2) 151-500; non gestite >500. Boundary: 49,50,150,151,500,501.
5) costoconsegna(int distanza,float costo1,float costo2) 2021-04: distanza*costo1 se <=2000 m; formula mancante 2001-5000 (probabile costo2); non gestite >5000. Boundary: 1999,2000,2001,4999,5000,5001.
6) stimaCostoPosa(int lunghezza,int materiale,int manodopera) 2020-11: 15000 EUR fino a 100 m; manodopera*materiale*lunghezza 101-250; 3*manodopera*materiale*lunghezza 251-1000; non gestite >1000. Boundary: 100,101,250,251,1000,1001.
7) calcolaManodopera(int livello_tecnico,float costo_orario,float durata) 2022-01: livello*costo_orario se <1 h; livello*costo_orario*durata 1-3 h; costo_orario*durata >3 h; non gestite >6 h. Boundary durata: 0.99,1,3,3.01,6,6.01.
8) costoPiazzola(float costo,int area,int quota_fissa) 2022-06: quota_fissa se area<15; area*costo+quota_fissa 15-40 escluso; (area-40)*costo*0.8+area*costo+quota_fissa 40-100; non gestite >100. Boundary: 14,15,39,40,100,101.
9) calcolaCostoStampa(int numero,int tariffa1,int tariffa2) 2017-04: 1.5 EUR fino a 200; tariffa1*numero 201-450; 450*tariffa1+tariffa2*numero 451-700; non gestite >700. Boundary: 200,201,450,451,700,701.
10) computeCarSharingFee(int driving_time,int stop_time,int reservation_time) 2018-01-09: 0.10/min driving, 0.05/min stop, 0.10/min reservation (gratis primi 15 min); max 8 ore.
11) computeGroupFee(double basePrice,int n_passengers,int n_under18,double discount) 2018-01-30: n_passengers*basePrice - discount*n_under18*basePrice; max 10 persone, almeno un maggiorenne. Boundary n_passengers: 1,9,10,11.
12) computeBikeSharingFee(int use_time,int stop_time,int km_traveled) 2019-01-09: 0.10/min use, 0.05/min stop, 0.10/km (gratis primi 5 km, costo raddoppiato oltre 50 km). Boundary km: 4,5,6,49,50,51.
13) costo_noleggio(int days,int km,double carModel) 2019-02-19: days*km*carModel se km<1000; 0.85*days*km*carModel altrimenti; non valida >100000 km. Boundary km: 999,1000,1001,99999,100000,100001.
(Alcune formule sono ricostruite/incerte dall'utente: segnare come 'da verificare' dove marcato 'probabile'.)
White box: CFG (nodi = istruzioni/blocchi, archi = flusso), statement coverage, decision coverage, MC/DC (ogni condizione elementare influenza la decisione), path coverage, complessita' ciclomatica V(G)=archi-nodi+2P. Esempio ricorrente 2025:
public static int method(int a,int b){ if(a<0) a=b; a=a+b; while(a<0){ if(b%2==0) b=b/2; a+=3; } return a; }
Chiedono CFG, test per statement coverage, test per decision coverage (a<0, a<0 nel while, b%2==0).

## 4. Parte 3 Teoria (frequenza)
Debugging alta (definizione, fasi riproduzione-diagnosi-correzione-verifica, tecniche); White box alta (statement/decision/MC-DC/path, CFG); Clean architecture/coesione media-alta (coesione REP,CCP,CRP; accoppiamento ADP,SDP,SAP; SOLID; instabilita'/astrattezza); Requisiti alta (elicitation, analysis, specification, validation; errori e correzione); Refactoring media; Observer in Java media (pattern, java.util.Observable/Observer deprecati, listener, PropertyChangeListener); Commenti media (quando commentare, classificazione); Metriche bassa; Post-vendita bassa (manutenzione, assistenza); SOLID media; Analisi statica bassa; Differenze black/white media; Use case per white test bassa; Ingegneria del software bassa.
Risposte sintetiche: Debugging = individuare, isolare e correggere un difetto; fasi riproduzione, diagnosi, correzione, verifica; tecniche breakpoint, logging, test di regressione. White box = test sulla struttura interna. Clean architecture = separazione responsabilita'; coesione REP/CCP/CRP; accoppiamento ADP/SDP/SAP. Requisiti: elicitazione, analisi, specifica, validazione; errori: ambiguita', incompletezza, incoerenza; correzione: prototipazione, revisioni, test di accettazione. Refactoring = migliorare struttura interna senza cambiare comportamento, riduce debito tecnico.

## 5. Riepilogo per anno (scenario | pattern | testing | teoria)
2025-11-05 Farmacia | Observer | calcolaCostoSpedizione | debugging, white box, static factory
2023-01-27 Piscine | Template Method | calcolaCostoAccessi | requisiti, clean architecture, MC/DC, debugging
2017-01-23 Negozio alimentari | Template Method | calcolaCostoSpedizione | implementazione, black/white, Observer Java
2021-02-19 Presenze universitarie | Decorator | costoPulizia | solo testing
2021-04-19 Rider | Decorator | costoconsegna | solo testing
2020-11-04 Halloween | Factory | stimaCostoPosa | solo testing
2022-01-25 Laboratorio riparazioni | Strategy/Factory | calcolaManodopera | commenti, clean architecture, requisiti, post-vendita
2022-06-09 Mercato ambulanti | Decorator | costoPiazzola | ottimizzazione, clean architecture, white box, requisiti
2017-04-11 Lab informatico | Decorator | calcolaCostoStampa | analisi statica, requisiti, Observer Java
2018-01-09 Sosta a pagamento | Template Method | computeCarSharingFee | refactoring, requisiti, white box
2018-01-30 Studio dentistico | Decorator/Builder | computeGroupFee | coesione, requisiti, debugging
2019-01-09 Musei | Decorator | computeBikeSharingFee | refactoring, SOLID, post-release
2019-02-19 Noleggio auto | Template Method | costo_noleggio | ingegneria del software, white box, metriche

## 6. Priorita' di studio suggerita dall'utente
1 Testing meccanico (equivalence class, BVA, CFG, coverage); 2 Class Diagram; 3 Pattern principali (Decorator, Template Method, Observer, Factory, Strategy); 4 Diagrammi dinamici; 5 Teoria ricorrente; 6 Minori (metriche, post-vendita, analisi statica, SOLID).
Istruzioni dell'utente per il grafo: nodi = concetti, pattern, diagrammi, funzioni di testing, domande di teoria; archi = prerequisito, applicazione, similarita', co-occorrenza; priorita' per frequenza nelle prove; ogni esercizio delle prove collegato a piu' nodi; percorsi adattivi (se non padroneggia CFG non proporre Decision Coverage); pattern collegati al principio SOLID soddisfatto; ogni funzione di testing collegata alle sue classi di equivalenza e boundary; ogni domanda di teoria ai sotto-argomenti e alle risposte sintetiche.
