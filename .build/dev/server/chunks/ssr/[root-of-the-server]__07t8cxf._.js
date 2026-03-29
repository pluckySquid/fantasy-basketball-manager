module.exports = [
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/src/lib/league-models.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lineupOrder",
    ()=>lineupOrder,
    "parseLineupSlots",
    ()=>parseLineupSlots,
    "starterPositionBySlot",
    ()=>starterPositionBySlot,
    "stringifyLineupSlots",
    ()=>stringifyLineupSlots
]);
const lineupOrder = [
    "pgId",
    "sgId",
    "sfId",
    "pfId",
    "cId",
    "benchOneId",
    "benchTwoId",
    "benchThreeId"
];
function parseLineupSlots(slotsJson) {
    return JSON.parse(slotsJson);
}
function stringifyLineupSlots(slots) {
    return JSON.stringify(slots);
}
const starterPositionBySlot = {
    pgId: "PG",
    sgId: "SG",
    sfId: "SF",
    pfId: "PF",
    cId: "C"
};
}),
"[project]/src/lib/game-engine.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "simulateMatch",
    ()=>simulateMatch,
    "teamStrength",
    ()=>teamStrength,
    "validateLineup",
    ()=>validateLineup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/league-models.ts [app-rsc] (ecmascript)");
;
function validateLineup(team, lineup) {
    const rosterIds = new Set(team.players.map((player)=>player.id));
    const selectedIds = Object.values(lineup);
    if (selectedIds.some((id)=>!rosterIds.has(id))) {
        return "Every selected player must belong to your roster.";
    }
    if (new Set(selectedIds).size !== selectedIds.length) {
        return "Each lineup slot must use a different player.";
    }
    for (const [slot, expectedPosition] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["starterPositionBySlot"])){
        const starter = team.players.find((player)=>player.id === lineup[slot]);
        if (!starter || starter.position !== expectedPosition) {
            return `Your ${slot.replace("Id", "").toUpperCase()} starter must play ${expectedPosition}.`;
        }
    }
    return null;
}
function playerImpact(player) {
    return player.overall * 0.38 + player.scoring * 0.22 + player.playmaking * 0.14 + player.rebounding * 0.12 + player.defense * 0.1 + player.stamina * 0.04;
}
function teamStrength(team) {
    if (!team.lineup) {
        return 0;
    }
    const lineup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseLineupSlots"])(team.lineup.slotsJson);
    const starters = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["starterPositionBySlot"]).map((slot)=>team.players.find((player)=>player.id === lineup[slot]));
    const benchIds = [
        lineup.benchOneId,
        lineup.benchTwoId,
        lineup.benchThreeId
    ];
    const bench = team.players.filter((player)=>benchIds.includes(player.id));
    const starterImpact = starters.reduce((sum, player)=>sum + (player ? playerImpact(player) : 0), 0);
    const benchImpact = bench.reduce((sum, player)=>sum + playerImpact(player) * 0.36, 0);
    const staminaBonus = starters.reduce((sum, player)=>sum + (player ? player.stamina : 0), 0) / Math.max(starters.length, 1);
    const moraleBonus = team.players.reduce((sum, player)=>sum + player.morale, 0) / Math.max(team.players.length, 1);
    return starterImpact + benchImpact + staminaBonus * 0.16 + moraleBonus * 0.08;
}
function randomSwing(size) {
    return (Math.random() * 2 - 1) * size;
}
function buildTopPerformer(players, preferredPositions) {
    const sorted = [
        ...players
    ].sort((left, right)=>{
        const leftBias = preferredPositions.includes(left.position) ? 8 : 0;
        const rightBias = preferredPositions.includes(right.position) ? 8 : 0;
        return playerImpact(right) + rightBias - (playerImpact(left) + leftBias);
    });
    const player = sorted[0];
    const points = Math.max(10, Math.round(player.scoring * 0.34 + randomSwing(4)));
    const rebounds = Math.max(2, Math.round(player.rebounding * 0.16 + randomSwing(2)));
    const assists = Math.max(1, Math.round(player.playmaking * 0.15 + randomSwing(2)));
    return `${player.firstName} ${player.lastName}: ${points} PTS, ${rebounds} REB, ${assists} AST`;
}
function simulateMatch(match, homeTeam, awayTeam) {
    const homeStrength = teamStrength(homeTeam) * 1.03 + randomSwing(8);
    const awayStrength = teamStrength(awayTeam) + randomSwing(8);
    const pace = 95 + Math.round(Math.random() * 12);
    const homeScore = Math.max(78, Math.round(66 + homeStrength * 0.42 + pace * 0.28));
    const awayScore = Math.max(74, Math.round(64 + awayStrength * 0.42 + pace * 0.26));
    return {
        matchId: match.id,
        homeScore,
        awayScore,
        homeTopPerformer: buildTopPerformer(homeTeam.players, [
            "SG",
            "SF",
            "PG"
        ]),
        awayTopPerformer: buildTopPerformer(awayTeam.players, [
            "SG",
            "SF",
            "PG"
        ]),
        summary: homeScore >= awayScore ? `${homeTeam.abbreviation} controlled the fourth quarter and defended home court.` : `${awayTeam.abbreviation} stole a road win with a stronger late-game push.`
    };
}
}),
"[project]/src/lib/game-state.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureLeagueReady",
    ()=>ensureLeagueReady,
    "getGameSnapshot",
    ()=>getGameSnapshot,
    "getPlayerById",
    ()=>getPlayerById,
    "resetLeague",
    ()=>resetLeague,
    "saveFavoriteLineup",
    ()=>saveFavoriteLineup,
    "simulateNextRound",
    ()=>simulateNextRound
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$engine$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game-engine.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/league-models.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const statePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(process.cwd(), "data", "league-state.json");
const firstNames = [
    "Mason",
    "Julian",
    "Theo",
    "Noah",
    "Kai",
    "Elliot",
    "Roman",
    "Miles",
    "Luca",
    "Grant",
    "Owen",
    "Jaylen",
    "Caleb",
    "Evan",
    "Felix",
    "Nico"
];
const lastNames = [
    "Carter",
    "Vance",
    "Brooks",
    "Mercer",
    "Hayes",
    "Bennett",
    "Porter",
    "Wells",
    "Sutton",
    "Reed",
    "Cross",
    "Coleman",
    "Foster",
    "Quinn",
    "Maddox",
    "Sawyer"
];
const teamBlueprint = [
    [
        "Lakeview",
        "Falcons",
        "LVF"
    ],
    [
        "Northport",
        "Pilots",
        "NPP"
    ],
    [
        "Goldhaven",
        "Comets",
        "GHC"
    ],
    [
        "Redwood",
        "Forge",
        "RWF"
    ],
    [
        "Riverton",
        "Kings",
        "RVK"
    ],
    [
        "Summit",
        "Storm",
        "SMS"
    ],
    [
        "Harbor",
        "Sharks",
        "HBS"
    ],
    [
        "Westfield",
        "Volt",
        "WFV"
    ]
];
const rosterBlueprint = [
    "PG",
    "SG",
    "SF",
    "PF",
    "C",
    "PG",
    "SF",
    "PF"
];
function valueAround(base, variance) {
    const delta = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
    return Math.max(48, Math.min(99, base + delta));
}
function generatePlayer(teamIndex, rosterIndex, position, teamId) {
    const base = 67 + Math.floor(Math.random() * 14) + (rosterIndex < 5 ? 4 : 0) + (teamIndex === 0 ? 2 : 0);
    const scoringBias = position === "SG" || position === "SF" ? 4 : 0;
    const playmakingBias = position === "PG" ? 6 : 0;
    const reboundingBias = position === "PF" || position === "C" ? 6 : 0;
    const defenseBias = rosterIndex % 2 === 0 ? 3 : 0;
    return {
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        teamId,
        firstName: firstNames[(teamIndex * 2 + rosterIndex) % firstNames.length],
        lastName: lastNames[(teamIndex * 3 + rosterIndex) % lastNames.length],
        age: 20 + (teamIndex + rosterIndex) % 12,
        position,
        overall: valueAround(base, 5),
        scoring: valueAround(base + scoringBias, 8),
        playmaking: valueAround(base + playmakingBias, 9),
        rebounding: valueAround(base + reboundingBias, 7),
        defense: valueAround(base + defenseBias, 7),
        stamina: valueAround(base + 2, 6),
        salary: 650 + base * 18 + rosterIndex * 20,
        morale: valueAround(74, 10)
    };
}
function buildDefaultLineup(playerIds) {
    return {
        pgId: playerIds[0],
        sgId: playerIds[1],
        sfId: playerIds[2],
        pfId: playerIds[3],
        cId: playerIds[4],
        benchOneId: playerIds[5],
        benchTwoId: playerIds[6],
        benchThreeId: playerIds[7]
    };
}
function buildSchedule(teamIds) {
    const rotation = [
        ...teamIds
    ];
    const rounds = [];
    for(let round = 0; round < rotation.length - 1; round += 1){
        const fixtures = [];
        for(let index = 0; index < rotation.length / 2; index += 1){
            const home = rotation[index];
            const away = rotation[rotation.length - 1 - index];
            fixtures.push(round % 2 === 0 ? {
                homeTeamId: home,
                awayTeamId: away
            } : {
                homeTeamId: away,
                awayTeamId: home
            });
        }
        rounds.push(fixtures);
        const fixed = rotation[0];
        const rest = rotation.slice(1);
        rest.unshift(rest.pop());
        rotation.splice(0, rotation.length, fixed, ...rest);
    }
    return [
        ...rounds,
        ...rounds.map((fixtures)=>fixtures.map((fixture)=>({
                    homeTeamId: fixture.awayTeamId,
                    awayTeamId: fixture.homeTeamId
                })))
    ];
}
function buildInitialState() {
    const seasonId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const teams = teamBlueprint.map(([city, nickname, abbreviation])=>({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            city,
            name: `${city} ${nickname}`,
            abbreviation,
            budget: 18000,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        }));
    const players = teams.flatMap((team, teamIndex)=>rosterBlueprint.map((position, rosterIndex)=>generatePlayer(teamIndex, rosterIndex, position, team.id)));
    const lineups = teams.map((team)=>{
        const roster = players.filter((player)=>player.teamId === team.id);
        return {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            teamId: team.id,
            slotsJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stringifyLineupSlots"])(buildDefaultLineup(roster.map((player)=>player.id)))
        };
    });
    const matches = buildSchedule(teams.map((team)=>team.id)).flatMap((fixtures, roundIndex)=>fixtures.map((fixture)=>({
                id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                seasonId,
                round: roundIndex + 1,
                homeTeamId: fixture.homeTeamId,
                awayTeamId: fixture.awayTeamId,
                played: false,
                homeScore: null,
                awayScore: null,
                homeTopPerformer: null,
                awayTopPerformer: null,
                summary: null
            })));
    return {
        season: {
            id: seasonId,
            name: "Fictional League Season 1",
            currentRound: 1,
            totalRounds: 14,
            status: "IN_PROGRESS"
        },
        profile: {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            managerName: "Solo Manager",
            favoriteTeamId: teams[0].id,
            seasonId
        },
        teams,
        players,
        lineups,
        matches
    };
}
async function writeLeagueState(state) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"])(process.cwd(), "data"), {
        recursive: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["writeFile"])(statePath, JSON.stringify(state, null, 2), "utf8");
}
async function readLeagueState() {
    const raw = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(statePath, "utf8");
    return JSON.parse(raw);
}
function enrichTeam(state, teamId) {
    const team = state.teams.find((entry)=>entry.id === teamId);
    return {
        ...team,
        players: state.players.filter((player)=>player.teamId === teamId).sort((left, right)=>right.overall - left.overall || left.lastName.localeCompare(right.lastName)),
        lineup: state.lineups.find((lineup)=>lineup.teamId === teamId) ?? null
    };
}
async function resetLeague() {
    const state = buildInitialState();
    await writeLeagueState(state);
    return {
        ok: true,
        message: "League reset with a fresh fictional season."
    };
}
async function ensureLeagueReady() {
    try {
        await readLeagueState();
    } catch  {
        await resetLeague();
    }
}
async function getGameSnapshot() {
    await ensureLeagueReady();
    const state = await readLeagueState();
    const favoriteTeam = enrichTeam(state, state.profile.favoriteTeamId);
    const teams = state.teams.map((team)=>enrichTeam(state, team.id));
    const matches = state.matches.map((match)=>({
            ...match,
            homeTeam: state.teams.find((team)=>team.id === match.homeTeamId),
            awayTeam: state.teams.find((team)=>team.id === match.awayTeamId)
        })).sort((left, right)=>left.round - right.round);
    return {
        profile: {
            ...state.profile,
            season: state.season
        },
        favoriteTeam,
        favoriteLineup: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseLineupSlots"])(favoriteTeam.lineup.slotsJson),
        favoriteTeamStrength: Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$engine$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["teamStrength"])(favoriteTeam)),
        teams,
        matches,
        pendingRound: matches.find((match)=>!match.played)?.round ?? state.season.totalRounds,
        recentMatches: matches.filter((match)=>match.played).slice(-5).reverse(),
        nextMatches: matches.filter((match)=>!match.played).slice(0, 4)
    };
}
async function saveFavoriteLineup(formData) {
    await ensureLeagueReady();
    const state = await readLeagueState();
    const favoriteTeam = enrichTeam(state, state.profile.favoriteTeamId);
    const lineup = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["lineupOrder"].reduce((result, slot)=>{
        result[slot] = String(formData.get(slot) ?? "");
        return result;
    }, {});
    const validationError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$engine$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateLineup"])(favoriteTeam, lineup);
    if (validationError) {
        return {
            ok: false,
            message: validationError
        };
    }
    state.lineups = state.lineups.map((entry)=>entry.teamId === state.profile.favoriteTeamId ? {
            ...entry,
            slotsJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$league$2d$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stringifyLineupSlots"])(lineup)
        } : entry);
    await writeLeagueState(state);
    return {
        ok: true,
        message: "Lineup saved."
    };
}
async function simulateNextRound() {
    await ensureLeagueReady();
    const state = await readLeagueState();
    const nextRound = state.matches.find((match)=>!match.played);
    if (!nextRound) {
        return {
            ok: false,
            message: "The season is already complete."
        };
    }
    const roundMatches = state.matches.filter((match)=>match.round === nextRound.round);
    for (const match of roundMatches){
        const homeTeam = enrichTeam(state, match.homeTeamId);
        const awayTeam = enrichTeam(state, match.awayTeamId);
        const outcome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$engine$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["simulateMatch"])(match, homeTeam, awayTeam);
        const homeWin = outcome.homeScore >= outcome.awayScore;
        Object.assign(match, {
            played: true,
            homeScore: outcome.homeScore,
            awayScore: outcome.awayScore,
            homeTopPerformer: outcome.homeTopPerformer,
            awayTopPerformer: outcome.awayTopPerformer,
            summary: outcome.summary
        });
        state.teams = state.teams.map((team)=>{
            if (team.id === match.homeTeamId) {
                return {
                    ...team,
                    wins: team.wins + (homeWin ? 1 : 0),
                    losses: team.losses + (homeWin ? 0 : 1),
                    pointsFor: team.pointsFor + outcome.homeScore,
                    pointsAgainst: team.pointsAgainst + outcome.awayScore
                };
            }
            if (team.id === match.awayTeamId) {
                return {
                    ...team,
                    wins: team.wins + (homeWin ? 0 : 1),
                    losses: team.losses + (homeWin ? 1 : 0),
                    pointsFor: team.pointsFor + outcome.awayScore,
                    pointsAgainst: team.pointsAgainst + outcome.homeScore
                };
            }
            return team;
        });
    }
    const remaining = state.matches.filter((match)=>!match.played).length;
    state.season.currentRound = remaining === 0 ? nextRound.round : nextRound.round + 1;
    state.season.status = remaining === 0 ? "COMPLETE" : "IN_PROGRESS";
    await writeLeagueState(state);
    return {
        ok: true,
        message: `Round ${nextRound.round} simulated.`
    };
}
async function getPlayerById(playerId) {
    await ensureLeagueReady();
    const state = await readLeagueState();
    const player = state.players.find((entry)=>entry.id === playerId);
    if (!player) {
        return null;
    }
    return {
        ...player,
        team: state.teams.find((team)=>team.id === player.teamId)
    };
}
}),
"[project]/src/app/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4020b1a5c6100731dbb21ff0d811f03376424c3eb1":{"name":"simulateRoundAction"},"40ac1001edd87366effce82418aec12d7c5e7aa6a7":{"name":"resetLeagueAction"},"6009250cc1032511601dea160736995b28788ba41e":{"name":"saveLineupAction"}},"src/app/actions.ts",""] */ __turbopack_context__.s([
    "resetLeagueAction",
    ()=>resetLeagueAction,
    "saveLineupAction",
    ()=>saveLineupAction,
    "simulateRoundAction",
    ()=>simulateRoundAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game-state.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
function refreshLeaguePaths() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/roster");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/lineup");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/schedule");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/standings");
}
async function saveLineupAction(_, formData) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveFavoriteLineup"])(formData);
    refreshLeaguePaths();
    return result;
}
async function simulateRoundAction(previousState) {
    void previousState;
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["simulateNextRound"])();
    refreshLeaguePaths();
    return result;
}
async function resetLeagueAction(previousState) {
    void previousState;
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resetLeague"])();
    refreshLeaguePaths();
    return result;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    saveLineupAction,
    simulateRoundAction,
    resetLeagueAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveLineupAction, "6009250cc1032511601dea160736995b28788ba41e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(simulateRoundAction, "4020b1a5c6100731dbb21ff0d811f03376424c3eb1", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resetLeagueAction, "40ac1001edd87366effce82418aec12d7c5e7aa6a7", null);
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
;
;
;
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4020b1a5c6100731dbb21ff0d811f03376424c3eb1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["simulateRoundAction"],
    "40ac1001edd87366effce82418aec12d7c5e7aa6a7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resetLeagueAction"],
    "6009250cc1032511601dea160736995b28788ba41e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveLineupAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__07t8cxf._.js.map