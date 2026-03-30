const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
uniform mat3 u_transform;
uniform vec2 u_resolution;

void main() {
  vec3 world = u_transform * vec3(a_position, 1.0);
  vec2 zeroToOne = world.xy / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const msg = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${msg}`);
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const msg = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${msg}`);
  }
  return program;
}

function multiplyMat3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

function translation(tx, ty) {
  return [1, 0, tx, 0, 1, ty, 0, 0, 1];
}

function rotation(rad) {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

function scaling(sx, sy) {
  return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
}

export class Renderer {
  constructor(canvas, minimapCanvas) {
    this.canvas = canvas;
    this.minimapCanvas = minimapCanvas;
    this.minimapCtx = minimapCanvas.getContext('2d');
    this.gl = canvas.getContext('webgl', { antialias: true });
    if (!this.gl) {
      throw new Error('WebGL not supported by this browser.');
    }

    const gl = this.gl;
    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    this.program = createProgram(gl, vs, fs);

    this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
    this.transformLocation = gl.getUniformLocation(this.program, 'u_transform');
    this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
    this.colorLocation = gl.getUniformLocation(this.program, 'u_color');

    this.unitBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.unitBuffer);

    const unitVertices = new Float32Array([
      -8, -8,
      8, 0,
      -8, 8,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, unitVertices, gl.STATIC_DRAW);

    this.backgroundBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundBuffer);
    const rect = new Float32Array([
      0, 0,
      canvas.width, 0,
      0, canvas.height,
      0, canvas.height,
      canvas.width, 0,
      canvas.width, canvas.height,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, rect, gl.STATIC_DRAW);
  }

  clear() {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.11, 0.2, 0.11, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  drawBackground() {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.backgroundBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix3fv(this.transformLocation, false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    gl.uniform4f(this.colorLocation, 0.23, 0.35, 0.19, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  drawUnits(units, colorResolver, elapsedTime) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.unitBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);

    for (const unit of units) {
      const scaleFactor = unit.getScalePulse(elapsedTime);

      // Required transform pipeline: T * R * S
      const t = translation(unit.position.x, unit.position.y);
      const r = rotation(unit.angle);
      const s = scaling(scaleFactor * (unit.size / 8), scaleFactor * (unit.size / 8));
      const tr = multiplyMat3(t, r);
      const trs = multiplyMat3(tr, s);

      gl.uniformMatrix3fv(this.transformLocation, false, trs);

      const color = colorResolver(unit);
      gl.uniform4f(this.colorLocation, color[0], color[1], color[2], color[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  drawMinimap(units) {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#355129';
    ctx.fillRect(0, 0, w, h);

    for (const unit of units) {
      const x = (unit.position.x / this.canvas.width) * w;
      const y = (unit.position.y / this.canvas.height) * h;
      ctx.fillStyle = unit.team === 'ethiopian' ? '#26a1ff' : '#ff5454';
      if (unit.engaged) ctx.fillStyle = '#ffd15b';
      ctx.beginPath();
      ctx.arc(x, y, unit.selected ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  pickUnit(units, x, y) {
    for (let i = units.length - 1; i >= 0; i -= 1) {
      const unit = units[i];
      const r = unit.size * 1.1;
      const d = Math.hypot(x - unit.position.x, y - unit.position.y);
      if (d <= r) return unit;
    }
    return null;
  }
}
