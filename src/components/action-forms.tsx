"use client";

import { useActionState } from "react";
import {
  extendContractAction,
  executeTradeAction,
  openPackAction,
  resetLeagueAction,
  saveLineupAction,
  sellPlayerAction,
  setLanguageAction,
  signPlayerAction,
  simulateRoundAction,
  startNextSeasonAction,
  trainPlayerAction,
  upgradeStaffAction,
} from "@/app/actions";

const initialState = { ok: true, message: "" };

export function SimulateRoundButton({ disabled, labels }: { disabled: boolean; labels?: ActionLabels }) {
  const [state, action, pending] = useActionState(simulateRoundAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={disabled || pending}
        className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? labels?.pending ?? "Simulating..." : disabled ? labels?.disabled ?? "Season Complete" : labels?.idle ?? "Simulate Next Round"}
      </button>
      {state.message ? <p className="text-xs text-slate-400">{state.message}</p> : null}
    </form>
  );
}

type ActionLabels = {
  idle: string;
  pending: string;
  disabled?: string;
};

export function ResetLeagueButton({ labels }: { labels?: ActionLabels }) {
  const [state, action, pending] = useActionState(resetLeagueAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? labels?.pending ?? "Resetting..." : labels?.idle ?? "Reset League"}
      </button>
      {state.message ? <p className="text-xs text-slate-400">{state.message}</p> : null}
    </form>
  );
}

export function StartNextSeasonButton({ disabled, labels }: { disabled: boolean; labels?: ActionLabels }) {
  const [state, action, pending] = useActionState(startNextSeasonAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={disabled || pending}
        className="w-full rounded-2xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? labels?.pending ?? "Rolling Over..." : disabled ? labels?.disabled ?? "Finish Season First" : labels?.idle ?? "Start Next Season"}
      </button>
      {state.message ? <p className="text-xs text-slate-400">{state.message}</p> : null}
    </form>
  );
}

export function LanguageSwitcher({
  currentLocale,
  labels,
}: {
  currentLocale: "en" | "zh";
  labels: {
    label: string;
    en: string;
    zh: string;
  };
}) {
  const [, action, pending] = useActionState(setLanguageAction, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{labels.label}</span>
      {[
        { locale: "en", label: labels.en },
        { locale: "zh", label: labels.zh },
      ].map((option) => (
        <button
          key={option.locale}
          type="submit"
          name="locale"
          value={option.locale}
          disabled={pending || currentLocale === option.locale}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            currentLocale === option.locale
              ? "border-amber-300/40 bg-amber-300/12 text-amber-100"
              : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          }`}
        >
          {option.label}
        </button>
      ))}
    </form>
  );
}

export function LineupForm({
  players,
  currentLineup,
  labels,
}: {
  players: Array<{
    id: string;
    fullName: string;
    position: string;
    overall: number;
  }>;
  currentLineup: Record<string, string>;
  labels?: {
    save: string;
    saving: string;
    fieldLabels?: string[];
  };
}) {
  const [state, action, pending] = useActionState(saveLineupAction, initialState);

  const fieldLabels: Array<[string, string]> = [
    ["pgId", labels?.fieldLabels?.[0] ?? "Starting PG"],
    ["sgId", labels?.fieldLabels?.[1] ?? "Starting SG"],
    ["sfId", labels?.fieldLabels?.[2] ?? "Starting SF"],
    ["pfId", labels?.fieldLabels?.[3] ?? "Starting PF"],
    ["cId", labels?.fieldLabels?.[4] ?? "Starting C"],
    ["benchOneId", labels?.fieldLabels?.[5] ?? "Bench 1"],
    ["benchTwoId", labels?.fieldLabels?.[6] ?? "Bench 2"],
    ["benchThreeId", labels?.fieldLabels?.[7] ?? "Bench 3"],
  ];

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        {fieldLabels.map(([field, label]) => (
          <label key={field} className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">{label}</span>
            <select
              name={field}
              defaultValue={currentLineup[field]}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-amber-300/70"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.fullName} | {player.position} | OVR {player.overall}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        >
          {pending ? labels?.saving ?? "Saving..." : labels?.save ?? "Save Lineup"}
        </button>
        <p className={`text-sm ${state.ok ? "text-slate-300" : "text-rose-300"}`}>{state.message}</p>
      </div>
    </form>
  );
}

export function StaffUpgradeButton({
  department,
  label,
  cost,
  labels,
}: {
  department: "training" | "medical" | "scouting";
  label: string;
  cost: number;
  labels?: ActionLabels;
}) {
  const [state, action, pending] = useActionState(upgradeStaffAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="department" value={department} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? labels?.pending ?? "Upgrading..." : `${labels?.idle ?? "Upgrade"} ${label} (${cost} cr)`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function SignPlayerButton({
  playerId,
  price,
  labels,
}: {
  playerId: string;
  price: number;
  labels?: ActionLabels;
}) {
  const [state, action, pending] = useActionState(signPlayerAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? labels?.pending ?? "Signing..." : `${labels?.idle ?? "Sign for"} ${price} cr`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function TrainPlayerForm({
  playerId,
  labels,
}: {
  playerId: string;
  labels?: {
    focus: string;
    options: string[];
    idle: string;
    pending: string;
  };
}) {
  const [state, action, pending] = useActionState(trainPlayerAction, initialState);
  const options = [
    ["scoring", "Scoring Session"],
    ["playmaking", "Playmaking Session"],
    ["rebounding", "Rebounding Session"],
    ["defense", "Defense Session"],
    ["stamina", "Conditioning Session"],
  ] as const;

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="playerId" value={playerId} />
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-200">{labels?.focus ?? "Training focus"}</span>
        <select
          name="focus"
          defaultValue="scoring"
          className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/70"
        >
          {options.map(([value, label], index) => (
            <option key={value} value={value}>
              {labels?.options?.[index] ?? label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? labels?.pending ?? "Training..." : labels?.idle ?? "Run Training"}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function ExtendContractButton({
  playerId,
  cost,
  labels,
}: {
  playerId: string;
  cost: number;
  labels?: ActionLabels;
}) {
  const [state, action, pending] = useActionState(extendContractAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-sky-300/25 bg-sky-300/12 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? labels?.pending ?? "Negotiating..." : `${labels?.idle ?? "Extend Contract"} (${cost} cr)`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function ExecuteTradeButton({
  givePlayerId,
  receivePlayerId,
  label,
  labels,
}: {
  givePlayerId: string;
  receivePlayerId: string;
  label: string;
  labels?: ActionLabels;
}) {
  const [state, action, pending] = useActionState(executeTradeAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="givePlayerId" value={givePlayerId} />
      <input type="hidden" name="receivePlayerId" value={receivePlayerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-violet-300/25 bg-violet-300/12 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? labels?.pending ?? "Negotiating..." : label}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function SellPlayerButton({
  playerId,
  value,
  labels,
}: {
  playerId: string;
  value: number;
  labels?: ActionLabels;
}) {
  const [state, action, pending] = useActionState(sellPlayerAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? labels?.pending ?? "Selling..." : `${labels?.idle ?? "Sell for"} ${value} cr`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function OpenPackButton({
  packType,
  label,
  cost,
  labels,
}: {
  packType: "standard" | "elite";
  label: string;
  cost: number;
  labels?: ActionLabels;
}) {
  const [state, action, pending] = useActionState(openPackAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="packType" value={packType} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-cyan-300/25 bg-cyan-300/12 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? labels?.pending ?? "Opening..." : `${label} (${cost} cr)`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}
