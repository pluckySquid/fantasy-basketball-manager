import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const statePath = resolve(process.cwd(), "data", "league-state.json");
const outputDir = resolve(process.cwd(), "public", "portraits");
const force = process.argv.includes("--force");
const limitFlag = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitFlag ? Number(limitFlag.split("=")[1]) : undefined;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildPrompt(player) {
  return [
    "Use case: illustration-story",
    "Asset type: sports card portrait",
    `Primary request: create an original stylized basketball player portrait card illustration for ${player.firstName} ${player.lastName}`,
    "Scene/backdrop: studio sports portrait with dramatic arena-inspired lighting and shallow depth of field",
    "Subject: one adult basketball player from the chest up, facing camera, confident expression",
    "Style/medium: polished digital painting, premium card-art look, not photorealistic",
    "Composition/framing: centered portrait, head and shoulders dominant, enough empty space around shoulders for card framing",
    "Lighting/mood: cinematic rim light, energetic but clean",
    "Color palette: rich athletic tones, metallic accents, high contrast",
    `Constraints: no logos, no jersey text, no watermark, no background crowd, do not resemble a real photo, keep it as original sports-card illustration, position hint ${player.position}, archetype hint ${player.archetype}`,
  ].join("\n");
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function generatePortrait(player) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: buildPrompt(player),
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image generation failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("OpenAI response did not include image data.");
  }

  return Buffer.from(imageBase64, "base64");
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Set OPENAI_API_KEY before running portrait generation.");
  }

  const rawState = await readFile(statePath, "utf8");
  const state = JSON.parse(rawState);
  const players = [...state.players, ...state.marketPlayers, ...state.reservePlayers];
  const uniquePlayers = Array.from(
    new Map(players.map((player) => [`${player.firstName} ${player.lastName}`, player])).values(),
  );
  const selectedPlayers = typeof limit === "number" ? uniquePlayers.slice(0, limit) : uniquePlayers;

  await mkdir(outputDir, { recursive: true });

  for (const player of selectedPlayers) {
    const fullName = `${player.firstName} ${player.lastName}`;
    const filePath = resolve(outputDir, `${slugify(fullName)}.png`);
    if (!force && (await fileExists(filePath))) {
      console.log(`skip ${fullName}`);
      continue;
    }

    console.log(`generate ${fullName}`);
    const image = await generatePortrait(player);
    await writeFile(filePath, image);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
