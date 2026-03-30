import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

export default async function StatsPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  type LeaderRow = (typeof snapshot.scoringLeaders)[number] & { mvpScore?: number };

  const labels =
    locale === "zh"
      ? {
          scoringLeaders: "得分榜",
          assistLeaders: "助攻榜",
          reboundLeaders: "篮板榜",
          mvpLadder: "MVP 排行",
          champion: "冠军",
          seasonInProgress: "赛季仍在进行中",
          finalRecord: "最终战绩",
          finishSeason: "完成常规赛后才能决出总冠军。",
          leagueMvp: "联赛 MVP",
          noLeader: "暂无领跑者",
          seedRace: "先进行比赛，MVP 竞争才会开始。",
          scoringChampion: "得分王",
          scoringEmpty: "还没有比赛时，得分榜不会出现领跑者。",
          playmakingAward: "助攻王",
          assistAfterRound: "首轮比赛后才会出现助攻榜领跑者。",
          glassKing: "篮板王",
          reboundAfterRound: "首轮比赛后才会出现篮板榜领跑者。",
          noExpiring: "你的阵容里目前没有只剩一年合同的球员。",
          yearsLeft: "年剩余",
          extension: "续约价格",
          noHistory: "还没有完成的赛季。先打完当前赛季，再开始积累球队历史。",
          yourRecord: "你的球队战绩",
          rank: "排名",
          player: "球员",
          team: "球队",
          games: "场次",
          populate: "先模拟比赛，这里才会出现排行榜数据。",
          score: "评分",
        }
      : {
          scoringLeaders: "Scoring Leaders",
          assistLeaders: "Assist Leaders",
          reboundLeaders: "Rebound Leaders",
          mvpLadder: "MVP Ladder",
          champion: "Champion",
          seasonInProgress: "Season still in progress",
          finalRecord: "final record",
          finishSeason: "Finish the regular season to crown the title winner.",
          leagueMvp: "League MVP",
          noLeader: "No leader yet",
          seedRace: "Simulate games to seed the race.",
          scoringChampion: "Scoring Champion",
          scoringEmpty: "Scoring table is empty until games are played.",
          playmakingAward: "Playmaking Award",
          assistAfterRound: "Assist leader appears after the first round.",
          glassKing: "Glass King",
          reboundAfterRound: "Rebound leader appears after the first round.",
          noExpiring: "No one on your roster is down to a one-year deal.",
          yearsLeft: "Y left",
          extension: "Extension",
          noHistory: "No completed seasons yet. Finish your current campaign to start building history.",
          yourRecord: "Your club record",
          rank: "Rank",
          player: "Player",
          team: "Team",
          games: "Games",
          populate: "Simulate games to populate this leaderboard.",
          score: "Score",
        };

  const sections = [
    {
      title: labels.scoringLeaders,
      rows: snapshot.scoringLeaders,
      suffix: "PPG",
      format: (entry: LeaderRow) => entry.ppg.toFixed(1),
    },
    {
      title: labels.assistLeaders,
      rows: snapshot.assistLeaders,
      suffix: "APG",
      format: (entry: LeaderRow) => entry.apg.toFixed(1),
    },
    {
      title: labels.reboundLeaders,
      rows: snapshot.reboundLeaders,
      suffix: "RPG",
      format: (entry: LeaderRow) => entry.rpg.toFixed(1),
    },
    {
      title: labels.mvpLadder,
      rows: snapshot.mvpLadder as LeaderRow[],
      suffix: labels.score,
      format: (entry: LeaderRow) => (entry.mvpScore ?? 0).toFixed(1),
    },
  ];

  return (
    <AppShell
      title={t.stats.title}
      subtitle={t.stats.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <section className="mb-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <SectionCard title={t.stats.seasonAwards}>
          <div className="grid gap-3">
            {[
              {
                label: labels.champion,
                value: snapshot.seasonAwards.champion ? snapshot.seasonAwards.champion.name : labels.seasonInProgress,
                detail: snapshot.seasonAwards.champion
                  ? `${snapshot.seasonAwards.champion.wins}-${snapshot.seasonAwards.champion.losses} ${labels.finalRecord}`
                  : labels.finishSeason,
              },
              {
                label: labels.leagueMvp,
                value: snapshot.seasonAwards.mvp
                  ? `${snapshot.seasonAwards.mvp.player.firstName} ${snapshot.seasonAwards.mvp.player.lastName}`
                  : labels.noLeader,
                detail: snapshot.seasonAwards.mvp
                  ? `${snapshot.seasonAwards.mvp.team.abbreviation} | ${snapshot.seasonAwards.mvp.ppg.toFixed(1)} PPG`
                  : labels.seedRace,
              },
              {
                label: labels.scoringChampion,
                value: snapshot.seasonAwards.scoringChampion
                  ? `${snapshot.seasonAwards.scoringChampion.player.firstName} ${snapshot.seasonAwards.scoringChampion.player.lastName}`
                  : labels.noLeader,
                detail: snapshot.seasonAwards.scoringChampion
                  ? `${snapshot.seasonAwards.scoringChampion.ppg.toFixed(1)} PPG`
                  : labels.scoringEmpty,
              },
              {
                label: labels.playmakingAward,
                value: snapshot.seasonAwards.assistChampion
                  ? `${snapshot.seasonAwards.assistChampion.player.firstName} ${snapshot.seasonAwards.assistChampion.player.lastName}`
                  : labels.noLeader,
                detail: snapshot.seasonAwards.assistChampion
                  ? `${snapshot.seasonAwards.assistChampion.apg.toFixed(1)} APG`
                  : labels.assistAfterRound,
              },
              {
                label: labels.glassKing,
                value: snapshot.seasonAwards.reboundChampion
                  ? `${snapshot.seasonAwards.reboundChampion.player.firstName} ${snapshot.seasonAwards.reboundChampion.player.lastName}`
                  : labels.noLeader,
                detail: snapshot.seasonAwards.reboundChampion
                  ? `${snapshot.seasonAwards.reboundChampion.rpg.toFixed(1)} RPG`
                  : labels.reboundAfterRound,
              },
            ].map((award) => (
              <article key={award.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">{award.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{award.value}</p>
                <p className="mt-1 text-sm text-slate-300">{award.detail}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t.stats.contractWatch}>
          <div className="grid gap-3">
            {snapshot.expiringContracts.length === 0 ? (
              <p className="text-sm text-slate-300">{labels.noExpiring}</p>
            ) : (
              snapshot.expiringContracts.map((player) => (
                <div key={`watch-${player.id}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="font-semibold text-white">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {player.contractYears}{labels.yearsLeft} | {labels.extension} {player.extensionCost} cr
                  </p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard title={t.stats.franchiseTimeline}>
        <div className="grid gap-3">
          {snapshot.seasonHistory.length === 0 ? (
            <p className="text-sm text-slate-300">{labels.noHistory}</p>
          ) : (
            snapshot.seasonHistory.map((entry) => (
              <article key={entry.seasonId} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-lg font-semibold text-white">{entry.seasonName}</p>
                  <p className="text-sm text-slate-300">{labels.champion}: {entry.championTeamName}</p>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <p>{labels.yourRecord}: {entry.favoriteTeamRecord}</p>
                  <p>{labels.leagueMvp}: {entry.mvpName}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title}>
            <div className="overflow-hidden rounded-[24px] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{labels.rank}</th>
                    <th className="px-4 py-3">{labels.player}</th>
                    <th className="px-4 py-3">{labels.team}</th>
                    <th className="px-4 py-3">{labels.games}</th>
                    <th className="px-4 py-3">{section.suffix}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/60 text-slate-100">
                  {section.rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-300">
                        {labels.populate}
                      </td>
                    </tr>
                  ) : (
                    section.rows.map((entry, index) => (
                      <tr key={`${section.title}-${entry.player.id}`} className="transition hover:bg-white/5">
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4 font-medium text-white">
                          {entry.player.firstName} {entry.player.lastName}
                        </td>
                        <td className="px-4 py-4">{entry.team.abbreviation}</td>
                        <td className="px-4 py-4">{entry.games}</td>
                        <td className="px-4 py-4">
                          {section.format(entry)} {section.suffix}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
