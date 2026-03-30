export class Unit {
  constructor({ id, team, x, y, speed, angle = 0, size = 14, formationIndex = 0 }) {
    this.id = id;
    this.team = team;
    this.position = { x, y };
    this.home = { x, y };
    this.speed = speed;
    this.baseSpeed = speed;
    this.angle = angle;
    this.size = size;
    this.baseSize = size;
    this.formationIndex = formationIndex;
    this.selected = false;
    this.hovered = false;
    this.engaged = false;
    this.target = null;
  }

  setTarget(x, y) {
    this.target = { x, y };
  }

  reset() {
    this.position.x = this.home.x;
    this.position.y = this.home.y;
    this.speed = this.baseSpeed;
    this.size = this.baseSize;
    this.angle = 0;
    this.selected = false;
    this.hovered = false;
    this.engaged = false;
    this.target = null;
  }

  update(dt, speedMultiplier = 1) {
    if (!this.target) return;

    const dx = this.target.x - this.position.x;
    const dy = this.target.y - this.position.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.6) {
      return;
    }

    this.angle = Math.atan2(dy, dx);

    const moveDist = this.speed * speedMultiplier * dt;
    const step = Math.min(moveDist, distance);
    this.position.x += (dx / distance) * step;
    this.position.y += (dy / distance) * step;
  }

  getScalePulse(time) {
    const base = this.selected ? 1.25 : 1;
    const hoverBonus = this.hovered ? 0.12 + Math.sin(time * 8) * 0.05 : 0;
    return base + hoverBonus;
  }
}
