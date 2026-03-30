"use client";

import { startTransition, useEffect, useEffectEvent, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Tactic = "balanced" | "push" | "defend";
type TeamSide = "home" | "away";

type BroadcastPlayer = {
  id: string;
  name: string;
  position: string;
  overall: number;
  scoring: number;
  playmaking: number;
  rebounding: number;
  defense: number;
  stamina: number;
};

type BroadcastTeam = {
  id: string;
  name: string;
  abbreviation: string;
  players: BroadcastPlayer[];
  starters: string[];
  bench: string[];
};

type QuarterLines = {
  home: number[];
  away: number[];
};

type LiveEvent = {
  id: string;
  quarter: number;
  text: string;
  side?: TeamSide;
  tone?: "score" | "control" | "tactic" | "timeout" | "sub";
};

type BroadcastState = {
  running: boolean;
  completed: boolean;
  quarter: number;
  clockSeconds: number;
  playCount: number;
  homeScore: number;
  awayScore: number;
  logs: LiveEvent[];
  onCourt: Record<TeamSide, string[]>;
  bench: Record<TeamSide, string[]>;
  stamina: Record<string, number>;
  tactics: Record<TeamSide, Tactic>;
  boosts: Record<TeamSide, number>;
  timeouts: Record<TeamSide, number>;
  possession: TeamSide;
  hotPlayerId: string | null;
  quarterPlans: Array<{ home: number[]; away: number[] }>;
};

type LiveMatchBroadcastProps = {
  locale: Locale;
  homeTeam: BroadcastTeam;
  awayTeam: BroadcastTeam;
  quarterLines: QuarterLines;
  controlSide: TeamSide;
};

const quarterLabels = ["Q1", "Q2", "Q3", "Q4"];
const courtPositions: Record<string, { left: string; top: string }> = {
  PG: { left: "14%", top: "72%" },
  SG: { left: "28%", top: "30%" },
  SF: { left: "40%", top: "57%" },
  PF: { left: "64%", top: "32%" },
  C: { left: "76%", top: "60%" },
};

function decomposeQuarterScore(total: number) {
  const chunks: number[] = [];
  let remaining = total;
  while (remaining > 0) {
    if (remaining === 1) {
      chunks.push(1);
      remaining -= 1;
      continue;
    }
    if (remaining === 3 || (remaining > 4 && Math.random() > 0.52)) {
      chunks.push(3);
      remaining -= 3;
      continue;
    }
    chunks.push(2);
    remaining -= 2;
  }
  return chunks;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function tacticLabel(locale: Locale, tactic: Tactic) {
  if (locale === "zh") {
    if (tactic === "push") return "强攻";
    if (tactic === "defend") return "收缩防守";
    return "均衡";
  }
  if (tactic === "push") return "Attack";
  if (tactic === "defend") return "Defend";
  return "Balanced";
}

function sideLabel(locale: Locale, side: TeamSide) {
  if (locale === "zh") {
    return side === "home" ? "主队" : "客队";
  }
  return side === "home" ? "Home" : "Away";
}

function shortName(name: string) {
  return name.split(" ").slice(-1)[0] ?? name;
}

function buildInitialState({ homeTeam, awayTeam, quarterLines, locale }: LiveMatchBroadcastProps): BroadcastState {
  const stamina = Object.fromEntries(
    [...homeTeam.players, ...awayTeam.players].map((player) => [player.id, Math.min(100, player.stamina)]),
  );

  return {
    running: true,
    completed: false,
    quarter: 1,
    clockSeconds: 12 * 60,
    playCount: 0,
    homeScore: 0,
    awayScore: 0,
    logs: [
      {
        id: "intro",
        quarter: 1,
        tone: "control",
        text:
          locale === "zh"
            ? `${awayTeam.abbreviation} 对阵 ${homeTeam.abbreviation} 的直播开始，双方首发已经登场。`
            : `${awayTeam.abbreviation} at ${homeTeam.abbreviation} is live. Both starting fives are on the floor.`,
      },
    ],
    onCourt: {
      home: [...homeTeam.starters],
      away: [...awayTeam.starters],
    },
    bench: {
      home: [...homeTeam.bench],
      away: [...awayTeam.bench],
    },
    stamina,
    tactics: {
      home: "balanced",
      away: "balanced",
    },
    boosts: {
      home: 0,
      away: 0,
    },
    timeouts: {
      home: 3,
      away: 3,
    },
    possession: Math.random() > 0.5 ? "home" : "away",
    hotPlayerId: null,
    quarterPlans: quarterLines.home.map((homePoints, index) => ({
      home: decomposeQuarterScore(homePoints),
      away: decomposeQuarterScore(quarterLines.away[index]),
    })),
  };
}

function averageStamina(state: BroadcastState, side: TeamSide) {
  const rotation = state.onCourt[side];
  return rotation.reduce((sum, playerId) => sum + (state.stamina[playerId] ?? 70), 0) / Math.max(rotation.length, 1);
}

function getPlayerMap(homeTeam: BroadcastTeam, awayTeam: BroadcastTeam) {
  return new Map([...homeTeam.players, ...awayTeam.players].map((player) => [player.id, player]));
}

function chooseScorer(playerMap: Map<string, BroadcastPlayer>, ids: string[], tactic: Tactic) {
  const weighted = ids
    .map((playerId) => playerMap.get(playerId))
    .filter((player): player is BroadcastPlayer => Boolean(player))
    .map((player) => ({
      player,
      weight:
        player.scoring +
        player.overall * 0.2 +
        (tactic === "push" ? player.scoring * 0.18 : 0) +
        (player.position === "PG" ? player.playmaking * 0.08 : 0),
    }));

  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let target = Math.random() * total;
  for (const entry of weighted) {
    target -= entry.weight;
    if (target <= 0) {
      return entry.player;
    }
  }
  return weighted[0]?.player ?? null;
}

function chooseTeamForPlay(state: BroadcastState, quarterPlan: { home: number[]; away: number[] }) {
  if (quarterPlan.home.length === 0) return "away" as const;
  if (quarterPlan.away.length === 0) return "home" as const;

  const scoreGap = state.homeScore - state.awayScore;
  const homeWeight =
    quarterPlan.home.reduce((sum, points) => sum + points, 0) +
    averageStamina(state, "home") * 0.18 +
    (state.tactics.home === "push" ? 5 : state.tactics.home === "defend" ? -2 : 0) +
    state.boosts.home * 1.6 +
    (scoreGap < 0 ? 5 : 0);
  const awayWeight =
    quarterPlan.away.reduce((sum, points) => sum + points, 0) +
    averageStamina(state, "away") * 0.18 +
    (state.tactics.away === "push" ? 5 : state.tactics.away === "defend" ? -2 : 0) +
    state.boosts.away * 1.6 +
    (scoreGap > 0 ? 5 : 0);

  return Math.random() * (homeWeight + awayWeight) <= homeWeight ? "home" : "away";
}
function maybeAutoSubstitute(
  state: BroadcastState,
  side: TeamSide,
  playerMap: Map<string, BroadcastPlayer>,
  locale: Locale,
): { state: BroadcastState; event?: LiveEvent } {
  const currentFive = state.onCourt[side];
  const currentBench = state.bench[side];
  if (currentBench.length === 0) {
    return { state };
  }

  const tiredPlayerId = [...currentFive].sort((left, right) => (state.stamina[left] ?? 0) - (state.stamina[right] ?? 0))[0];
  if ((state.stamina[tiredPlayerId] ?? 100) > 48) {
    return { state };
  }

  const reserveId = [...currentBench].sort((left, right) => (state.stamina[right] ?? 0) - (state.stamina[left] ?? 0))[0];
  const tiredPlayer = playerMap.get(tiredPlayerId);
  const reservePlayer = playerMap.get(reserveId);
  if (!tiredPlayer || !reservePlayer) {
    return { state };
  }

  const updatedState: BroadcastState = {
    ...state,
    onCourt: {
      ...state.onCourt,
      [side]: currentFive.map((playerId) => (playerId === tiredPlayerId ? reserveId : playerId)),
    },
    bench: {
      ...state.bench,
      [side]: currentBench.map((playerId) => (playerId === reserveId ? tiredPlayerId : playerId)),
    },
  };

  return {
    state: updatedState,
    event: {
      id: `auto-sub-${side}-${state.playCount}`,
      quarter: state.quarter,
      side,
      tone: "sub",
      text:
        locale === "zh"
          ? `${sideLabel(locale, side)}自动换人：${reservePlayer.name} 上场，${tiredPlayer.name} 下场休息。`
          : `${sideLabel(locale, side)} auto-sub: ${reservePlayer.name} checks in for ${tiredPlayer.name}.`,
    },
  };
}

function maybeAiTimeout(state: BroadcastState, props: LiveMatchBroadcastProps): BroadcastState {
  const aiSide = props.controlSide === "home" ? "away" : "home";
  const aiTeam = aiSide === "home" ? props.homeTeam : props.awayTeam;
  const diff = aiSide === "home" ? state.homeScore - state.awayScore : state.awayScore - state.homeScore;
  const shouldCall = state.timeouts[aiSide] > 0 && diff < -6 && state.clockSeconds < 7 * 60 && state.clockSeconds > 90;

  if (!shouldCall) {
    return state;
  }

  const stamina = { ...state.stamina };
  for (const playerId of state.onCourt[aiSide]) {
    stamina[playerId] = Math.min(100, (stamina[playerId] ?? 80) + 7);
  }

  return {
    ...state,
    stamina,
    boosts: {
      ...state.boosts,
      [aiSide]: state.boosts[aiSide] + 2,
    },
    timeouts: {
      ...state.timeouts,
      [aiSide]: state.timeouts[aiSide] - 1,
    },
    logs: [
      ...state.logs,
      {
        id: `ai-timeout-${state.playCount}`,
        quarter: state.quarter,
        side: aiSide,
        tone: "timeout",
        text:
          props.locale === "zh"
            ? `${aiTeam.abbreviation} 被打停后主动叫暂停，重新布置接下来的攻防。`
            : `${aiTeam.abbreviation} stop the run with a timeout and reset both ends.`,
      },
    ],
  };
}

function createScoringText(params: {
  locale: Locale;
  team: BroadcastTeam;
  opponent: BroadcastTeam;
  scorer: BroadcastPlayer | null;
  points: number;
  tactic: Tactic;
  quarter: number;
}) {
  const { locale, team, opponent, scorer, points, tactic, quarter } = params;
  const scorerName = scorer?.name ?? (locale === "zh" ? `${team.abbreviation} 核心球员` : `${team.abbreviation} star`);
  const scoreWord =
    points === 3
      ? locale === "zh"
        ? "命中三分"
        : "buries a triple"
      : points === 1
        ? locale === "zh"
          ? "罚球命中"
          : "hits the free throw"
        : locale === "zh"
          ? "完成进攻"
          : "finishes the possession";
  const tacticTail =
    tactic === "push"
      ? locale === "zh"
        ? "，强攻战术把节奏直接拉满。"
        : ", with the attack tactic turning up the pace."
      : tactic === "defend"
        ? locale === "zh"
          ? "，防守反击打得非常坚决。"
          : ", sparked by a defense-first transition look."
        : locale === "zh"
          ? "，球队保持了平衡推进。"
          : ", keeping the offense balanced.";

  return locale === "zh"
    ? `${quarterLabels[quarter - 1]}：${scorerName}${scoreWord}，${team.abbreviation} 再拿 ${points} 分，继续压制 ${opponent.abbreviation}${tacticTail}`
    : `${quarterLabels[quarter - 1]}: ${scorerName} ${scoreWord} for ${team.abbreviation}, good for ${points} more against ${opponent.abbreviation}${tacticTail}`;
}

function advanceBroadcast(
  previous: BroadcastState,
  props: LiveMatchBroadcastProps,
  playerMap: Map<string, BroadcastPlayer>,
): BroadcastState {
  if (!previous.running || previous.completed) {
    return previous;
  }

  const quarterIndex = previous.quarter - 1;
  const quarterPlan = previous.quarterPlans[quarterIndex];
  if (!quarterPlan) {
    return { ...previous, running: false, completed: true };
  }

  let state: BroadcastState = {
    ...previous,
    playCount: previous.playCount + 1,
    boosts: {
      home: Math.max(0, previous.boosts.home - 1),
      away: Math.max(0, previous.boosts.away - 1),
    },
    stamina: { ...previous.stamina },
    logs: [...previous.logs],
    quarterPlans: previous.quarterPlans.map((plan) => ({ home: [...plan.home], away: [...plan.away] })),
  };

  for (const side of ["home", "away"] as const) {
    for (const playerId of state.onCourt[side]) {
      const drain = state.tactics[side] === "push" ? 4 : state.tactics[side] === "defend" ? 2 : 3;
      state.stamina[playerId] = Math.max(26, (state.stamina[playerId] ?? 100) - drain);
    }
  }

  const scoringSide = chooseTeamForPlay(state, quarterPlan);
  const points = state.quarterPlans[quarterIndex][scoringSide].shift() ?? 0;
  const actingTeam = scoringSide === "home" ? props.homeTeam : props.awayTeam;
  const defendingTeam = scoringSide === "home" ? props.awayTeam : props.homeTeam;
  const scorer = chooseScorer(playerMap, state.onCourt[scoringSide], state.tactics[scoringSide]);

  state.possession = scoringSide;
  state.hotPlayerId = scorer?.id ?? null;

  if (scoringSide === "home") {
    state.homeScore += points;
  } else {
    state.awayScore += points;
  }

  state.logs.push({
    id: `play-${state.playCount}`,
    quarter: state.quarter,
    side: scoringSide,
    tone: "score",
    text: createScoringText({
      locale: props.locale,
      team: actingTeam,
      opponent: defendingTeam,
      scorer,
      points,
      tactic: state.tactics[scoringSide],
      quarter: state.quarter,
    }),
  });

  state.clockSeconds = Math.max(0, state.clockSeconds - (18 + ((state.playCount * 7) % 17)));
  state = maybeAiTimeout(state, props);

  const homeSub = maybeAutoSubstitute(state, "home", playerMap, props.locale);
  state = homeSub.state;
  if (homeSub.event) state.logs.push(homeSub.event);
  const awaySub = maybeAutoSubstitute(state, "away", playerMap, props.locale);
  state = awaySub.state;
  if (awaySub.event) state.logs.push(awaySub.event);

  const currentPlan = state.quarterPlans[quarterIndex];
  const quarterDone = currentPlan.home.length === 0 && currentPlan.away.length === 0;

  if (quarterDone) {
    if (state.quarter === 4) {
      state.logs.push({
        id: `final-${state.playCount}`,
        quarter: 4,
        tone: "control",
        text:
          props.locale === "zh"
            ? `全场结束，${props.awayTeam.abbreviation} ${state.awayScore} 比 ${props.homeTeam.abbreviation} ${state.homeScore}。`
            : `Final: ${props.awayTeam.abbreviation} ${state.awayScore}, ${props.homeTeam.abbreviation} ${state.homeScore}.`,
      });
      state.running = false;
      state.completed = true;
      state.clockSeconds = 0;
      return state;
    }

    state.quarter += 1;
    state.clockSeconds = 12 * 60;
    state.logs.push({
      id: `quarter-${state.quarter}-start-${state.playCount}`,
      quarter: state.quarter,
      tone: "control",
      text:
        props.locale === "zh"
          ? `${quarterLabels[state.quarter - 1]} 开始，双方重新布置攻防。`
          : `${quarterLabels[state.quarter - 1]} begins with both benches resetting tactics.`,
    });
  }

  return state;
}
function PlayerDot({
  player,
  side,
  active,
  hot,
  locale,
}: {
  player: BroadcastPlayer;
  side: TeamSide;
  active: boolean;
  hot: boolean;
  locale: Locale;
}) {
  const position = courtPositions[player.position] ?? courtPositions.SF;
  return (
    <div
      className={`court-player ${side === "home" ? "court-player-home" : "court-player-away"} ${active ? "court-player-active" : ""} ${hot ? "court-player-hot" : ""}`}
      style={{ left: position.left, top: position.top }}
    >
      <div className="court-player-badge">{player.position}</div>
      <div className="court-player-name">{shortName(player.name)}</div>
      <div className="court-player-stamina">{locale === "zh" ? "体" : "STA"} {player.stamina}</div>
    </div>
  );
}

export function LiveMatchBroadcast(props: LiveMatchBroadcastProps) {
  const playerMap = useMemo(() => getPlayerMap(props.homeTeam, props.awayTeam), [props.homeTeam, props.awayTeam]);
  const [state, setState] = useState(() => buildInitialState(props));
  const controlTeam = props.controlSide === "home" ? props.homeTeam : props.awayTeam;
  const opponentSide = props.controlSide === "home" ? "away" : "home";
  const controlOnCourt = state.onCourt[props.controlSide].map((playerId) => playerMap.get(playerId)).filter(Boolean) as BroadcastPlayer[];
  const controlBench = state.bench[props.controlSide].map((playerId) => playerMap.get(playerId)).filter(Boolean) as BroadcastPlayer[];
  const awayOnCourt = state.onCourt.away.map((playerId) => playerMap.get(playerId)).filter(Boolean) as BroadcastPlayer[];
  const homeOnCourt = state.onCourt.home.map((playerId) => playerMap.get(playerId)).filter(Boolean) as BroadcastPlayer[];

  const tick = useEffectEvent(() => {
    setState((previous) => advanceBroadcast(previous, props, playerMap));
  });

  useEffect(() => {
    if (!state.running || state.completed) {
      return;
    }

    const timer = window.setInterval(() => {
      tick();
    }, 1250);

    return () => window.clearInterval(timer);
  }, [state.running, state.completed]);

  const handleTacticChange = (tactic: Tactic) => {
    startTransition(() => {
      setState((previous) => ({
        ...previous,
        tactics: {
          ...previous.tactics,
          [props.controlSide]: tactic,
        },
        logs: [
          ...previous.logs,
          {
            id: `tactic-${previous.playCount}-${tactic}`,
            quarter: previous.quarter,
            side: props.controlSide,
            tone: "tactic",
            text:
              props.locale === "zh"
                ? `${controlTeam.abbreviation} 把战术切换为${tacticLabel(props.locale, tactic)}。`
                : `${controlTeam.abbreviation} switch to ${tacticLabel(props.locale, tactic)} tactics.`,
          },
        ],
      }));
    });
  };

  const handleTimeout = () => {
    setState((previous) => {
      if (previous.timeouts[props.controlSide] <= 0 || previous.completed) {
        return previous;
      }

      const stamina = { ...previous.stamina };
      for (const playerId of previous.onCourt[props.controlSide]) {
        stamina[playerId] = Math.min(100, (stamina[playerId] ?? 80) + 8);
      }

      return {
        ...previous,
        running: false,
        stamina,
        boosts: {
          ...previous.boosts,
          [props.controlSide]: previous.boosts[props.controlSide] + 3,
        },
        timeouts: {
          ...previous.timeouts,
          [props.controlSide]: previous.timeouts[props.controlSide] - 1,
        },
        logs: [
          ...previous.logs,
          {
            id: `timeout-${previous.playCount}`,
            quarter: previous.quarter,
            side: props.controlSide,
            tone: "timeout",
            text:
              props.locale === "zh"
                ? `${controlTeam.abbreviation} 叫出暂停，体力得到恢复，接下来几个回合会更有侵略性。`
                : `${controlTeam.abbreviation} call timeout. Legs recover, and the next few possessions get a boost.`,
          },
        ],
      };
    });
  };

  const handleSubstitution = (formData: FormData) => {
    const outPlayerId = String(formData.get("outPlayerId") ?? "");
    const inPlayerId = String(formData.get("inPlayerId") ?? "");
    setState((previous) => {
      if (!previous.onCourt[props.controlSide].includes(outPlayerId) || !previous.bench[props.controlSide].includes(inPlayerId)) {
        return previous;
      }
      const outPlayer = playerMap.get(outPlayerId);
      const inPlayer = playerMap.get(inPlayerId);
      if (!outPlayer || !inPlayer) {
        return previous;
      }

      return {
        ...previous,
        onCourt: {
          ...previous.onCourt,
          [props.controlSide]: previous.onCourt[props.controlSide].map((playerId) =>
            playerId === outPlayerId ? inPlayerId : playerId,
          ),
        },
        bench: {
          ...previous.bench,
          [props.controlSide]: previous.bench[props.controlSide].map((playerId) =>
            playerId === inPlayerId ? outPlayerId : playerId,
          ),
        },
        logs: [
          ...previous.logs,
          {
            id: `manual-sub-${previous.playCount}-${inPlayerId}`,
            quarter: previous.quarter,
            side: props.controlSide,
            tone: "sub",
            text:
              props.locale === "zh"
                ? `${controlTeam.abbreviation} 手动换人：${inPlayer.name} 上场，${outPlayer.name} 下场。`
                : `${controlTeam.abbreviation} make a manual sub: ${inPlayer.name} replaces ${outPlayer.name}.`,
          },
        ],
      };
    });
  };

  const handleReset = () => {
    setState(buildInitialState(props));
  };

  const currentLeader =
    state.homeScore === state.awayScore ? null : state.homeScore > state.awayScore ? props.homeTeam.abbreviation : props.awayTeam.abbreviation;

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.85))] p-5 shadow-xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-2">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300">
              {props.locale === "zh" ? "比赛直播台" : "Live Broadcast Desk"}
            </p>
            <div className="flex items-center gap-4 text-white">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{props.awayTeam.abbreviation}</p>
                <p className="text-4xl font-semibold">{state.awayScore}</p>
              </div>
              <div className="text-slate-500">:</div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{props.homeTeam.abbreviation}</p>
                <p className="text-4xl font-semibold text-amber-100">{state.homeScore}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              {quarterLabels[state.quarter - 1] ?? "FT"} • {formatClock(state.clockSeconds)} • {currentLeader ? `${currentLeader} ${props.locale === "zh" ? "占优" : "have the edge"}` : props.locale === "zh" ? "比分胶着" : "Game tied"}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: props.locale === "zh" ? "当前战术" : "Current tactic", value: tacticLabel(props.locale, state.tactics[props.controlSide]) },
              { label: props.locale === "zh" ? "剩余暂停" : "Timeouts left", value: String(state.timeouts[props.controlSide]) },
              { label: props.locale === "zh" ? "平均体力" : "Average stamina", value: `${Math.round(averageStamina(state, props.controlSide))}` },
            ].map((item) => (
              <div key={item.label} className="rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="grid gap-4">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,35,0.94),rgba(15,23,42,0.88))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{props.locale === "zh" ? "球场视图" : "Court view"}</p>
                <p className="mt-1 text-sm text-slate-300">{props.locale === "zh" ? "当前控球方、热点球员和场上站位会随着直播推进更新。" : "Possession, hot player, and on-court spots update as the live feed advances."}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                <span className={`h-2.5 w-2.5 rounded-full ${state.possession === "home" ? "bg-amber-300" : "bg-cyan-300"}`} />
                {props.locale === "zh" ? `${state.possession === "home" ? props.homeTeam.abbreviation : props.awayTeam.abbreviation} 控球` : `${state.possession === "home" ? props.homeTeam.abbreviation : props.awayTeam.abbreviation} possession`}
              </div>
            </div>

            <div className="court-shell mt-4">
              <div className="court-half court-away">
                <div className="court-rim court-rim-away" />
                <div className="court-key court-key-away" />
                {awayOnCourt.map((player) => (
                  <PlayerDot key={player.id} player={{ ...player, stamina: Math.round(state.stamina[player.id] ?? player.stamina) }} side="away" active={state.possession === "away" && state.onCourt.away.includes(player.id)} hot={state.hotPlayerId === player.id} locale={props.locale} />
                ))}
              </div>
              <div className="court-midline" />
              <div className="court-center-circle" />
              <div className="court-half court-home">
                <div className="court-rim court-rim-home" />
                <div className="court-key court-key-home" />
                {homeOnCourt.map((player) => (
                  <PlayerDot key={player.id} player={{ ...player, stamina: Math.round(state.stamina[player.id] ?? player.stamina) }} side="home" active={state.possession === "home" && state.onCourt.home.includes(player.id)} hot={state.hotPlayerId === player.id} locale={props.locale} />
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,35,0.92),rgba(15,23,42,0.88))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{props.locale === "zh" ? "直播事件流" : "Live feed"}</p>
                <p className="mt-1 text-sm text-slate-300">{props.locale === "zh" ? "比赛会自动推进，你可以随时暂停并进行临场调整。" : "The game advances automatically while you make sideline adjustments."}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setState((previous) => ({ ...previous, running: !previous.running }))} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  {state.running ? (props.locale === "zh" ? "暂停直播" : "Pause") : props.locale === "zh" ? "继续直播" : "Resume"}
                </button>
                <button type="button" onClick={handleReset} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/18">
                  {props.locale === "zh" ? "重新播放" : "Replay"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {state.logs.slice(-10).reverse().map((log) => (
                <div key={log.id} className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-100">{quarterLabels[log.quarter - 1] ?? "FT"}</span>
                    <p className="text-sm text-slate-200">{log.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{props.locale === "zh" ? "临场战术" : "Tactics"}</p>
            <div className="mt-3 grid gap-2">
              {(["balanced", "push", "defend"] as const).map((tactic) => (
                <button key={tactic} type="button" onClick={() => handleTacticChange(tactic)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${state.tactics[props.controlSide] === tactic ? "border-amber-300/35 bg-amber-300/12 text-amber-100" : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"}`}>
                  {tacticLabel(props.locale, tactic)}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{props.locale === "zh" ? "暂停与布置" : "Timeout"}</p>
              <span className="text-xs text-slate-500">{props.locale === "zh" ? `还剩 ${state.timeouts[props.controlSide]} 次` : `${state.timeouts[props.controlSide]} left`}</span>
            </div>
            <button type="button" onClick={handleTimeout} disabled={state.timeouts[props.controlSide] <= 0} className="mt-3 w-full rounded-2xl border border-cyan-300/25 bg-cyan-300/12 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40">
              {props.locale === "zh" ? "叫暂停并恢复体力" : "Call timeout and recover stamina"}
            </button>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{props.locale === "zh" ? "换人调整" : "Substitution"}</p>
            <form action={handleSubstitution} className="mt-3 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">{props.locale === "zh" ? "下场球员" : "Player out"}</span>
                <select name="outPlayerId" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" defaultValue={controlOnCourt[0]?.id}>
                  {controlOnCourt.map((player) => (
                    <option key={player.id} value={player.id}>{player.name} • {Math.round(state.stamina[player.id] ?? 0)}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">{props.locale === "zh" ? "上场球员" : "Player in"}</span>
                <select name="inPlayerId" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" defaultValue={controlBench[0]?.id}>
                  {controlBench.map((player) => (
                    <option key={player.id} value={player.id}>{player.name} • {Math.round(state.stamina[player.id] ?? 0)}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="rounded-2xl border border-violet-300/25 bg-violet-300/12 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/20">
                {props.locale === "zh" ? "执行换人" : "Make substitution"}
              </button>
            </form>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{props.locale === "zh" ? "对手替补席" : "Opponent bench"}</p>
            <div className="mt-3 grid gap-2">
              {state.bench[opponentSide].map((playerId) => {
                const player = playerMap.get(playerId);
                if (!player) return null;
                return (
                  <div key={playerId} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <p className="font-semibold text-white">{player.name}</p>
                    <p className="text-xs text-slate-400">{player.position} • {props.locale === "zh" ? "体力" : "STA"} {Math.round(state.stamina[playerId] ?? 0)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
