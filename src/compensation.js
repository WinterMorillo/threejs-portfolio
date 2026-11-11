// ------------------------------------------------------------
// compensation.js — stacked 3D columns per business unit.
// Each column = base salary + bonus + commissions, stacked on top of
// each other. A dropdown filters the data by year and rebuilds the chart.
// ------------------------------------------------------------
import * as THREE from 'three';
import { createScene, createLabel } from './common/scene.js';
import { enableTooltips, money } from './common/tooltip.js';

// The 3 parts of each column, in stacking order (bottom → top)
const PARTS = [
  { key: 'base', label: 'Base salary', color: '#60a5fa' },
  { key: 'bonus', label: 'Bonus', color: '#34d399' },
  { key: 'commissions', label: 'Commissions', color: '#fbbf24' },
];
const SPACING = 3;
const MAX_HEIGHT = 9;

const { scene, camera, renderer, controls } = createScene(document.getElementById('app'));
camera.position.set(2, 10, 25);
controls.target.set(0, 4, 0);

// A Group is an invisible container. We put all bars + labels of the current
// year inside it, so changing the year = empty the group and fill it again.
const chart = new THREE.Group();
scene.add(chart);
scene.add(new THREE.GridHelper(24, 24, '#334155', '#1e293b'));

const boxGeometry = new THREE.BoxGeometry(1.4, 1, 1.4); // shared by all segments
let rows = [];
let scaleMax = 1; // biggest total across ALL years, so heights are comparable between years

async function main() {
  const response = await fetch('/data/compensation.json');
  rows = await response.json(); // [{ year, unit, base, bonus, commissions }, ...]

  const total = (r) => r.base + r.bonus + r.commissions;
  scaleMax = Math.max(...rows.map(total));

  // Fill the year dropdown with the distinct years in the data
  const years = [...new Set(rows.map((r) => r.year))].sort();
  const select = document.getElementById('yearSelect');
  select.innerHTML = years.map((y) => `<option value="${y}">${y}</option>`).join('');
  select.value = years[years.length - 1]; // start on the latest year
  select.addEventListener('change', () => buildChart(Number(select.value)));

  document.getElementById('legend').innerHTML = PARTS
    .map((p) => `<span><i style="background:${p.color}"></i>${p.label}</span>`)
    .join('');

  buildChart(Number(select.value));

  enableTooltips({ camera, renderer }, () => chart.children.filter((o) => o.isMesh), (d) =>
    `<b>${d.unit}</b> · ${d.year}<br>${d.partLabel}: <b>${money(d.value)}</b>` +
    `<br><span style="color:#64748b">Total: ${money(d.total)}</span>`
  );
}

function buildChart(year) {
  // 1. Remove the previous year's objects and free their GPU memory
  chart.children.forEach((obj) => {
    obj.material.map?.dispose(); // label textures
    obj.material.dispose();
  });
  chart.clear();

  // 2. Keep only rows for the selected year (like WHERE year = @year)
  const data = rows.filter((r) => r.year === year);
  const offsetX = ((data.length - 1) * SPACING) / 2;

  data.forEach((row, i) => {
    const x = i * SPACING - offsetX;
    const total = row.base + row.bonus + row.commissions;
    let y = 0; // where the next segment starts (stacking)

    PARTS.forEach((part) => {
      const value = row[part.key];
      const height = (value / scaleMax) * MAX_HEIGHT;

      const segment = new THREE.Mesh(
        boxGeometry,
        new THREE.MeshStandardMaterial({ color: part.color, roughness: 0.5 })
      );
      segment.scale.y = height;
      segment.position.set(x, y + height / 2, 0);
      segment.userData = { ...row, partLabel: part.label, value, total };
      chart.add(segment);

      y += height; // next segment sits on top of this one
    });

    // Unit name under the column
    const label = createLabel(row.unit, { size: 0.38 });
    label.position.set(x, 0.3, 1.6);
    chart.add(label);
  });
}

main();
