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
- lineup validation for starters and bench
- season simulation with results and standings
- club credits and staff upgrades
- local persistent save in `data/league-state.json`

## Notes

- The project was originally planned around Prisma + SQLite, and the Prisma schema is still included.
- In this environment, local SQLite writes were unstable, so the running MVP uses JSON persistence for reliability.
- Generated build output and local save files are git-ignored.
