import { mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dataPath = resolve(process.cwd(), "data");
mkdirSync(dataPath, { recursive: true });

if (existsSync(dataPath)) {
  console.log(`Local save directory ready at ${dataPath}`);
}
