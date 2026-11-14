# Sito Banca dati Mastro (bancadatimastro.it)

Sito statico pubblicato con GitHub Pages dal branch `main` (radice). Dominio: bancadatimastro.it (file `CNAME`).
Proprietario: Ing. Luigi Grosso, Edizioni Mastro. Lingua del sito: italiano.

## Struttura (dal 14/11/2026: sito su più pagine)
- `index.html` — pagina iniziale: introduzione, «mappa del sito» a mattoni, titoli in evidenza, contatti.
- `catalogo/index.html` — catalogo completo, una `<section class="coll" id="…">` per collana: `tempari`, `pm` (project management e appalti), `costruito`, `saggi`, `sole` (edizioni Il Sole 24 Ore).
- `collana-tempari/`, `chi-siamo/`, `materiali/`, `acquista/`, `contatti/` — pagine interne.
- `risorse/<volume>/` — aree materiali riservate (Firebase), `risorse/area.js`; `privacy/` — informativa.
- `img/` — copertine locali; le copertine mancanti sono prese da IBS (`https://www.ibs.it/images/<ISBN>_0_0_0_800_75.jpg`).
- `catalogo.json` — elenco dei titoli presenti sul sito.
- Le pagine sono generate da uno script (tools/site/build.py nella sessione Claude); se si modifica a mano, modificare `catalogo/index.html`.

## Come aggiungere un libro
1. Copia un `<article class="book">` nella sezione giusta di `catalogo/index.html`.
2. Compila copertina, `.series`, `h3`, descrizione di 1–2 frasi presa dalla scheda del libro, prezzi in `.price` (`.tag.solid` per il primo formato), link `<a class="store" …>Acquista</a>` alla scheda IBS.
3. Non inventare dati: prezzi e ISBN solo da fonti (StreetLib, schede IBS/Feltrinelli/Amazon).
4. Aggiorna `catalogo.json` e i conteggi nella mappa di `index.html`.
5. Commit su `main` con messaggio in italiano ("Aggiunto: <titolo>"). Replicare su mastroeditore.com.

Contatti: redazione@mastroeditore.com.
