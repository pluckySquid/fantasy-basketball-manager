import { cookies } from "next/headers";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

const defaultLocale: Locale = "en";
const languageCookie = "fh-language";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(languageCookie)?.value;
  return value === "zh" ? "zh" : defaultLocale;
}

export async function setLocaleCookie(locale: Locale) {
  const store = await cookies();
  store.set(languageCookie, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "zh";
}

export const copy = {
  en: {
    appName: "Fantasy Hoops Director",
    nav: {
      dashboard: "Dashboard",
      roster: "Roster",
      lineup: "Lineup",
      market: "Market",
      trades: "Trades",
      schedule: "Schedule",
      standings: "Standings",
      stats: "Stats",
    },
    language: {
      label: "Language",
      en: "English",
      zh: "中文",
    },
    actions: {
      simulate: "Simulate Next Round",
      simulating: "Simulating...",
      seasonComplete: "Season Complete",
      reset: "Reset League",
      resetting: "Resetting...",
      nextSeason: "Start Next Season",
      nextSeasonLoading: "Rolling Over...",
      finishSeasonFirst: "Finish Season First",
      saveLineup: "Save Lineup",
      saving: "Saving...",
      training: "Run Training",
      trainingLoading: "Training...",
      signFor: "Sign for",
      signing: "Signing...",
      sellFor: "Sell for",
      selling: "Selling...",
      extendContract: "Extend Contract",
      negotiating: "Negotiating...",
      openStandard: "Open Standard Pack",
      openElite: "Open Elite Pack",
      opening: "Opening...",
      trade: "Trade",
    },
    home: {
      titleSuffix: "Front Office",
      subtitle:
        "Run a basketball club through a full season: manage the roster, set the lineup, simulate rounds, and track the table.",
      record: "Record",
      strength: "Team Strength",
      credits: "Club Credits",
      chemistry: "Chemistry",
      payrollRoom: "Payroll Room",
      recentResults: "Recent Results",
      fullSchedule: "Full schedule",
      noGames: "No games played yet. Simulate round 1 to begin the season.",
      leagueControls: "League Controls",
      clubStaff: "Club Staff",
      chemistryNotes: "Chemistry Notes",
      tuneLineup: "Tune lineup",
      nextFixtures: "Next Fixtures",
      standingsSnapshot: "Standings Snapshot",
      viewStandings: "View standings",
      rosterCore: "Roster Core",
      viewRoster: "View roster",
      seasonComplete: "Season Complete",
      leagueNews: "League News",
      champion: "Champion",
      renewHint: "Renew expiring deals, then roll into the next campaign with a fresh schedule and updated contracts.",
      franchiseHistory: "Franchise History",
      fullAwards: "Full awards",
      historyEmpty: "Your front office history will appear here once the first season ends.",
    },
    roster: {
      title: "Team Roster",
      subtitle: "Scout every contract on your roster, compare role fit, and jump into player cards for more detail.",
      payroll: "Payroll",
      averageOvr: "Average OVR",
      topPlayer: "Top Player",
      capRoom: "Cap Room",
      chemistry: "Chemistry",
      cards: "Cards",
      contractDesk: "Contract Desk",
      contractEmpty: "No urgent contract decisions right now. Your key pieces are locked in beyond this season.",
      actionNeeded: "Action Needed",
      tableView: "Table View",
      contract: "Contract",
      salary: "Salary",
    },
    lineup: {
      title: "Lineup Management",
      subtitle: "Set your five starters and three bench spots. Starters must match position, and no player can fill two roles.",
      chemistry: "Chemistry",
      strength: "Team Strength",
      payrollRoom: "Payroll Room",
      rotationBuilder: "Rotation Builder",
      quickRules: "Quick Rules",
    },
    market: {
      title: "Transfer Market",
      subtitle: "Scout free agents, compare rarities and archetypes, and spend credits to strengthen your squad.",
      credits: "Club Credits",
      openSlots: "Open Slots",
      scouting: "Scouting Level",
      reservePool: "Reserve Pool",
      capRoom: "Cap Room",
      cardPacks: "Card Packs",
      standardPack: "Standard Pack",
      elitePack: "Elite Pack",
      availableFreeAgents: "Available Free Agents",
      latestReveal: "Latest Reveal",
      cardUnlocked: "Card Unlocked",
      openFirstPack: "Open your first pack to reveal a new card here.",
    },
    trades: {
      title: "Trade Center",
      subtitle: "Browse AI-generated swap ideas, compare asset value, and reshape your roster without touching free agency.",
      liveProposals: "Live Proposals",
      tradeableCapRoom: "Tradeable Cap Room",
      chemistry: "Chemistry",
      board: "AI Trade Board",
      empty: "No clean one-for-one trades are available right now. Improve cap flexibility or finish the season for roster movement.",
      send: "You Send",
      receive: "You Receive",
    },
    schedule: {
      title: "Schedule and Results",
      subtitle: "Track every round, spot the fixtures still ahead, and review simulated results with top-performer summaries.",
      final: "Final",
      upcoming: "Upcoming",
    },
    standings: {
      title: "League Standings",
      subtitle: "Wins decide placement first, then point differential, then total points scored.",
      scoringLeader: "Scoring Leader",
      assistLeader: "Assist Leader",
      reboundLeader: "Rebound Leader",
      mvpLadder: "MVP Ladder",
      categoryLeaders: "Category Leaders",
      table: "Table",
    },
    stats: {
      title: "Season Leaders",
      subtitle: "Track the strongest individual seasons across the league and compare who is driving the MVP race.",
      seasonAwards: "Season Awards",
      contractWatch: "Contract Watch",
      franchiseTimeline: "Franchise Timeline",
    },
    player: {
      profile: "Profile",
      ratings: "Ratings Breakdown",
      notes: "Card Notes",
      training: "Training Facility",
      games: "Games",
      contract: "Contract",
      position: "Position",
      age: "Age",
      overall: "Overall",
      salary: "Salary",
      morale: "Morale",
      team: "Team",
      potential: "Potential",
      archetype: "Archetype",
    },
    common: {
      round: "Round",
      at: "at",
      level: "Level",
      training: "Training",
      medical: "Medical",
      scouting: "Scouting",
      scoring: "Scoring",
      playmaking: "Playmaking",
      rebounding: "Rebounding",
      defense: "Defense",
      stamina: "Stamina",
      potential: "Potential",
      overall: "Overall",
      salary: "Salary",
      fit: "Fit",
      age: "Age",
      yearsDeal: "Y Deal",
      player: "Player",
      position: "Pos",
      contractRemaining: "Years Remaining",
      legend: "Legend",
      elite: "Elite",
      starter: "Starter",
      rotation: "Rotation",
      creator: "Creator",
      anchor: "Anchor",
      twoWay: "Two-Way",
      slasher: "Slasher",
      bucket: "Bucket",
      floorGeneral: "Floor General",
      stopper: "Stopper",
      glassCleaner: "Glass Cleaner",
      shotCreator: "Shot Creator",
      pureScorer: "Pure Scorer",
      rimProtector: "Rim Protector",
      playmakingBig: "Playmaking Big",
      bronze: "Bronze",
      silver: "Silver",
      gold: "Gold",
      platinum: "Platinum",
      recordCaption: "League place updates after each simulated round.",
      strengthCaption: "Weighted from your active lineup, stamina, and morale.",
      chemistryFallback: "Build a balanced starting five.",
      payrollLine: "Cap line",
      payroll: "Payroll",
      rosterPayrollCaption: "Total salary commitment across the active roster.",
      rosterAverageCaption: "Quick read on roster quality.",
      rosterTopPlayerCaption: "Current leader by overall rating.",
      rosterBudgetCaption: "Budget ceiling",
      rosterChemistryCaption: "Balanced roles improve team strength.",
      marketCreditsCaption: "Use credits to sign free agents and train your roster.",
      marketSlotsCaption: "You can carry up to 12 players in this MVP.",
      marketScoutingCaption: "Higher scouting makes it easier to build a deeper roster.",
      marketReserveCaption: "Pack inventory still waiting in the hidden reserve pool.",
      marketCapCaption: "You cannot sign players if salary pushes payroll over",
      standardPackName: "Roster Booster",
      standardPackDesc: "A cheaper way to add fresh talent. Good for depth and rotation upgrades.",
      elitePackName: "Premium Drop",
      elitePackDesc: "Better odds at top-end cards and higher immediate upside for your club.",
      eliteDrop: "Elite drop",
      standardDrop: "Standard drop",
      openedOn: "opened on",
      ovrShort: "OVR",
    },
  },
  zh: {
    appName: "梦幻篮球经理",
    nav: {
      dashboard: "主页",
      roster: "阵容",
      lineup: "排阵",
      market: "市场",
      trades: "交易",
      schedule: "赛程",
      standings: "排名",
      stats: "数据",
    },
    language: {
      label: "语言",
      en: "English",
      zh: "中文",
    },
    actions: {
      simulate: "模拟下一轮",
      simulating: "模拟中...",
      seasonComplete: "赛季结束",
      reset: "重置联盟",
      resetting: "重置中...",
      nextSeason: "进入下一赛季",
      nextSeasonLoading: "赛季结算中...",
      finishSeasonFirst: "请先完成本赛季",
      saveLineup: "保存阵容",
      saving: "保存中...",
      training: "开始训练",
      trainingLoading: "训练中...",
      signFor: "签下球员",
      signing: "签约中...",
      sellFor: "出售获得",
      selling: "出售中...",
      extendContract: "续约",
      negotiating: "谈判中...",
      openStandard: "开启普通卡包",
      openElite: "开启高级卡包",
      opening: "开启中...",
      trade: "交易",
    },
    home: {
      titleSuffix: "总经理办公室",
      subtitle: "管理你的篮球俱乐部，安排阵容、模拟比赛、追踪排名，并一步步打造冠军球队。",
      record: "战绩",
      strength: "球队强度",
      credits: "俱乐部资金",
      chemistry: "化学反应",
      payrollRoom: "薪资空间",
      recentResults: "近期赛果",
      fullSchedule: "查看完整赛程",
      noGames: "还没有进行任何比赛，先模拟第一轮开始赛季。",
      leagueControls: "联赛控制",
      clubStaff: "球队员工",
      chemistryNotes: "化学反应提示",
      tuneLineup: "调整阵容",
      nextFixtures: "下一轮赛程",
      standingsSnapshot: "排名快照",
      viewStandings: "查看排名",
      rosterCore: "核心球员",
      viewRoster: "查看阵容",
      seasonComplete: "赛季已结束",
      leagueNews: "联赛新闻",
      champion: "冠军",
      renewHint: "先处理即将到期的合同，再带着新的赛程和更新后的阵容进入下一赛季。",
      franchiseHistory: "球队历史",
      fullAwards: "查看奖项",
      historyEmpty: "当你完成第一个赛季后，这里会显示你的球队历史。",
    },
    roster: {
      title: "球队阵容",
      subtitle: "查看你的所有合同、角色定位和球员卡，并直接进入球员详情页。",
      payroll: "总薪资",
      averageOvr: "平均能力",
      topPlayer: "头号球星",
      capRoom: "薪资空间",
      chemistry: "化学反应",
      cards: "球员卡",
      contractDesk: "合同中心",
      contractEmpty: "目前没有紧急续约问题，你的核心球员合同还比较稳定。",
      actionNeeded: "需要处理",
      tableView: "表格视图",
      contract: "合同",
      salary: "薪资",
    },
    lineup: {
      title: "排阵管理",
      subtitle: "设置五名首发和三名替补。首发必须符合位置，且同一球员不能重复上场。",
      chemistry: "化学反应",
      strength: "球队强度",
      payrollRoom: "薪资空间",
      rotationBuilder: "轮换设置",
      quickRules: "规则说明",
    },
    market: {
      title: "转会市场",
      subtitle: "考察自由球员，对比稀有度和定位，并用资金补强你的球队。",
      credits: "俱乐部资金",
      openSlots: "阵容空位",
      scouting: "球探等级",
      reservePool: "卡包储备",
      capRoom: "薪资空间",
      cardPacks: "球员卡包",
      standardPack: "普通卡包",
      elitePack: "高级卡包",
      availableFreeAgents: "可签约自由球员",
      latestReveal: "最近开包",
      cardUnlocked: "获得新球员卡",
      openFirstPack: "先开启一个卡包，这里就会展示你抽到的球员。",
    },
    trades: {
      title: "交易中心",
      subtitle: "查看系统生成的交易方案，对比筹码价值，不通过自由市场也能重组球队。",
      liveProposals: "可执行方案",
      tradeableCapRoom: "可交易薪资空间",
      chemistry: "化学反应",
      board: "智能交易面板",
      empty: "当前没有合适的一换一交易方案。你可以先整理薪资，或进入下一个阶段后再尝试。",
      send: "你送出",
      receive: "你得到",
    },
    schedule: {
      title: "赛程与结果",
      subtitle: "查看每一轮赛程，关注即将到来的比赛，并复盘已经模拟完成的赛果。",
      final: "已结束",
      upcoming: "即将开始",
    },
    standings: {
      title: "联赛排名",
      subtitle: "先看胜场，再看净胜分，最后看总得分。",
      scoringLeader: "得分王",
      assistLeader: "助攻王",
      reboundLeader: "篮板王",
      mvpLadder: "MVP 排行",
      categoryLeaders: "数据领袖",
      table: "排名表",
    },
    stats: {
      title: "赛季数据",
      subtitle: "追踪联赛中表现最强的球员，并比较谁正在领跑 MVP 竞争。",
      seasonAwards: "赛季奖项",
      contractWatch: "合同观察",
      franchiseTimeline: "球队年表",
    },
    player: {
      profile: "球员资料",
      ratings: "能力分布",
      notes: "球员卡说明",
      training: "训练中心",
      games: "出场",
      contract: "合同",
      position: "位置",
      age: "年龄",
      overall: "总评",
      salary: "薪资",
      morale: "士气",
      team: "球队",
      potential: "潜力",
      archetype: "定位",
    },
    common: {
      round: "第",
      at: "对阵",
      level: "等级",
      training: "训练",
      medical: "医疗",
      scouting: "球探",
      scoring: "得分",
      playmaking: "组织",
      rebounding: "篮板",
      defense: "防守",
      stamina: "体能",
      potential: "潜力",
      overall: "总评",
      salary: "薪资",
      fit: "适配",
      age: "年龄",
      yearsDeal: "年合同",
      player: "球员",
      position: "位置",
      contractRemaining: "剩余年限",
      legend: "传奇",
      elite: "精英",
      starter: "首发",
      rotation: "轮换",
      creator: "组织者",
      anchor: "支柱",
      twoWay: "攻防一体",
      slasher: "突破手",
      bucket: "得分手",
      floorGeneral: "球场指挥官",
      stopper: "防守大闸",
      glassCleaner: "篮板怪",
      shotCreator: "自主得分手",
      pureScorer: "纯得分手",
      rimProtector: "护框者",
      playmakingBig: "策应内线",
      bronze: "青铜",
      silver: "白银",
      gold: "黄金",
      platinum: "传奇",
      recordCaption: "每模拟一轮后都会更新联赛排名。",
      strengthCaption: "根据当前阵容、体能和士气综合计算。",
      chemistryFallback: "尽量搭配更平衡的首发五人。",
      payrollLine: "工资帽",
      payroll: "总薪资",
      rosterPayrollCaption: "当前阵容全部球员的薪资总额。",
      rosterAverageCaption: "快速判断球队整体战力。",
      rosterTopPlayerCaption: "当前总评最高的核心球员。",
      rosterBudgetCaption: "预算上限",
      rosterChemistryCaption: "角色越平衡，球队战力越稳定。",
      marketCreditsCaption: "用资金签下自由球员并训练你的阵容。",
      marketSlotsCaption: "这个 MVP 版本最多可拥有 12 名球员。",
      marketScoutingCaption: "更高的球探等级更容易补强阵容深度。",
      marketReserveCaption: "还有一些卡包球员尚未从储备池中开出。",
      marketCapCaption: "如果签约后总薪资超过",
      standardPackName: "阵容补强包",
      standardPackDesc: "更便宜的补强方式，适合增加深度和轮换。",
      elitePackName: "高级精选包",
      elitePackDesc: "更高概率获得强力球员，能立刻提升球队上限。",
      eliteDrop: "高级开包",
      standardDrop: "普通开包",
      openedOn: "开启于",
      ovrShort: "总评",
    },
  },
} as const;

export function buildNav(locale: Locale) {
  const t = copy[locale];
  return [
    { href: "/", label: t.nav.dashboard },
    { href: "/roster", label: t.nav.roster },
    { href: "/lineup", label: t.nav.lineup },
    { href: "/market", label: t.nav.market },
    { href: "/trades", label: t.nav.trades },
    { href: "/schedule", label: t.nav.schedule },
    { href: "/standings", label: t.nav.standings },
    { href: "/stats", label: t.nav.stats },
  ];
}

export function translateRarity(rarity: string, locale: Locale) {
  if (locale === "en") {
    return rarity;
  }

  const t = copy[locale].common;
  if (rarity === "Bronze") return t.bronze;
  if (rarity === "Silver") return t.silver;
  if (rarity === "Gold") return t.gold;
  if (rarity === "Platinum") return t.platinum;
  return rarity;
}

export function translateArchetype(archetype: string, locale: Locale) {
  const t = copy[locale].common;
  if (archetype === "Floor General") return t.floorGeneral;
  if (archetype === "Shot Creator") return t.shotCreator;
  if (archetype === "Pure Scorer") return t.pureScorer;
  if (archetype === "Two-Way Wing") return t.twoWay;
  if (archetype === "Athletic Slasher") return t.slasher;
  if (archetype === "Glass Cleaner") return t.glassCleaner;
  if (archetype === "Rim Protector") return t.rimProtector;
  if (archetype === "Playmaking Big") return t.playmakingBig;
  return archetype;
}

export function translateChemistryNote(note: string, locale: Locale) {
  if (locale === "en") {
    return note;
  }

  const map: Record<string, string> = {
    "No lineup configured.": "尚未设置阵容。",
    "Natural starter positions are filled.": "首发位置配置合理，没有错位问题。",
    "Starter role overlap hurts spacing and balance.": "首发角色重叠，影响空间和阵容平衡。",
    "Multiple creators keep the offense flowing.": "多名组织点让进攻运转更加流畅。",
    "Only one reliable creator in the first unit.": "首发阵容里只有一名稳定组织点。",
    "Interior anchor stabilizes defense and rebounding.": "内线支柱稳住了防守和篮板。",
    "No true interior anchor in the lineup.": "当前阵容缺少真正的内线支柱。",
    "Two-way wings improve matchup flexibility.": "攻防一体的锋线提升了对位弹性。",
    "Slashing and spacing complement each other well.": "突破与拉开空间形成了很好的互补。",
    "The starters bring a healthy mix of roles.": "首发角色分工清晰，整体搭配健康。",
    "Too many starters share the same role profile.": "首发角色同质化过高，功能重叠明显。",
  };

  return map[note] ?? note;
}

export function translateMatchSummary(summary: string | null, locale: Locale) {
  if (!summary || locale === "en") {
    return summary;
  }

  let result = summary;
  result = result.replace(/^([A-Z]{2,4}) controlled the fourth quarter and defended home court\.$/, "$1 在第四节掌控比赛，成功守住主场。");
  result = result.replace(/^([A-Z]{2,4}) stole a road win with a stronger late-game push\.$/, "$1 在比赛末段完成反扑，客场带走胜利。");
  return result;
}

export function translateServerMessage(message: string, locale: Locale) {
  if (locale === "en") {
    return message;
  }

  let result = message;
  const replacements: Array<[RegExp | string, string]> = [
    ["Lineup saved.", "阵容已保存。"],
    ["The season is already complete.", "本赛季已经结束。"],
    ["Finish the current season before rolling over.", "请先完成当前赛季，再进入下一赛季。"],
    ["Unknown staff department.", "未知的员工部门。"],
    ["Unknown pack type.", "未知的卡包类型。"],
    ["Unknown training focus.", "未知的训练方向。"],
    ["Unknown language.", "未知的语言选项。"],
    ["That player is not on your roster.", "这名球员不在你的阵容中。"],
    ["This player is already on a long-term deal.", "这名球员已经签下长期合同。"],
    ["Trade target is no longer available.", "交易目标已经无法获取。"],
    ["The other team rejected the value of this offer.", "对方球队认为这笔交易价值不合适。"],
    ["That trade would push you over the salary limit.", "这笔交易会让你的薪资超限。"],
    ["The other team cannot absorb this contract.", "对方球队无法接收这份合同。"],
    ["That player is no longer on the market.", "这名球员已经不在市场上。"],
    ["Your roster is full. Sell a player before signing another.", "你的阵容已满，请先出售球员再签新球员。"],
    ["Your roster is full. Sell a player before opening a pack.", "你的阵容已满，请先出售球员再开卡包。"],
    ["Keep at least 8 players so your lineup remains valid.", "请至少保留 8 名球员，确保阵容依然有效。"],
    ["No more player packs are available in this build.", "当前版本已经没有更多可开启的球员卡包。"],
    ["Every selected player must belong to your roster.", "所选球员必须全部来自你的阵容。"],
    ["Each lineup slot must use a different player.", "每个阵容位置都必须使用不同的球员。"],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern as never, replacement);
  }

  result = result.replace(/^Round (\d+) simulated\.$/, "第$1轮模拟完成。");
  result = result.replace(/^(.+) is underway\.$/, "$1 已经开始。");
  result = result.replace(/^Not enough credits\. (training|medical|scouting) upgrade costs (\d+)\.$/, "资金不足。$1 部门升级需要 $2 点资金。");
  result = result.replace(/^Not enough credits\. Training costs (\d+)\.$/, "资金不足。训练需要 $1 点资金。");
  result = result.replace(/^Not enough credits\. Extension costs (\d+)\.$/, "资金不足。续约需要 $1 点资金。");
  result = result.replace(/^Not enough credits\. Signing costs (\d+)\.$/, "资金不足。签约需要 $1 点资金。");
  result = result.replace(/^Not enough credits\. (standard|elite) pack costs (\d+)\.$/, "资金不足。$1 卡包需要 $2 点资金。");
  result = result.replace(/^Not enough cap room\. You need (\d+) more payroll room\.$/, "薪资空间不足。你还需要额外释放 $1 的薪资空间。");
  result = result.replace(/^(.+) improved (scoring|playmaking|rebounding|defense|stamina)\.$/, "$1 的 $2 能力获得提升。");
  result = result.replace(/^(.+) signed a one-year extension\.$/, "$1 完成了一年续约。");
  result = result.replace(/^([A-Z]{2,4}) accepted\. (.+) joined your club\.$/, "$1 接受了报价。$2 加入了你的球队。");
  result = result.replace(/^(.+) joined your club\.$/, "$1 加入了你的球队。");
  result = result.replace(/^(.+) was sold for (\d+) credits\.$/, "$1 已出售，获得 $2 点资金。");
  result = result.replace(/^(.+) joined your roster from a (standard|elite) pack\.$/, "$1 已从 $2 卡包加入你的阵容。");
  result = result.replace(/^Your (PG|SG|SF|PF|C) starter must play (PG|SG|SF|PF|C)\.$/, "你的 $1 首发必须由 $2 位置的球员担任。");
  result = result.replace(/\btraining\b/g, "训练");
  result = result.replace(/\bmedical\b/g, "医疗");
  result = result.replace(/\bscouting\b/g, "球探");
  result = result.replace(/\bscoring\b/g, "得分");
  result = result.replace(/\bplaymaking\b/g, "组织");
  result = result.replace(/\brebounding\b/g, "篮板");
  result = result.replace(/\bdefense\b/g, "防守");
  result = result.replace(/\bstamina\b/g, "体能");
  result = result.replace(/\bstandard\b/g, "普通");
  result = result.replace(/\belite\b/g, "高级");
  return result;
}
