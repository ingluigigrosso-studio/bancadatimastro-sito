# Sito Banca dati Mastro (bancadatimastro.it)

Sito statico pubblicato con GitHub Pages dal branch `main` (radice). Dominio: bancadatimastro.it (file `CNAME`).
Proprietario: Ing. Luigi Grosso, Edizioni Mastro. Lingua del sito: italiano.

## Struttura
- `index.html` — l'intera pagina (HTML + CSS inline). Nessun build.
- `img/` — copertine in JPG, referenziate come `img/<slug>.jpg`.
- `catalogo.json` — elenco dei titoli già presenti sul sito (usato dal controllo automatico per capire cosa è nuovo).

## Sezioni di index.html
- `#collana` — volumi della collana Banca dati Mastro (tempari, A perfetta regola d'arte, Costi parametrici): griglia `.grid` di `<article class="book">`.
- `#edizioni` — altri titoli di Edizioni Mastro: griglia `.others` di `<article class="book">`.
- `#acquista` — elenco delle librerie online (distribuzione StreetLib).

## Come aggiungere un libro
1. Copia un `<article class="book">` esistente della sezione giusta (collana se è un volume Banca dati Mastro/tempari, altrimenti edizioni).
2. Compila: copertina (`img/<slug>.jpg`, oppure il blocco tipografico `.cover.type` se non c'è immagine), `.series`, `h3`, descrizione di 1–2 frasi presa dalla scheda del libro, `.specs` se ci sono numeri reali, prezzi in `.price` (`.tag.solid` per il primo formato, `.tag` per il secondo). Se esiste la scheda su una libreria, aggiungi sotto i prezzi `<a class="store" href="URL" target="_blank" rel="noopener">Acquista</a>`.
3. Non inventare dati: prezzi, pagine, ISBN solo se presi da fonti (email StreetLib, schede Feltrinelli/IBS/Amazon).
4. Aggiorna `catalogo.json` e, se cambia il numero di volumi della collana, la cifra in `.figures`.
5. Commit su `main` con messaggio in italiano ("Aggiunto: <titolo>").
