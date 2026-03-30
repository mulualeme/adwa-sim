export class UIController {
  constructor({ simulation, renderer, canvas }) {
    this.simulation = simulation;
    this.renderer = renderer;
    this.canvas = canvas;

    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.phaseSelect = document.getElementById('phaseSelect');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedValue = document.getElementById('speedValue');
    this.timelineSlider = document.getElementById('timelineSlider');
    this.timelineValue = document.getElementById('timelineValue');
    this.unitInfo = document.getElementById('unitInfo');
  }

  attachEvents() {
    this.startBtn.addEventListener('click', () => this.simulation.setRunning(true));
    this.pauseBtn.addEventListener('click', () => this.simulation.setRunning(false));

    this.resetBtn.addEventListener('click', () => {
      this.simulation.reset();
      this.phaseSelect.value = 'deployment';
      this.speedSlider.value = '1';
      this.speedValue.textContent = '1.0x';
      this.timelineSlider.value = '0';
      this.timelineValue.textContent = '0%';
      this.renderUnitInfo(null);
    });

    this.phaseSelect.addEventListener('change', (event) => {
      this.simulation.setPhase(event.target.value);
    });

    this.speedSlider.addEventListener('input', (event) => {
      const value = Number(event.target.value);
      this.simulation.setSpeed(value);
      this.speedValue.textContent = `${value.toFixed(1)}x`;
    });

    this.timelineSlider.addEventListener('input', (event) => {
      const value = Number(event.target.value);
      this.simulation.scrubTimeline(value);
      this.timelineValue.textContent = `${value}%`;
    });

    this.canvas.addEventListener('mousemove', (event) => {
      const { x, y } = this.getCanvasCoordinates(event);
      const hovered = this.renderer.pickUnit(this.simulation.getUnits(), x, y);
      for (const unit of this.simulation.getUnits()) {
        unit.hovered = hovered ? unit.id === hovered.id : false;
      }
      this.renderUnitInfo(hovered ?? this.simulation.getUnits().find((u) => u.selected));
    });

    this.canvas.addEventListener('mouseleave', () => {
      for (const unit of this.simulation.getUnits()) {
        unit.hovered = false;
      }
      this.renderUnitInfo(this.simulation.getUnits().find((u) => u.selected) ?? null);
    });

    this.canvas.addEventListener('click', (event) => {
      const { x, y } = this.getCanvasCoordinates(event);
      const picked = this.renderer.pickUnit(this.simulation.getUnits(), x, y);
      this.simulation.clearSelections();
      if (picked) {
        picked.selected = true;
      }
      this.renderUnitInfo(picked);
    });
  }

  getCanvasCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * this.canvas.height,
    };
  }

  renderUnitInfo(unit) {
    if (!unit) {
      this.unitInfo.innerHTML = '<h2>Unit Info</h2><p>Hover or click a unit to view details.</p>';
      return;
    }

    this.unitInfo.innerHTML = `
      <h2>Unit Info</h2>
      <p><strong>ID:</strong> ${unit.id}</p>
      <p><strong>Team:</strong> ${unit.team}</p>
      <p><strong>Position:</strong> (${unit.position.x.toFixed(1)}, ${unit.position.y.toFixed(1)})</p>
      <p><strong>Direction:</strong> ${(unit.angle * (180 / Math.PI)).toFixed(1)}°</p>
      <p><strong>Speed:</strong> ${unit.speed.toFixed(1)}</p>
      <p><strong>Status:</strong> ${unit.engaged ? 'Engaged' : 'Advancing'}</p>
    `;
  }
}
