// ------------------------------------------------------------
// scene.js — shared setup used by both charts.
// Every Three.js app needs the same 4 things:
//   1. a Scene     (the 3D world that holds objects)
//   2. a Camera    (the point of view)
//   3. a Renderer  (draws the scene onto a <canvas>)
//   4. a loop      (redraws ~60 times per second)
// This file creates all of them once so the chart files stay short.
// ------------------------------------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createScene(container) {
  // 1. Scene + background color
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f172a');

  // 2. Camera: PerspectiveCamera(fieldOfView, aspectRatio, near, far)
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(14, 12, 18); // x (right), y (up), z (towards you)

  // 3. Renderer: creates the <canvas> and puts it in the page
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // sharp but not too heavy
  container.appendChild(renderer.domElement);

  // OrbitControls: lets the user rotate (drag), zoom (scroll) and pan (right-drag)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;      // smooth "inertia" movement
  controls.maxPolarAngle = Math.PI / 2.1; // don't let the camera go under the floor

  // Lights: without light, standard materials look black
  scene.add(new THREE.AmbientLight('#ffffff', 0.6)); // soft light everywhere
  const sun = new THREE.DirectionalLight('#ffffff', 1.2); // light from one direction, like the sun
  sun.position.set(10, 20, 10);
  scene.add(sun);

  // Keep everything correct when the browser window is resized
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 4. Animation loop: update controls and redraw every frame
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { scene, camera, renderer, controls };
}

// Creates a flat text label (as a "sprite" that always faces the camera).
// We draw the text on a hidden 2D canvas and use it as a texture.
export function createLabel(text, { size = 0.5, color = '#cbd5e1' } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 48;
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 16;
  canvas.height = fontSize + 16;
  // (changing canvas size resets the font, so set it again)
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 8, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  // keep the text proportions: width/height of the canvas
  sprite.scale.set((canvas.width / canvas.height) * size, size, 1);
  return sprite;
}
