'use strict';
const list = document.getElementById('song-list');
const view = document.getElementById('song-view');
const search = document.getElementById('search');
let songs = [];
let selected = -1;
let requestNumber = 0;

function message(text, error = false) {
  view.replaceChildren();
  const p = document.createElement('p');
  p.className = error ? 'error' : 'muted';
  p.textContent = text;
  view.append(p);
}

function renderList() {
  list.replaceChildren();
  const query = search.value.trim().toLocaleLowerCase();
  songs.forEach((song, index) => {
    if (!song.title.toLocaleLowerCase().includes(query)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'song-link' + (index === selected ? ' active' : '');
    button.textContent = song.title;
    button.addEventListener('click', () => showSong(index));
    list.append(button);
  });
  if (!list.children.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'No matching songs.';
    list.append(p);
  }
}

function lyricsOnly(text) {
  // TXT format: title, artist credit, blank line, lyrics.
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines.length >= 3 && /^by\s+/i.test(lines[1].trim())) {
    return lines.slice(3).join('\n').trim();
  }
  return text.trim(); // also supports legacy lyrics-only files
}

function alignedLyrics(deText, enText) {
  const wrapper = document.createElement('div');
  wrapper.className = 'lyrics-panel';
  const grid = document.createElement('div');
  grid.className = 'lyrics-grid';
  for (const [label, lang] of [['Schwiizerdütsch', 'de'], ['English', 'en']]) {
    const heading = document.createElement('h3');
    heading.textContent = label;
    heading.className = 'lyrics-column-heading';
    heading.lang = lang;
    grid.append(heading);
  }
  const deLines = lyricsOnly(deText).split('\n');
  const enLines = lyricsOnly(enText).split('\n');
  for (let i = 0; i < Math.max(deLines.length, enLines.length); i++) {
    for (const [line, lang] of [[deLines[i] || '', 'gsw'], [enLines[i] || '', 'en']]) {
      const cell = document.createElement('div');
      cell.className = 'lyric-line' + (!line.trim() ? ' stanza-gap' : '');
      cell.lang = lang;
      cell.textContent = line || '\u00a0';
      grid.append(cell);
    }
  }
  wrapper.append(grid);
  return wrapper;
}

async function showSong(index) {
  selected = index;
  renderList();
  const id = ++requestNumber;
  const song = songs[index];
  message('Loading lyrics…');
  try {
    const [deResponse, enResponse] = await Promise.all([
      fetch('songs/' + encodeURIComponent(song.de)),
      fetch('songs/' + encodeURIComponent(song.en))
    ]);
    if (!deResponse.ok || !enResponse.ok) throw new Error('One or more lyric files could not be loaded.');
    const [de, en] = await Promise.all([deResponse.text(), enResponse.text()]);
    if (id !== requestNumber) return;
    const heading = document.createElement('header');
    heading.className = 'song-heading';
    const h2 = document.createElement('h2');
    h2.textContent = song.title;
    const artist = document.createElement('p');
    artist.textContent = 'by ' + song.artist;
    heading.append(h2, artist);
    view.replaceChildren(heading, alignedLyrics(de, en));
  } catch (error) {
    if (id === requestNumber) message(error.message, true);
  }
}

search.addEventListener('input', renderList);
(async function initialize() {
  try {
    const response = await fetch('songs/index.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error('Cannot load songs/index.json.');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid song index.');
    songs = data.filter(song => typeof song.title === 'string' && typeof song.artist === 'string' && typeof song.de === 'string' && typeof song.en === 'string');
    renderList();
    if (songs.length) await showSong(0);
    else message('No songs found. Run convert_songs.py first.');
  } catch (error) {
    list.textContent = '';
    message(error.message + ' Preview through a local web server, not file://.', true);
  }
})();
