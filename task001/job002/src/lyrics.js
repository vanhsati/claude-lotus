// lyrics.js: [start, end, text]. The song's lyrics are kept out of the repository: put them in src/lyrics.local.js
// (window.LY_LOCAL = [...], gitignored), generated from source/lyrics.txt. Without it the video renders with no lyrics.
const LY = window.LY_LOCAL || [];
