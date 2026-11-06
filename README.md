# Nomal!

A static Swiss German song and translation website for GitHub Pages.

## Add a song

1. Choose a new ID, such as `02`.
2. Create `02_de.txt` and `02_en.txt` in the repository root.
3. Put the song title on the **first line** of each file. The remaining lines are the lyrics, with blank lines separating verses.
4. Add `{ "id": "02" }` to `songs.json`, keeping valid JSON commas between entries.
5. Commit the changes. GitHub Pages will deploy automatically.

The homepage reads the title from the first line of each `_de.txt` file. A song opens using `?song=02`. The original and translation display side by side on desktop and stack on mobile.

## Deploy

Upload `index.html`, `songs.json`, and the song `.txt` files to the root of your public GitHub repository. In Settings > Pages, publish the `main` branch from `/ (root)`.

To test locally, use a local web server, e.g. `python -m http.server 8000`, and visit `http://localhost:8000/`. Opening `index.html` directly as a `file://` URL will usually block `fetch()`.

The example lyrics are original placeholder text. Replace them with content you have permission to publish.
