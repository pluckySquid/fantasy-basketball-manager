"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";

type QuarterLines = {
  home: number[];
  away: number[];
};

type TeamRef = {
  abbreviation: string;
};

type LiveMatchCenterProps = {
  locale: Locale;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homeScore: number;
  awayScore: number;
  homeTopPerformer: string | null;
  awayTopPerformer: string | null;
  summary: string;
  events: string[];
  momentumStops: number[];
  quarters: QuarterLines;
};

const quarterLabels = ["Q1", "Q2", "Q3", "Q4"];

function clampProgress(value: number, max: number) {
  return Math.min(max, Math.max(0, value));
}

export function LiveMatchCenter({
  locale,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  homeTopPerformer,
  awayTopPerformer,
  summary,
  events,
  momentumStops,
  quarters,
}: LiveMatchCenterProps) {
  const [revealedEvents, setRevealedEvents] = useState(1);
  const [revealedQuarter, setRevealedQuarter] = useState(1);
  const [displayHomeScore, setDisplayHomeScore] = useState(quarters.home[0] ?? 0);
  const [displayAwayScore, setDisplayAwayScore] = useState(quarters.away[0] ?? 0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRevealedEvents((current) => {
        if (current >= events.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 950);

    return () => window.clearInterval(timer);
  }, [events.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRevealedQuarter((current) => {
        if (current >= 4) {
          window.clearInterval(timer);
          return current;
        }
        const nextQuarter = current + 1;
        const nextHome = quarters.home.slice(0, nextQuarter).reduce((sum, value) => sum + value, 0);
        const nextAway = quarters.away.slice(0, nextQuarter).reduce((sum, value) => sum + value, 0);
        setDisplayHomeScore(nextHome);
        setDisplayAwayScore(nextAway);
        return nextQuarter;
      });
    }, 1500);

    return () => window.clearInterval(timer);
  }, [quarters.home, quarters.away]);

  const currentLeader = displayHomeScore >= displayAwayScore ? homeTeam.abbreviation : awayTeam.abbreviation;
  const margin = Math.abs(displayHomeScore - displayAwayScore);

  const visibleEvents = useMemo(() => events.slice(0, revealedEvents), [events, revealedEvents]);

  return (
    <div className="grid gap-4 text-sm text-slate-300">
      <div className="live-center-shell rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200">
              {locale === "zh" ? "比赛直播中心" : "Live Match Center"}
            </p>
            <p className="mt-2 text-sm text-slate-200">
              {locale === "zh"
                ? `${homeTeam.abbreviation} 与 ${awayTeam.abbreviation} 的比赛节奏、关键回合和末节走势汇总如下。`
                : `A quick look at the pace, swing moments, and closing stretch between ${homeTeam.abbreviation} and ${awayTeam.abbreviation}.`}
            </p>
          </div>
          <div className="grid gap-2 text-right">
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-emerald-100">
              {locale === "zh" ? "实时风格回放" : "Live-style recap"}
            </div>
            <div className="score-pill flex items-center justify-between gap-3 rounded-[20px] px-4 py-3">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {locale === "zh" ? "当前比分" : "Live score"}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {quarterLabels[clampProgress(revealedQuarter, 4) - 1]} • {currentLeader} {locale === "zh" ? "领先" : "ahead"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{awayTeam.abbreviation}</p>
                  <p className="text-2xl font-semibold">{displayAwayScore}</p>
                </div>
                <span className="text-slate-500">:</span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{homeTeam.abbreviation}</p>
                  <p className="text-2xl font-semibold text-amber-100">{displayHomeScore}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="match-summary-banner rounded-[22px] px-4 py-3">
        <p className="text-sm text-slate-100">{summary}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            label: locale === "zh" ? "主队关键先生" : "Home star",
            value: homeTopPerformer,
          },
          {
            label: locale === "zh" ? "客队关键先生" : "Away star",
            value: awayTopPerformer,
          },
          {
            label: locale === "zh" ? "实时分差" : "Live margin",
            value: `${margin}`,
          },
        ].map((panel) => (
          <div key={panel.label} className="rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{panel.label}</p>
            <p className="mt-2 text-sm text-slate-100">{panel.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              {locale === "zh" ? "关键回合" : "Play-by-play"}
            </p>
            <p className="text-xs text-slate-500">
              {locale === "zh" ? "每秒推进一次" : "Advances each second"}
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            {visibleEvents.map((event, index) => (
              <div key={`event-${index}`} className="live-event rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-100">
                    {locale === "zh" ? `片段 ${index + 1}` : `Clip ${index + 1}`}
                  </span>
                  <p className="text-sm text-slate-200">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            {locale === "zh" ? "比赛走势" : "Momentum"}
          </p>
          <div className="mt-4 grid gap-3">
            {momentumStops.map((swing, index) => {
              const positive = swing >= 0;
              const width = Math.min(100, Math.max(12, Math.abs(swing) * 2.4));
              const active = index < revealedQuarter;
              return (
                <div key={`momentum-${index}`} className="grid gap-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    <span>{quarterLabels[index]}</span>
                    <span className={positive ? "text-cyan-200" : "text-amber-200"}>
                      {positive ? homeTeam.abbreviation : awayTeam.abbreviation}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/8">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${positive ? "bg-[linear-gradient(90deg,rgba(34,211,238,0.95),rgba(59,130,246,0.75))]" : "bg-[linear-gradient(90deg,rgba(251,191,36,0.95),rgba(249,115,22,0.78))]"} ${active ? "opacity-100" : "opacity-35"}`}
                      style={{ width: active ? `${width}%` : "12%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/55">
        <div className="grid grid-cols-6 border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.22em] text-slate-400">
          <div className="px-3 py-2">{locale === "zh" ? "球队" : "Team"}</div>
          {quarterLabels.map((quarter) => (
            <div key={quarter} className="px-3 py-2">
              {quarter}
            </div>
          ))}
          <div className="px-3 py-2">{locale === "zh" ? "总分" : "Final"}</div>
        </div>
        {[
          {
            team: homeTeam.abbreviation,
            scores: quarters.home,
            final: homeScore,
          },
          {
            team: awayTeam.abbreviation,
            scores: quarters.away,
            final: awayScore,
          },
        ].map((row) => (
          <div key={`${row.team}-quarters`} className="grid grid-cols-6 border-t border-white/8 text-sm text-slate-100">
            <div className="px-3 py-3 font-semibold text-white">{row.team}</div>
            {row.scores.map((score, index) => (
              <div
                key={`${row.team}-${index}`}
                className={`px-3 py-3 transition-colors duration-500 ${index < revealedQuarter ? "text-white" : "text-slate-600"}`}
              >
                {index < revealedQuarter ? score : "--"}
              </div>
            ))}
            <div className="px-3 py-3 font-semibold text-amber-200">
              {revealedQuarter >= 4 ? row.final : row.team === homeTeam.abbreviation ? displayHomeScore : displayAwayScore}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
