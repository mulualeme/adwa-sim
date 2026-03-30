# Project Report: 2D Interactive Visualization of the Battle of Adwa using WebGL

## 1. Introduction

The Battle of Adwa (1896) is a historically significant military event in which Ethiopian forces defeated the invading Italian army. This project presents a two-dimensional, interactive, educational battlefield simulation using raw WebGL. The purpose is to demonstrate core computer graphics and simulation techniques in an academically structured way, with emphasis on rendering, transformations, animation, and user interaction.

## 2. Objective

The primary objective was to build a complete browser-based simulation that visibly and technically demonstrates:

1. 2D graphics rendering using WebGL shaders and buffers.
2. Matrix-based transformations for translation, rotation, and scaling.
3. Real-time animation using requestAnimationFrame and delta-time updates.
4. Interactive controls including unit picking, hover highlighting, phase control, simulation speed, and timeline replay.

A secondary objective was to ensure clean software architecture and modular code suitable for a coursework submission.

## 3. Features Implemented

### 3.1 Battlefield Rendering

A top-down battlefield is rendered in a WebGL canvas, with Ethiopian and Italian units represented as directional triangular shapes. A second overlaid minimap canvas displays all units as colored dots in real time.

### 3.2 Unit System

Each unit stores and updates:

- Position (x, y)
- Direction angle
- Speed
- Team affiliation
- Selection and hover states
- Engagement status

Units can be selected with mouse click and highlighted with hover effects.

### 3.3 Transformations

The project explicitly combines transformation matrices in this order:

**Transform = Translation × Rotation × Scaling**

- Translation moves units through the map.
- Rotation aligns each unit with movement direction.
- Scaling provides selection enlargement and hover pulse feedback.

This matrix pipeline is sent to the vertex shader per unit.

### 3.4 Animation System

A continuous render/update loop is implemented with `requestAnimationFrame`. The simulation is updated by delta time, making motion frame-rate independent. This supports smooth behavior near 60 FPS on typical hardware.

### 3.5 User Interaction and UI

The interface includes:

- Start / Pause / Reset controls
- Battle phase selector
- Speed slider
- Timeline slider for replay scrubbing
- Unit info panel

Hover and click events use coordinate conversion from DOM space to canvas space and simple geometric picking logic.

### 3.6 Battle Phases

The simulation supports three phases:

1. **Deployment**: line formations are arranged.
2. **Movement**: formations advance toward central zones.
3. **Engagement**: units retarget nearest enemies.

### 3.7 Advanced Features

The project includes additional mark-boosting features:

- Formation-style positioning by row/column indices.
- Proximity logic: opposing units within threshold slow down and change to engagement color.
- Timeline replay based on recorded position snapshots.

## 4. Technologies Used

- HTML5 (structure)
- CSS3 (layout and controls styling)
- JavaScript ES6 modules and classes
- Raw WebGL API (no Three.js or heavy rendering framework)

## 5. Challenges and Solutions

### Challenge 1: Managing transforms clearly in 2D WebGL

**Solution:** Implemented small matrix utilities for translation, rotation, and scaling and multiplied in strict order before upload.

### Challenge 2: Balancing simulation logic with render performance

**Solution:** Unit geometry buffers are created once and reused each frame; update and draw stages are separated across modules.

### Challenge 3: Interaction with transformed units

**Solution:** Implemented robust screen-to-canvas coordinate conversion and distance-based picking radius in world space.

### Challenge 4: Replay timeline without heavy state systems

**Solution:** Stored compact frame snapshots and interpolated access by slider percentage.

## 6. Conclusion

The final product is a complete interactive 2D WebGL academic simulation that fulfills all core requirements: graphics rendering, matrix transformations, animation, and user interaction. It also adds advanced simulation behaviors such as phase-based tactics, proximity-based engagement logic, and timeline replay controls. The modular architecture and documented design make it suitable for coursework evaluation and future extensions.
