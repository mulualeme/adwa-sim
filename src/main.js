import { Renderer } from './renderer.js';
import { Simulation } from './simulation.js';
import { UIController } from './ui.js';

const canvas = document.getElementById('battlefield');
const minimapCanvas = document.getElementById('minimap');

const renderer = new Renderer(canvas, minimapCanvas);
const simulation = new Simulation(canvas.width, canvas.height);
const ui = new UIController({ simulation, renderer, canvas });

ui.attachEvents();
simulation.setPhase('deployment');

let lastTime = performance.now();
let elapsed = 0;

function animate(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += dt;

  simulation.update(dt, elapsed);
  renderer.clear();
  renderer.drawBackground();
  renderer.drawUnits(simulation.getUnits(), (unit) => simulation.getUnitColor(unit), elapsed);
  renderer.drawMinimap(simulation.getUnits());

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
