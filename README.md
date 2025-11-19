# macOS Portfolio Shell

A lightweight, macOS Aqua-inspired desktop built with React, Vite, and Tailwind. Icons on the desktop and dock open draggable windows that present portfolio content. The experience is heavily inspired by [ryOS](https://github.com/ryokun6/ryos) while staying small enough to customise for a personal site.

## Getting Started

```bash
npm install
npm run dev
```

The project uses Vite, so `npm run dev` will start the dev server on <http://localhost:5173>. The custom audio chimes require one user interaction before they can play, per browser autoplay policies.

## Project Structure

```
src/
├── App.tsx                # Sets up desktop shell and audio chimes
├── components/desktop/    # Desktop, menu bar, dock, window chrome
├── data/
│   ├── content.ts         # Biography, timeline, projects, contact data
│   └── portfolio.tsx      # Desktop icon/window metadata & mapping
├── hooks/                 # Window manager logic, audio chimes
└── windows/               # Content panes rendered inside Portfolio windows
```

Key files to customise for your own portfolio:

- `src/data/content.ts` – update your biography, projects, and contact details.
- `src/data/portfolio.tsx` – adjust which windows exist, their titles, icons, and layout positions.
- `src/windows/*` – tweak the markup or add new window components.

## Features

- Aqua-style desktop with wallpaper gradient, noise layer, and floating dock.
- Draggable, focusable windows with traffic-light controls.
- Dock indicators for open windows and menu bar clock.
- Lightweight Web Audio chimes on open/close (falls back gracefully if blocked).
- Responsive clamps to keep windows accessible on smaller screens.

## Next Ideas

- Add persistence (remember last open windows and positions).
- Integrate a Markdown or CMS pipeline for window content.
- Extend with themed skins (e.g., System 7, Windows XP) using Tailwind variants.

## License

MIT. Feel free to adapt for personal or client work; attribution is appreciated but not required.

