import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ExtendContractButton, TrainPlayerForm } from "@/components/action-forms";
import { PlayerPortrait, RatingBar, SectionCard } from "@/components/ui";
import { getPlayerById } from "@/lib/game-state";
import { buildNav, copy, getLocale, translateArchetype, translateRarity } from "@/lib/i18n";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const t = copy[locale];
  const { id } = await params;
  const player = await getPlayerById(id);

  if (!player) {
    notFound();
  }

  return (
    <AppShell
      title={`${player.firstName} ${player.lastName}`}
      subtitle={
        locale === "zh"
          ? `${player.team.name} 的详细球员卡页面，可在这里查看定位、薪资和能力构成。`
          : `Detailed player card for ${player.team.name}. Use this page to inspect role fit, salary, and attribute profile.`
      }
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <SectionCard title={t.player.profile}>
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] p-5">
            <PlayerPortrait
              name={`${player.firstName} ${player.lastName}`}
              rarity={player.rarity}
              className="mb-5 h-64 w-full"
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{t.player.profile}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{player.overall}</p>
                <p className="text-sm text-slate-300">{locale === "zh" ? "综合能力评分" : "Overall rating"}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-amber-200">
                {translateRarity(player.rarity, locale)} | {t.player.archetype}: {translateArchetype(player.archetype, locale)}
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <p>{t.player.position}: {player.position}</p>
              <p>{t.player.age}: {player.age}</p>
              <p>{t.player.overall}: {player.overall}</p>
              <p>{t.player.salary}: ${player.salary.toLocaleString()}</p>
              <p>{t.player.contract}: {player.contractYears} {locale === "zh" ? "年" : "years"}</p>
              <p>{t.player.morale}: {player.morale}</p>
              <p>{t.player.team}: {player.team.abbreviation}</p>
              <p>{t.player.potential}: {player.potential}</p>
              <p>{t.player.archetype}: {translateArchetype(player.archetype, locale)}</p>
            </div>
            <div className="mt-5 grid gap-3 rounded-[20px] border border-white/10 bg-slate-950/55 p-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.player.games}</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.games}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">PPG</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.ppg.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">RPG</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.rpg.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">APG</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.apg.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t.player.ratings}>
          <div className="grid gap-4">
            <RatingBar label={t.common.scoring} value={player.scoring} />
            <RatingBar label={t.common.playmaking} value={player.playmaking} />
            <RatingBar label={t.common.rebounding} value={player.rebounding} />
            <RatingBar label={t.common.defense} value={player.defense} />
            <RatingBar label={t.common.stamina} value={player.stamina} />
            <RatingBar label={t.common.potential} value={player.potential} />
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <SectionCard title={t.player.notes}>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              {locale === "zh"
                ? `${player.firstName} 在这套 MVP 系统里被定义为${player.archetype}，并拥有 ${player.rarity} 稀有度球员卡。`
                : `${player.firstName} is tagged as a ${player.archetype.toLowerCase()} and carries ${player.rarity.toLowerCase()} card status in this MVP.`}
            </p>
            <p>
              {locale === "zh"
                ? "训练每次只会强化一项核心能力，并逐步把总评推向这名球员的潜力上限。"
                : "Training raises one key attribute at a time and can push the overall rating toward the player's potential cap."}
            </p>
            <p>
              {locale === "zh"
                ? "士气高的球员通常更保值，也会在赛季模拟中贡献得更稳定。"
                : "High-morale players hold their value better and contribute more consistently during season simulations."}
            </p>
          </div>
        </SectionCard>

        <SectionCard title={t.player.training}>
          <div className="grid gap-4">
            <TrainPlayerForm
              playerId={player.id}
              labels={{
                focus: locale === "zh" ? "训练方向" : "Training focus",
                options:
                  locale === "zh"
                    ? ["得分训练", "组织训练", "篮板训练", "防守训练", "体能训练"]
                    : [],
                idle: t.actions.training,
                pending: t.actions.trainingLoading,
              }}
            />
            {player.team.id !== "MARKET" ? (
              <ExtendContractButton
                playerId={player.id}
                cost={Math.round(player.salary * 0.6 + player.overall * 18 + Math.max(0, 3 - player.contractYears) * 120)}
                labels={{
                  idle: t.actions.extendContract,
                  pending: t.actions.negotiating,
                }}
              />
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
