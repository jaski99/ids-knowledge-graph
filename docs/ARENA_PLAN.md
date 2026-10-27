# Piano di lavoro Arena — round 2

Il piano vincolante, inclusi ID, confini, contratti e ordine di integrazione, è [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md). Questo documento è un indice, non una versione alternativa del piano.

| Worker | Responsabilità | Scope preciso |
|---|---|---|
| X1 | Programma, priorità, mappatura e NODES | [Piano §3, X1](IMPROVEMENT_PLAN.md) |
| X2 | Nuovi nodi di programma e relative lezioni | [Piano §2–3, X2](IMPROVEMENT_PLAN.md) |
| X3 | Banche di esercizi e domande | [Piano §2–3, X3](IMPROVEMENT_PLAN.md) |
| X4 | Correzioni delle lezioni esistenti | [Piano §3, X4](IMPROVEMENT_PLAN.md) |
| X5 | Web app e CI | [Piano §3, X5](IMPROVEMENT_PLAN.md) |
| X6 | Simulatore d'esame | [Piano §3, X6](IMPROVEMENT_PLAN.md) |

I worker operano solo sul proprio ramo di sessione `arena/*`, senza aprire o fondere PR; il coordinatore integra nell'ordine **X1 → X4 → X2 → X3 → X6 → X5 → integrazione**. Nessun worker tocca file fuori dal proprio scope: se necessari, li segnala. I nuovi nodi usano part separati; archi fra worker e mappatura dei nuovi ID sono compito dell'integrazione.

Contratti tecnici: [CONTRACTS.md](CONTRACTS.md). Fonti e formati separati: [SYLLABUS.md](SYLLABUS.md), [EXAM_FORMAT.md](EXAM_FORMAT.md). I file generati si rigenerano, non si risolvono a mano; i test completi e le limitazioni vanno riportati secondo il piano.
