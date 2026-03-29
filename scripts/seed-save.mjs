import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const statePath = resolve(process.cwd(), "data", "league-state.json");

if (existsSync(statePath)) {
  rmSync(statePath, { force: true });
}

console.log("Local save will be freshly seeded on the first app request.");
