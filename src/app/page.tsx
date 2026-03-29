import { AppShell } from "@/components/app-shell";
import {
  ResetLeagueButton,
  SimulateRoundButton,
  StaffUpgradeButton,
  StartNextSeasonButton,
} from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot, getStaffDepartments } from "@/lib/game-state";
import { buildNav, copy, getLocale, translateChemistryNote, translateMatchSummary, type Locale } from "@/lib/i18n";

function translateNewsItem(item: string, locale: Locale) {
  if (locale === "en") {
    return item;
  }

  if (item.startsWith("Round ")) {
    return (translateMatchSummary(item, locale) ?? item)
      .replace(/^Round (\d+): /, "第$1轮：")
      .replace(" at ", " 对阵 ")
      .replace(/Front office buzz: the starting five has found a strong rhythm\./, "球队简报：首发五人已经逐渐形成良好节奏。")
      .replace(/Analysts are questioning the fit of your first unit\./, "分析师正在质疑你首发阵容的适配度。");
  }
  if (item.startsWith("Front office buzz:")) {
    return item.replace(
      "Front office buzz: the starting five has found a strong rhythm.",
      "球队简报：首发五人已经逐渐形成良好节奏。",
    ).replace("Natural starter positions are filled.", translateChemistryNote("Natural starter positions are filled.", locale));
  }
  if (item.startsWith("Analysts are questioning")) {
    return item.replace(
      "Analysts are questioning the fit of your first unit.",
      "分析师正在质疑你首发阵容的适配度。",
    ).replace("Starter role overlap hurts spacing and balance.", translateChemistryNote("Starter role overlap hurts spacing and balance.", locale));
  }
  if (item.startsWith("Contract watch:")) {
    return item.replace(
      /^Contract watch: (.+) is entering the danger zone on negotiations\.$/,
      "合同观察：$1 的续约谈判已经进入关键阶段。",
    );
  }
  if (item === "Finance desk: the club is operating above the soft cap and needs salary relief.") {
    return "财务简报：球队目前已经超过软工资帽，需要尽快释放薪资空间。";
  }
  if (item === "Finance desk: cap room is getting tight, so every signing decision matters.") {
    return "财务简报：薪资空间已经非常紧张，每一次签约都需要谨慎。";
  }
  if (item.startsWith("Season finale:")) {
    return item.replace(/^Season finale: (.+) claimed the title\.$/, "赛季总结：$1 最终夺得冠军。");
  }
  if (item.startsWith("Award season:")) {
    return item.replace(/^Award season: (.+) headlines the MVP vote\.$/, "奖项速递：$1 领跑 MVP 评选。");
  }

  return [
    "Natural starter positions are filled.",
    "Starter role overlap hurts spacing and balance.",
    "Multiple creators keep the offense flowing.",
    "Only one reliable creator in the first unit.",
    "Interior anchor stabilizes defense and rebounding.",
    "No true interior anchor in the lineup.",
    "Two-way wings improve matchup flexibility.",
    "Slashing and spacing complement each other well.",
    "The starters bring a healthy mix of roles.",
    "Too many starters share the same role profile.",
  ].reduce((result, note) => result.replace(note, translateChemistryNote(note, locale)), item);
}

export default async function Home() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  const record = `${snapshot.favoriteTeam.wins}-${snapshot.favoriteTeam.losses}`;
  const nextRoundLabel =
    snapshot.profile.season.status === "COMPLETE"
      ? locale === "zh"
        ? "赛季已结束"
        : "Season complete"
      : locale === "zh"
        ? `下一轮：第${snapshot.pendingRound}轮`
        : `Round ${snapshot.pendingRound} is next`;
  const staffDepartments = getStaffDepartments(snapshot.favoriteTeam);

  return (
    <AppShell
      title={`${snapshot.favoriteTeam.city} ${t.home.titleSuffix}`}
      subtitle={t.home.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-5">
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label={t.home.record} value={record} caption={t.common.recordCaption} />
            <MetricCard label={t.home.strength} value={String(snapshot.favoriteTeamStrength)} caption={t.common.strengthCaption} />
            <MetricCard
              label={t.home.credits}
              value={String(snapshot.profile.credits)}
              caption={`${snapshot.profile.season.name} | ${snapshot.profile.managerName} | ${nextRoundLabel}`}
            />
            <MetricCard
              label={t.home.chemistry}
              value={`${snapshot.favoriteChemistry.score}`}
              caption={snapshot.favoriteChemistry.notes[0] ? translateChemistryNote(snapshot.favoriteChemistry.notes[0], locale) : t.common.chemistryFallback}
            />
            <MetricCard
              label={t.home.payrollRoom}
              value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
              caption={`${t.common.payrollLine}: $${snapshot.favoriteTeam.budget.toLocaleString()} | ${t.common.payroll}: $${snapshot.favoritePayroll.toLocaleString()}`}
            />
          </section>

          <SectionCard title={t.home.recentResults} actionLabel={t.home.fullSchedule} actionHref="/schedule">
            <div className="grid gap-3">
              {snapshot.recentMatches.length === 0 ? (
                <p className="text-sm text-slate-300">{t.home.noGames}</p>
              ) : (
                snapshot.recentMatches.map((match) => (
                  <article key={match.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-white">
                        {locale === "zh"
                          ? `第${match.round}轮：${match.awayTeam.abbreviation} ${match.awayScore} 对阵 ${match.homeTeam.abbreviation} ${match.homeScore}`
                          : `Round ${match.round}: ${match.awayTeam.abbreviation} ${match.awayScore} at ${match.homeTeam.abbreviation} ${match.homeScore}`}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{translateMatchSummary(match.summary, locale)}</p>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                      <p>{match.homeTopPerformer}</p>
                      <p>{match.awayTopPerformer}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title={t.home.leagueNews} actionLabel={t.nav.trades} actionHref="/trades">
            <div className="grid gap-3">
              {snapshot.newsFeed.map((item) => (
                <article key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {translateNewsItem(item, locale)}
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.rosterCore} actionLabel={t.home.viewRoster} actionHref="/roster">
            <div className="grid gap-3 md:grid-cols-2">
              {snapshot.favoriteTeam.players.slice(0, 4).map((player) => (
                <PlayerShowcaseCard key={player.id} player={player} href={`/players/${player.id}`} locale={locale} />
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-5">
          <SectionCard title={t.home.leagueControls}>
            <div className="grid gap-4">
              <SimulateRoundButton
                disabled={snapshot.profile.season.status === "COMPLETE"}
                labels={{
                  idle: t.actions.simulate,
                  pending: t.actions.simulating,
                  disabled: t.actions.seasonComplete,
                }}
              />
              <StartNextSeasonButton
                disabled={snapshot.profile.season.status !== "COMPLETE"}
                labels={{
                  idle: t.actions.nextSeason,
                  pending: t.actions.nextSeasonLoading,
                  disabled: t.actions.finishSeasonFirst,
                }}
              />
              <ResetLeagueButton
                labels={{
                  idle: t.actions.reset,
                  pending: t.actions.resetting,
                }}
              />
            </div>
          </SectionCard>

          {snapshot.profile.season.status === "COMPLETE" ? (
            <SectionCard title={t.home.seasonComplete}>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {t.home.champion}: {snapshot.seasonAwards.champion?.name ?? "TBD"}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  MVP: {snapshot.seasonAwards.mvp ? `${snapshot.seasonAwards.mvp.player.firstName} ${snapshot.seasonAwards.mvp.player.lastName}` : "TBD"}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {t.home.renewHint}
                </div>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title={t.home.clubStaff}>
            <div className="grid gap-4">
              {staffDepartments.map((department) => {
                const localizedDepartmentLabel =
                  department.key === "training"
                    ? t.common.training
                    : department.key === "medical"
                      ? t.common.medical
                      : t.common.scouting;

                const localizedImpact =
                  department.key === "training"
                    ? locale === "zh"
                      ? "提升球队培养效率和整体备战质量。"
                      : "Improves squad development and overall readiness."
                    : department.key === "medical"
                      ? locale === "zh"
                        ? "提升体能恢复表现，让模拟中的体能加成更稳定。"
                        : "Raises stamina contribution inside the simulation engine."
                      : locale === "zh"
                        ? "强化球员评估和赛前准备，让引援判断更准确。"
                        : "Boosts evaluation and tactical preparation before games.";

                return (
                  <article key={department.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{localizedDepartmentLabel}</p>
                        <p className="mt-1 text-sm text-slate-300">
                          {t.common.level} {department.level}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">{localizedImpact}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <StaffUpgradeButton
                        department={department.key}
                        label={localizedDepartmentLabel}
                        cost={department.cost}
                        labels={{
                          idle: locale === "zh" ? "升级" : "Upgrade",
                          pending: locale === "zh" ? "升级中..." : "Upgrading...",
                        }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title={t.home.chemistryNotes} actionLabel={t.home.tuneLineup} actionHref="/lineup">
            <div className="grid gap-3">
              {snapshot.favoriteChemistry.notes.map((note) => (
                <div key={note} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {translateChemistryNote(note, locale)}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.nextFixtures}>
            <div className="grid gap-3">
              {snapshot.nextMatches.map((match) => (
                <article key={match.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">{locale === "zh" ? `第${match.round}轮` : `Round ${match.round}`}</p>
                  <p className="mt-2">
                    {match.awayTeam.name} {locale === "zh" ? "对阵" : "at"} {match.homeTeam.name}
                  </p>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.standingsSnapshot} actionLabel={t.home.viewStandings} actionHref="/standings">
            <div className="space-y-3">
              {snapshot.teams.slice(0, 5).map((team, index) => (
                <div key={team.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <p className="text-white">
                    {index + 1}. {team.name}
                  </p>
                  <p className="text-slate-300">
                    {team.wins}-{team.losses}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.franchiseHistory} actionLabel={t.home.fullAwards} actionHref="/stats">
            <div className="grid gap-3">
              {snapshot.seasonHistory.length === 0 ? (
                <p className="text-sm text-slate-300">{t.home.historyEmpty}</p>
              ) : (
                snapshot.seasonHistory.slice(0, 3).map((entry) => (
                  <div key={entry.seasonId} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <p className="font-semibold text-white">{entry.seasonName}</p>
                    <p className="mt-1 text-slate-300">{t.home.champion}: {entry.championTeamName}</p>
                    <p className="mt-1 text-slate-300">{locale === "zh" ? `你的战绩：${entry.favoriteTeamRecord}` : `Your record: ${entry.favoriteTeamRecord}`}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
