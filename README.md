# Saudade: Travel Portugal

A mobile-first travel page for Portugal built with eight 3rd party JavaScript libraries, all loaded from CDNs (no `node_modules`).

## Libraries

| # | Library | Where it's used | Init function in `main.js` |
|---|---------|-----------------|-------------------------------|
| 1 | [Glide.js](https://glidejs.com/) | "Where to go" destinations carousel (autoplay, swipe, arrows, bullets, responsive breakpoints) | `initCarousel()` |
| 2 | [fslightbox](https://fslightbox.com/) | "Postcards" photo gallery opens full screen with swipe | `initLightbox()` |
| 3 | [Leaflet](https://leafletjs.com/) | "Find your way" map with custom numbered pins, popups and fly-to buttons | `initMap()` |
| 4 | [Chart.js](https://www.chartjs.org/) | "When to go" combined line + bar climate chart, drawn when scrolled into view | `initChart()` |
| 5 | [AOS](https://michalsnik.github.io/aos/) | Fade and zoom animations on every section | `initScrollAnimations()` |
| 6 | [Cleave.js](https://nosir.github.io/cleave.js/) | Trip form: Canadian phone format, yyyy-mm-dd dates, $ budget with commas | `initInputFormatting()` |
| 7 | [Typed.js](https://github.com/mattboldt/typed.js) | Typing effect under the hero heading | `initTypedText()` |
| 8 | [Vanilla-Tilt.js](https://micku7zu.github.io/vanilla-tilt.js/) | 3D tilt + glare on destination cards (mouse devices only) | `initCardTilt()` |

## Structure

```
portugal-travel/
├── package.json            lite-server start script (base directory: hobi)
├── .gitignore              ignores node_modules
├── .editorconfig           2-space indentation
├── README.md
└── hobi/                 lite-server base directory
    ├── index.html          semantic html5, script tags right before </body>
    └── assets/
        ├── css/styles.css  reset, design tokens, mobile-first media queries
        ├── js/main.js      all javascript, one function per library
        └── images/favicon.svg
```

## Code style notes

- 2-space indentation, lowercase file names, tags, attributes and class names (BEM-style).
- All CSS in `hobi/assets/css/styles.css`, no inline styles. All JS in `hobi/assets/js/main.js`.
- Mobile-first: base styles target phones, `min-width` queries at 48em (tablet) and 64em (desktop).
- `img { max-width: 100%; }` in the reset; no horizontal scroll at any width.
- Every library init checks that the library loaded, so one CDN failure never breaks the rest of the page.
- Respects `prefers-reduced-motion` (AOS, Typed.js, tilt and chart animation turn off).

## Running

```
npm install
npm start
```

lite-server opens the page at http://localhost:3000. An internet connection is needed for the CDN libraries, photos and map tiles. Paths start with `/` (root of the lite-server base directory), so open the page through lite-server rather than double-clicking `index.html`.

Delete `node_modules` before zipping for submission.

## Credits

Illustrations are original SVGs made for this project. Map data © OpenStreetMap contributors.
