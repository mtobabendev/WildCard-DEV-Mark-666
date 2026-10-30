import { useEffect, useRef } from 'react';

/* Actual convex polyhedra, projected onto canvas with face lighting. No 3D dependency. */
const PHI = (1 + Math.sqrt(5)) / 2;
const SIGNS = [-1, 1];
const vec = (x, y, z) => [x, y, z];
const subtract = (a, b) => a.map((x, i) => x - b[i]);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalized = a => {
  const mag = Math.hypot(...a) || 1;
  return a.map(x => x / mag);
};

function verticesFor(sides) {
  if (sides === 4) return [
    vec(1, 1, 1), vec(-1, -1, 1),
    vec(-1, 1, -1), vec(1, -1, -1),
  ];
  if (sides === 6) return SIGNS.flatMap(x =>
    SIGNS.flatMap(y => SIGNS.map(z => vec(x, y, z))));
  if (sides === 8) return [
    vec(1, 0, 0), vec(-1, 0, 0),
    vec(0, 1, 0), vec(0, -1, 0),
    vec(0, 0, 1), vec(0, 0, -1),
  ];
  if (sides === 10) {
    const h = 0.15;
    const cosine = Math.cos(Math.PI / 5);
    const pole = h * (1 + cosine) / (1 - cosine);
    return [
      vec(0, 0, pole), vec(0, 0, -pole),
      ...Array.from({ length: 5 }, (_, i) => [
        vec(Math.cos(2 * Math.PI * i / 5), Math.sin(2 * Math.PI * i / 5), h),
        vec(Math.cos(2 * Math.PI * (i + 0.5) / 5), Math.sin(2 * Math.PI * (i + 0.5) / 5), -h),
      ]).flat(),
    ];
  }
  if (sides === 12) return [
    ...SIGNS.flatMap(x => SIGNS.flatMap(y => SIGNS.map(z => vec(x, y, z)))),
    ...SIGNS.flatMap(y => SIGNS.map(z => vec(0, y / PHI, z * PHI))),
    ...SIGNS.flatMap(x => SIGNS.map(y => vec(x / PHI, y * PHI, 0))),
    ...SIGNS.flatMap(x => SIGNS.map(z => vec(x * PHI, 0, z / PHI))),
  ];
  if (sides === 20) return [
    ...SIGNS.flatMap(y => SIGNS.map(z => vec(0, y, z * PHI))),
    ...SIGNS.flatMap(x => SIGNS.map(y => vec(x, y * PHI, 0))),
    ...SIGNS.flatMap(x => SIGNS.map(z => vec(x * PHI, 0, z))),
  ];
  return [];
}

function makeGeometry(sides) {
  const points = verticesFor(sides);
  const radius = Math.max(...points.map(p => Math.hypot(...p)));
  const vertices = points.map(p => p.map(x => x / radius));
  const faces = [];
  const seen = new Set();

  for (let i = 0; i < vertices.length - 2; i++) {
    for (let j = i + 1; j < vertices.length - 1; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const raw = cross(subtract(vertices[j], vertices[i]), subtract(vertices[k], vertices[i]));
        if (Math.hypot(...raw) < 1e-7) continue;
        let normal = normalized(raw);
        const distances = vertices.map(p => dot(subtract(p, vertices[i]), normal));
        if (Math.max(...distances) > 1e-5 && Math.min(...distances) < -1e-5) continue;
        if (Math.max(...distances) > 1e-5) normal = normal.map(x => -x);
        const indices = vertices.map((p, index) =>
          Math.abs(dot(subtract(p, vertices[i]), normal)) < 1e-5 ? index : -1)
          .filter(index => index >= 0);
        const key = [...indices].sort((a, b) => a - b).join(':');
        if (seen.has(key)) continue;
        seen.add(key);
        const center = [0, 1, 2].map(axis =>
          indices.reduce((sum, index) => sum + vertices[index][axis], 0) / indices.length);
        const xAxis = normalized(subtract(vertices[indices[0]], center));
        const yAxis = cross(normal, xAxis);
        indices.sort((a, b) => {
          const relativeA = subtract(vertices[a], center);
          const relativeB = subtract(vertices[b], center);
          return Math.atan2(dot(relativeA, yAxis), dot(relativeA, xAxis))
            - Math.atan2(dot(relativeB, yAxis), dot(relativeB, xAxis));
        });
        faces.push({ indices, normal, center });
      }
    }
  }
  if (faces.length !== sides) throw new Error('Invalid d' + sides + ' geometry');
  return { vertices, faces };
}
const GEOMETRY = Object.fromEntries([4, 6, 8, 10, 12, 20].map(
  n => [n, makeGeometry(n)],
));

const qNormalized = q => {
  const m = Math.hypot(...q) || 1;
  return q.map(v => v / m);
};
const qMultiply = (a, b) => [
  a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1],
  a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
  a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3],
  a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2],
];
const qAxis = (axis, angle) => {
  const half = angle / 2;
  return [...normalized(axis).map(x => x * Math.sin(half)), Math.cos(half)];
};
const qFromTo = (from, to) => {
  const alignment = dot(from, to);
  if (alignment < -0.99999) {
    const axis = normalized(cross(from, Math.abs(from[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0]));
    return [...axis, 0];
  }
  return qNormalized([...cross(from, to), 1 + alignment]);
};
const qSlerp = (from, target, progress) => {
  let to = target;
  let cosine = dot(from, to);
  if (cosine < 0) { to = to.map(v => -v); cosine = -cosine; }
  if (cosine > 0.9995) return qNormalized(from.map((v, i) => v + (to[i] - v) * progress));
  const theta = Math.acos(Math.max(-1, Math.min(1, cosine)));
  const sine = Math.sin(theta);
  const a = Math.sin((1 - progress) * theta) / sine;
  const b = Math.sin(progress * theta) / sine;
  return from.map((v, i) => a*v + b*to[i]);
};
const rotate = (q, point) => {
  const xyz = q.slice(0, 3);
  const t = cross(xyz, point).map(x => x * 2);
  const c = cross(xyz, t);
  return point.map((x, i) => x + q[3] * t[i] + c[i]);
};

function drawSolid(canvas, geometry, quaternion, sides, tens) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const size = 200;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const actual = Math.round(size * ratio);
  if (canvas.width !== actual || canvas.height !== actual) {
    canvas.width = actual;
    canvas.height = actual;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, size, size);
  const transformed = geometry.vertices.map(p => rotate(quaternion, p));
  const projected = transformed.map(([x, y, z]) => {
    const perspective = 3.5 / (3.5 - z);
    return [100 + x * 85 * perspective, 100 - y * 85 * perspective];
  });
  const faces = geometry.faces.map((face, index) => ({
    ...face,
    number: index,
    rotatedNormal: rotate(quaternion, face.normal),
    rotatedCenter: rotate(quaternion, face.center),
  })).sort((a, b) => a.rotatedCenter[2] - b.rotatedCenter[2]);

  for (const face of faces) {
    if (face.rotatedNormal[2] <= 0.005) continue;
    const points = face.indices.map(i => projected[i]);
    const intensity = 0.54 + 0.46 * Math.max(0, dot(face.rotatedNormal, normalized([-0.4, 0.7, 1])));
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (!index) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    // Frosted glass, refracted facets, and a warm line of fire along each edge.
    const minX = Math.min(...points.map(p => p[0]));
    const maxY = Math.max(...points.map(p => p[1]));
    const maxX = Math.max(...points.map(p => p[0]));
    const minY = Math.min(...points.map(p => p[1]));
    const ice = context.createLinearGradient(minX, minY, maxX + 1, maxY + 1);
    ice.addColorStop(0, 'rgb(' +
      [218, 253, 255].map(c => Math.round(c * intensity)).join(',') + ')');
    ice.addColorStop(.46, 'rgb(' +
      [112, 221, 243].map(c => Math.round(c * intensity)).join(',') + ')');
    ice.addColorStop(1, 'rgb(' +
      [27, 107, 167].map(c => Math.round(c * intensity)).join(',') + ')');
    context.fillStyle = ice;
    context.fill();

    context.save();
    context.clip();
    const mid = [
      points.reduce((sum, point) => sum + point[0], 0) / points.length,
      points.reduce((sum, point) => sum + point[1], 0) / points.length,
    ];
    context.strokeStyle = 'rgba(232,255,255,.28)';
    context.lineWidth = 1;
    // Crystalline fracture lines remain attached to the rotating face.
    for (let n = 0; n < points.length; n += 2) {
      const corner = points[n];
      context.beginPath();
      context.moveTo(mid[0] + (corner[0] - mid[0]) * .37, mid[1] + (corner[1] - mid[1]) * .37);
      context.lineTo(corner[0] * .82 + mid[0] * .18, corner[1] * .82 + mid[1] * .18);
      context.stroke();
    }
    context.restore();

    context.lineWidth = 3.3;
    context.strokeStyle = 'rgba(29,166,231,.95)';
    context.shadowColor = '#6df1ff';
    context.shadowBlur = 7;
    context.stroke();
    context.lineWidth = 1.2;
    context.strokeStyle = 'rgba(255,185,99,.76)';
    context.shadowColor = '#ff6926';
    context.shadowBlur = 5;
    context.stroke();
    context.shadowBlur = 0;

    if (face.rotatedNormal[2] < 0.16) continue;
    const center = [
      points.reduce((sum, point) => sum + point[0], 0) / points.length,
      points.reduce((sum, point) => sum + point[1], 0) / points.length,
    ];
    const spans = points.map(p => Math.hypot(p[0] - center[0], p[1] - center[1]));
    const sizeOfFace = Math.min(...spans);
    if (sizeOfFace < 11) continue;
    context.font = '900 ' + Math.min(29, Math.max(12, sizeOfFace * (tens ? 0.77 : 1.07))) + 'px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#092639';
    context.shadowColor = '#d6ffff';
    context.shadowBlur = 3;
    const label = sides === 10
      ? (tens ? String(face.number * 10).padStart(2, '0') : String(face.number))
      : String(face.number + 1);
    context.fillText(label, center[0], center[1] + 1);
    context.shadowBlur = 0;
  }
}

export default function PolyDie({ sides, value, rollKey, tens = false }) {
  const canvas = useRef(null);
  const orientation = useRef([0, 0, 0, 1]);
  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return undefined;
    const geometry = GEOMETRY[sides];
    const face = geometry.faces[sides === 10 ? (value % 10) : (value - 1)];
    const target = qFromTo(face.normal, [0, 0, 1]);
    const initial = orientation.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = !rollKey || reduced ? 0 : 1050;
    const start = performance.now();
    let frame = 0;
    const render = time => {
      const t = duration ? Math.min(1, (time - start) / duration) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      const interpolated = qSlerp(initial, target, eased);
      const spin = duration && t < 1
        ? qAxis([0.6, 0.9, 0.4], (1 - t) * Math.PI * (8 + (rollKey % 3) * 2))
        : [0, 0, 0, 1];
      drawSolid(surface, geometry, qMultiply(spin, interpolated), sides, tens);
      if (t < 1) frame = requestAnimationFrame(render);
      else orientation.current = target;
    };
    render(start);
    return () => cancelAnimationFrame(frame);
  }, [sides, value, rollKey, tens]);

  return <canvas
    className="dice-lab__polyhedron"
    ref={canvas}
    aria-hidden="true"
    width="200"
    height="200"
  />;
}
