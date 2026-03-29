import { AppShell } from "@/components/app-shell";
import { OpenPackButton, SignPlayerButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale, translateRarity } from "@/lib/i18n";

export default async function MarketPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();

  return (
    <AppShell
      title={t.market.title}
      subtitle={t.market.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label={t.market.credits}
          value={String(snapshot.profile.credits)}
          caption={t.common.marketCreditsCaption}
        />
        <MetricCard
          label={t.market.openSlots}
          value={String(Math.max(0, 12 - snapshot.favoriteTeam.players.length))}
          caption={t.common.marketSlotsCaption}
        />
        <MetricCard
          label={t.market.scouting}
          value={String(snapshot.favoriteTeam.scoutingLevel)}
          caption={t.common.marketScoutingCaption}
        />
        <MetricCard
          label={t.market.reservePool}
          value={String(snapshot.reserveCount)}
          caption={t.common.marketReserveCaption}
        />
        <MetricCard
          label={t.market.capRoom}
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption={`${t.common.marketCapCaption} $${snapshot.favoriteTeam.budget.toLocaleString()}.`}
        />
      </section>

      <SectionCard title={t.market.cardPacks}>
        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[24px] border border-cyan-300/20 bg-[linear-gradient(160deg,rgba(34,211,238,0.18),rgba(255,255,255,0.04))] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">{t.market.standardPack}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{t.common.standardPackName}</h3>
            <p className="mt-2 text-sm text-slate-200">
              {t.common.standardPackDesc}
            </p>
            <div className="mt-5">
              <OpenPackButton
                packType="standard"
                label={t.actions.openStandard}
                cost={260}
                labels={{ idle: t.actions.openStandard, pending: t.actions.opening }}
              />
            </div>
          </article>

          <article className="rounded-[24px] border border-amber-300/20 bg-[linear-gradient(160deg,rgba(251,191,36,0.18),rgba(255,255,255,0.04))] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-100">{t.market.elitePack}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{t.common.elitePackName}</h3>
            <p className="mt-2 text-sm text-slate-200">
              {t.common.elitePackDesc}
            </p>
            <div className="mt-5">
              <OpenPackButton
                packType="elite"
                label={t.actions.openElite}
                cost={520}
                labels={{ idle: t.actions.openElite, pending: t.actions.opening }}
              />
            </div>
          </article>
          </div>

          <article className="card-reveal rounded-[24px] border border-white/10 bg-[linear-gradient(155deg,rgba(250,204,21,0.16),rgba(34,211,238,0.1),rgba(15,23,42,0.95))] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{t.market.latestReveal}</p>
            {snapshot.lastPackReveal?.player ? (
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                  <p className="text-sm text-slate-300">
                    {snapshot.lastPackReveal.packType === "elite" ? t.common.eliteDrop : t.common.standardDrop} {t.common.openedOn}{" "}
                    {new Date(snapshot.lastPackReveal.openedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_48%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.95))] p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-200">{t.market.cardUnlocked}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {snapshot.lastPackReveal.player.firstName} {snapshot.lastPackReveal.player.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {translateRarity(snapshot.lastPackReveal.player.rarity, locale)} | {snapshot.lastPackReveal.player.position} | {t.common.ovrShort} {snapshot.lastPackReveal.player.overall}
                  </p>
                </div>
                <PlayerShowcaseCard
                  player={snapshot.lastPackReveal.player}
                  href={`/players/${snapshot.lastPackReveal.player.id}`}
                  locale={locale}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/50 p-5 text-sm text-slate-300">
                {t.market.openFirstPack}
              </div>
            )}
          </article>
        </div>
      </SectionCard>

      <SectionCard title={t.market.availableFreeAgents}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.marketPlayers.map((player) => {
            const price = player.salary + snapshot.favoriteTeam.scoutingLevel * 80;
            return (
              <div key={player.id} className="grid gap-3">
                <PlayerShowcaseCard player={player} href={`/players/${player.id}`} locale={locale} />
                <SignPlayerButton
                  playerId={player.id}
                  price={price}
                  labels={{ idle: t.actions.signFor, pending: t.actions.signing }}
                />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </AppShell>
  );
}
