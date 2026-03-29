import { resetLeague } from "../src/lib/game-state";

async function main() {
  await resetLeague();
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
