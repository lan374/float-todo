# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (hot-reload, compiles Rust on first run ~5–10 min)
npm run tauri dev

# Production build (outputs installer to src-tauri/target/release/bundle/)
npm run tauri build

# Frontend only (no Tauri window, runs at localhost:1420)
npm run dev
```

If `npm run tauri dev` fails with "port 1420 already in use", kill the stale process:
```powershell
Get-NetTCPConnection -LocalPort 1420 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

If it fails with "access denied" on the exe, kill the old process:
```powershell
Get-Process -Name "float-todo" -ErrorAction SilentlyContinue | Stop-Process -Force
```

## Architecture

This is a **Tauri v2 + React** desktop app. The two sides communicate via Tauri's `invoke()` bridge.

### Window model
- **`main`** — the main list manager window (single instance, hides on close rather than quitting)
- **`card-{listId}`** — one frameless always-on-top window per open todo list; dynamically created in Rust via `open_card_window` command

Both window types are served from the same `index.html`. Routing is done by `window.location.hash`:
- `#/` → `MainWindow`
- `#/card/{id}` → `CardWindow`

### Frontend (`src/`)
- `App.jsx` — hash-based router, initialises the Zustand store
- `store/useTodoStore.js` — **single source of truth**; all state (lists, items, settings) lives here, persisted via `@tauri-apps/plugin-store` to `floattodo.json` next to the binary
- `store/themes.js` — three theme objects (`warm` / `light` / `dark`), consumed directly as plain JS objects (no CSS variables)
- `pages/MainWindow.jsx` — list manager: create/rename/delete lists, open cards, theme & font settings, autostart toggle
- `pages/CardWindow.jsx` — floating sticky note: add/toggle/clear todos, pick card background colour
- `components/TitleBar.jsx` — custom draggable title bar used by MainWindow; uses `data-tauri-drag-region` for native drag
- `components/CircleCheck.jsx` — SVG circle checkbox
- `components/ColorPicker.jsx` — custom colour picker (presets grid + hex input + native `<input type=color>` fallback), always requires explicit confirm

### Rust backend (`src-tauri/src/lib.rs`)
All logic is in `lib.rs`. Key responsibilities:
- Exposes `open_card_window` / `close_card_window` commands that create/destroy card windows dynamically
- Registers `Ctrl+Alt+T` global shortcut to toggle main window visibility
- Builds the system tray (left-click toggles main window, menu has Show + Quit)
- Initialises plugins: `tauri-plugin-store`, `tauri-plugin-autostart`, `tauri-plugin-global-shortcut`

### Data persistence
`useTodoStore._save()` writes the full `lists` array and `settings` object to `floattodo.json` after every mutation. There is no debounce — every state change triggers a write.

### Styling approach
All styles are **inline React styles** (no CSS modules, no Tailwind). Theme colours are passed down as props from `getTheme(settings.theme)`. The `font` shorthand CSS property is used for dual CN/EN font fallback:
```js
`${size}px "${enFont}", "${cnFont}", sans-serif`
```
