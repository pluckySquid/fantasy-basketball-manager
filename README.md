# Fantasy Hoops Director

A solo-friendly fantasy basketball manager MVP inspired by browser basketball management games. This build focuses on the core loop:

- manage a roster
- set a lineup
- simulate a season
- watch standings move
- upgrade club staff
- inspect player cards

## Run locally

```bash
npm install
npm run setup
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Current MVP features

- fictional league with seeded teams and players
- player-card style roster presentation
- generated portrait cards with optional local AI portrait pipeline
- lineup validation for starters and bench
- season simulation with results, box scores, standings, and season leaders
- club credits and staff upgrades
- local persistent save in `data/league-state.json`

## Optional portrait generation

The app now supports local portrait overrides from `public/portraits`. If a portrait PNG exists for a player, the card uses it automatically; otherwise it falls back to the built-in generated SVG portrait.

To generate original stylized portraits locally with the OpenAI Image API:

```bash
set OPENAI_API_KEY=your_key_here
npm run portraits:generate -- --limit=8
```

Useful flags:

- `--limit=8` generates a small test batch first
- `--force` regenerates existing portrait files

## Notes

- The project was originally planned around Prisma + SQLite, and the Prisma schema is still included.
- In this environment, local SQLite writes were unstable, so the running MVP uses JSON persistence for reliability.
- Generated build output and local save files are git-ignored.
