# Ardenvale

A 2005-era, RuneScape-style browser MMO-lite built with Three.js and canvas. Plain static files, no build step.

## Play locally

Double-click `play.bat`, or run:

```
python -m http.server 8765
```

then open http://localhost:8765.

## Deploy to Vercel

It is a static site, so no build settings are needed.

- **Dashboard:** push this repo to GitHub, then "Add New Project" in Vercel and import it. Framework preset: *Other*, build command: none, output directory: `.` (root).
- **CLI:** `npm i -g vercel`, then run `vercel` (preview) or `vercel --prod` from this folder.

Characters save in the browser's localStorage, so each player's progress is per browser and per domain.
