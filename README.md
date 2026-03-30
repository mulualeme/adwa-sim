# 2D Interactive Visualization of the Battle of Adwa (Raw WebGL)

This project is a complete, modular, raw-WebGL 2D simulation for academic demonstration of graphics fundamentals:

- 2D rendering pipeline (custom shaders + buffers)
- Transformations (translation, rotation, scaling via matrices)
- Time-based animation (`requestAnimationFrame` + delta time)
- User interaction (hover, click, phase control, start/pause/reset)
- Real-time minimap

## Folder Structure

```text
adwa-sim/
├── index.html
├── styles/
│   └── style.css
├── src/
│   ├── main.js
│   ├── renderer.js
│   ├── simulation.js
│   ├── unit.js
│   └── ui.js
└── report/
    └── project-report.md
```

## How to Run

Because this app uses ES modules, serve it from a local HTTP server:

### Option 1: Python

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

### Option 2: Node (if available)

```bash
npx serve .
```

## Controls

- **Start Battle**: starts simulation updates
- **Pause**: freezes simulation state
- **Reset**: restores initial deployment state
- **Battle Phase**: switch among deployment / movement / engagement
- **Simulation Speed slider**: controls update speed multiplier
- **Timeline slider**: scrub recorded replay snapshots
- **Mouse hover**: glow/pulse highlight
- **Mouse click**: select unit (scale-up and details panel)

## Graphics Notes

- Vertex shader transforms unit geometry by **T × R × S** matrix pipeline.
- Fragment shader controls per-unit color.
- Unit geometry and map geometry buffers are created once and reused each frame.
