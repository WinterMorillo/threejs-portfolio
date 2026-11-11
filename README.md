# 3D Data Visualization Examples (Three.js + Vite)

Two small demos that turn JSON data (like the output of a SQL query) into interactive 3D charts.

- `index.html`: landing page
- `revenue.html` + `src/revenue.js`: 3D bar grid, revenue by region and month
- `compensation.html` + `src/compensation.js`: stacked columns by business unit with a year filter
- `src/common/scene.js`: shared Three.js setup (scene, camera, renderer, lights, controls, loop)
- `src/common/tooltip.js`: hover tooltips with a Raycaster
- `public/data/*.json`: fictional data

## Run
```bash
npm install
npm run dev      # local development server
npm run build    # production build into /dist
```
