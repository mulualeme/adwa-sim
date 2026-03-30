import { Unit } from './unit.js';

const TEAM_COLORS = {
  ethiopian: [0.15, 0.64, 1.0, 1.0],
  italian: [0.95, 0.35, 0.35, 1.0],
};

const PHASES = {
  deployment: 'deployment',
  movement: 'movement',
  engagement: 'engagement',
};

export class Simulation {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.phase = PHASES.deployment;
    this.running = false;
    this.speedMultiplier = 1;
    this.units = this.createUnits();
    this.recordedFrames = [];
    this.maxRecordedFrames = 900;
    this.timelineValue = 0;
  }

  createUnits() {
    const units = [];
    const rows = 3;
    const perRow = 7;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < perRow; col += 1) {
        const idx = row * perRow + col;
        units.push(
          new Unit({
            id: `ETH-${idx + 1}`,
            team: 'ethiopian',
            x: 110 + col * 34,
            y: 170 + row * 42,
            speed: 58,
            formationIndex: idx,
          }),
        );
      }
    }

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < perRow; col += 1) {
        const idx = row * perRow + col;
        units.push(
          new Unit({
            id: `ITA-${idx + 1}`,
            team: 'italian',
            x: this.width - 110 - col * 34,
            y: 340 + row * 42,
            speed: 52,
            formationIndex: idx,
          }),
        );
      }
    }

    return units;
  }

  setRunning(isRunning) {
    this.running = isRunning;
  }

  setSpeed(value) {
    this.speedMultiplier = value;
  }

  setPhase(phaseName) {
    this.phase = phaseName;
  }

  reset() {
    for (const unit of this.units) {
      unit.reset();
    }
    this.phase = PHASES.deployment;
    this.running = false;
    this.timelineValue = 0;
    this.recordedFrames = [];
  }

  getPhaseList() {
    return PHASES;
  }

  applyPhaseTargets() {
    if (this.phase === PHASES.deployment) {
      for (const unit of this.units) {
        if (unit.team === 'ethiopian') {
          const row = Math.floor(unit.formationIndex / 7);
          const col = unit.formationIndex % 7;
          unit.setTarget(130 + col * 40, 150 + row * 55);
        } else {
          const row = Math.floor(unit.formationIndex / 7);
          const col = unit.formationIndex % 7;
          unit.setTarget(this.width - 130 - col * 40, 380 + row * 55);
        }
      }
      return;
    }

    if (this.phase === PHASES.movement) {
      for (const unit of this.units) {
        if (unit.team === 'ethiopian') {
          unit.setTarget(Math.min(unit.position.x + 220, this.width * 0.62), unit.position.y + ((unit.formationIndex % 2) * 10 - 5));
        } else {
          unit.setTarget(Math.max(unit.position.x - 220, this.width * 0.38), unit.position.y + ((unit.formationIndex % 2) * -10 + 5));
        }
      }
      return;
    }

    if (this.phase === PHASES.engagement) {
      const ethiopians = this.units.filter((u) => u.team === 'ethiopian');
      const italians = this.units.filter((u) => u.team === 'italian');

      for (const unit of ethiopians) {
        const nearest = this.findClosest(unit, italians);
        if (nearest) unit.setTarget(nearest.position.x, nearest.position.y);
      }

      for (const unit of italians) {
        const nearest = this.findClosest(unit, ethiopians);
        if (nearest) unit.setTarget(nearest.position.x, nearest.position.y);
      }
    }
  }

  findClosest(unit, candidates) {
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const c of candidates) {
      const d = Math.hypot(unit.position.x - c.position.x, unit.position.y - c.position.y);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return best;
  }

  update(dt, clock) {
    if (!this.running) return;

    this.applyPhaseTargets();
    this.handleProximity();

    for (const unit of this.units) {
      unit.update(dt, this.speedMultiplier);
    }

    this.captureFrame(clock);
  }

  handleProximity() {
    for (const u of this.units) {
      u.engaged = false;
      u.speed = u.baseSpeed;
    }

    for (let i = 0; i < this.units.length; i += 1) {
      const a = this.units[i];
      for (let j = i + 1; j < this.units.length; j += 1) {
        const b = this.units[j];
        if (a.team === b.team) continue;

        const d = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
        if (d < 45) {
          a.engaged = true;
          b.engaged = true;
          a.speed = a.baseSpeed * 0.6;
          b.speed = b.baseSpeed * 0.6;
        }
      }
    }
  }

  getUnitColor(unit) {
    if (unit.engaged) return [0.97, 0.83, 0.3, 1.0];
    return TEAM_COLORS[unit.team];
  }

  getUnits() {
    return this.units;
  }

  clearSelections() {
    this.units.forEach((u) => {
      u.selected = false;
    });
  }

  captureFrame(clock) {
    const snapshot = this.units.map((u) => ({ x: u.position.x, y: u.position.y, angle: u.angle }));
    this.recordedFrames.push({ t: clock, units: snapshot });
    if (this.recordedFrames.length > this.maxRecordedFrames) {
      this.recordedFrames.shift();
    }
  }

  scrubTimeline(percent) {
    this.timelineValue = percent;
    if (this.recordedFrames.length < 2) return;

    const index = Math.floor((percent / 100) * (this.recordedFrames.length - 1));
    const frame = this.recordedFrames[index];
    if (!frame) return;

    frame.units.forEach((data, i) => {
      const unit = this.units[i];
      if (!unit) return;
      unit.position.x = data.x;
      unit.position.y = data.y;
      unit.angle = data.angle;
    });
  }
}
