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
      zh: "ä¸­æ–‡",
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
    appName: "æ¢¦å¹»ç¯®çƒç»ç†",
    nav: {
      dashboard: "ä¸»é¡µ",
      roster: "é˜µå®¹",
      lineup: "æŽ’é˜µ",
      market: "å¸‚åœº",
      trades: "äº¤æ˜“",
      schedule: "èµ›ç¨‹",
      standings: "æŽ’å",
      stats: "æ•°æ®",
    },
    language: {
      label: "è¯­è¨€",
      en: "English",
      zh: "ä¸­æ–‡",
    },
    actions: {
      simulate: "æ¨¡æ‹Ÿä¸‹ä¸€è½®",
      simulating: "æ¨¡æ‹Ÿä¸­...",
      seasonComplete: "èµ›å­£ç»“æŸ",
      reset: "é‡ç½®è”ç›Ÿ",
      resetting: "é‡ç½®ä¸­...",
      nextSeason: "è¿›å…¥ä¸‹ä¸€èµ›å­£",
      nextSeasonLoading: "èµ›å­£ç»“ç®—ä¸­...",
      finishSeasonFirst: "è¯·å…ˆå®Œæˆæœ¬èµ›å­£",
      saveLineup: "ä¿å­˜é˜µå®¹",
      saving: "ä¿å­˜ä¸­...",
      training: "å¼€å§‹è®­ç»ƒ",
      trainingLoading: "è®­ç»ƒä¸­...",
      signFor: "ç­¾ä¸‹çƒå‘˜",
      signing: "ç­¾çº¦ä¸­...",
      sellFor: "å‡ºå”®èŽ·å¾—",
      selling: "å‡ºå”®ä¸­...",
      extendContract: "ç»­çº¦",
      negotiating: "è°ˆåˆ¤ä¸­...",
      openStandard: "å¼€å¯æ™®é€šå¡åŒ…",
      openElite: "å¼€å¯é«˜çº§å¡åŒ…",
      opening: "å¼€å¯ä¸­...",
      trade: "äº¤æ˜“",
    },
    home: {
      titleSuffix: "æ€»ç»ç†åŠžå…¬å®¤",
      subtitle: "ç®¡ç†ä½ çš„ç¯®çƒä¿±ä¹éƒ¨ï¼Œå®‰æŽ’é˜µå®¹ã€æ¨¡æ‹Ÿæ¯”èµ›ã€è¿½è¸ªæŽ’åï¼Œå¹¶ä¸€æ­¥æ­¥æ‰“é€ å† å†›çƒé˜Ÿã€‚",
      record: "æˆ˜ç»©",
      strength: "çƒé˜Ÿå¼ºåº¦",
      credits: "ä¿±ä¹éƒ¨èµ„é‡‘",
      chemistry: "åŒ–å­¦ååº”",
      payrollRoom: "è–ªèµ„ç©ºé—´",
      recentResults: "è¿‘æœŸèµ›æžœ",
      fullSchedule: "æŸ¥çœ‹å®Œæ•´èµ›ç¨‹",
      noGames: "è¿˜æ²¡æœ‰è¿›è¡Œä»»ä½•æ¯”èµ›ï¼Œå…ˆæ¨¡æ‹Ÿç¬¬ä¸€è½®å¼€å§‹èµ›å­£ã€‚",
      leagueControls: "è”èµ›æŽ§åˆ¶",
      clubStaff: "çƒé˜Ÿå‘˜å·¥",
      chemistryNotes: "åŒ–å­¦ååº”æç¤º",
      tuneLineup: "è°ƒæ•´é˜µå®¹",
      nextFixtures: "ä¸‹ä¸€è½®èµ›ç¨‹",
      standingsSnapshot: "æŽ’åå¿«ç…§",
      viewStandings: "æŸ¥çœ‹æŽ’å",
      rosterCore: "æ ¸å¿ƒçƒå‘˜",
      viewRoster: "æŸ¥çœ‹é˜µå®¹",
      seasonComplete: "èµ›å­£å·²ç»“æŸ",
      leagueNews: "è”èµ›æ–°é—»",
      champion: "å† å†›",
      renewHint: "å…ˆå¤„ç†å³å°†åˆ°æœŸçš„åˆåŒï¼Œå†å¸¦ç€æ–°çš„èµ›ç¨‹å’Œæ›´æ–°åŽçš„é˜µå®¹è¿›å…¥ä¸‹ä¸€èµ›å­£ã€‚",
      franchiseHistory: "çƒé˜ŸåŽ†å²",
      fullAwards: "æŸ¥çœ‹å¥–é¡¹",
      historyEmpty: "å½“ä½ å®Œæˆç¬¬ä¸€ä¸ªèµ›å­£åŽï¼Œè¿™é‡Œä¼šæ˜¾ç¤ºä½ çš„çƒé˜ŸåŽ†å²ã€‚",
    },
    roster: {
      title: "çƒé˜Ÿé˜µå®¹",
      subtitle: "æŸ¥çœ‹ä½ çš„æ‰€æœ‰åˆåŒã€è§’è‰²å®šä½å’Œçƒå‘˜å¡ï¼Œå¹¶ç›´æŽ¥è¿›å…¥çƒå‘˜è¯¦æƒ…é¡µã€‚",
      payroll: "æ€»è–ªèµ„",
      averageOvr: "å¹³å‡èƒ½åŠ›",
      topPlayer: "å¤´å·çƒæ˜Ÿ",
      capRoom: "è–ªèµ„ç©ºé—´",
      chemistry: "åŒ–å­¦ååº”",
      cards: "çƒå‘˜å¡",
      contractDesk: "åˆåŒä¸­å¿ƒ",
      contractEmpty: "ç›®å‰æ²¡æœ‰ç´§æ€¥ç»­çº¦é—®é¢˜ï¼Œä½ çš„æ ¸å¿ƒçƒå‘˜åˆåŒè¿˜æ¯”è¾ƒç¨³å®šã€‚",
      actionNeeded: "éœ€è¦å¤„ç†",
      tableView: "è¡¨æ ¼è§†å›¾",
      contract: "åˆåŒ",
      salary: "è–ªèµ„",
    },
    lineup: {
      title: "æŽ’é˜µç®¡ç†",
      subtitle: "è®¾ç½®äº”åé¦–å‘å’Œä¸‰åæ›¿è¡¥ã€‚é¦–å‘å¿…é¡»ç¬¦åˆä½ç½®ï¼Œä¸”åŒä¸€çƒå‘˜ä¸èƒ½é‡å¤ä¸Šåœºã€‚",
      chemistry: "åŒ–å­¦ååº”",
      strength: "çƒé˜Ÿå¼ºåº¦",
      payrollRoom: "è–ªèµ„ç©ºé—´",
      rotationBuilder: "è½®æ¢è®¾ç½®",
      quickRules: "è§„åˆ™è¯´æ˜Ž",
    },
    market: {
      title: "è½¬ä¼šå¸‚åœº",
      subtitle: "è€ƒå¯Ÿè‡ªç”±çƒå‘˜ï¼Œå¯¹æ¯”ç¨€æœ‰åº¦å’Œå®šä½ï¼Œå¹¶ç”¨èµ„é‡‘è¡¥å¼ºä½ çš„çƒé˜Ÿã€‚",
      credits: "ä¿±ä¹éƒ¨èµ„é‡‘",
      openSlots: "é˜µå®¹ç©ºä½",
      scouting: "çƒæŽ¢ç­‰çº§",
      reservePool: "å¡åŒ…å‚¨å¤‡",
      capRoom: "è–ªèµ„ç©ºé—´",
      cardPacks: "çƒå‘˜å¡åŒ…",
      standardPack: "æ™®é€šå¡åŒ…",
      elitePack: "é«˜çº§å¡åŒ…",
      availableFreeAgents: "å¯ç­¾çº¦è‡ªç”±çƒå‘˜",
      latestReveal: "æœ€è¿‘å¼€åŒ…",
      cardUnlocked: "èŽ·å¾—æ–°çƒå‘˜å¡",
      openFirstPack: "å…ˆå¼€å¯ä¸€ä¸ªå¡åŒ…ï¼Œè¿™é‡Œå°±ä¼šå±•ç¤ºä½ æŠ½åˆ°çš„çƒå‘˜ã€‚",
    },
    trades: {
      title: "äº¤æ˜“ä¸­å¿ƒ",
      subtitle: "æŸ¥çœ‹ç³»ç»Ÿç”Ÿæˆçš„äº¤æ˜“æ–¹æ¡ˆï¼Œå¯¹æ¯”ç­¹ç ä»·å€¼ï¼Œä¸é€šè¿‡è‡ªç”±å¸‚åœºä¹Ÿèƒ½é‡ç»„çƒé˜Ÿã€‚",
      liveProposals: "å¯æ‰§è¡Œæ–¹æ¡ˆ",
      tradeableCapRoom: "å¯äº¤æ˜“è–ªèµ„ç©ºé—´",
      chemistry: "åŒ–å­¦ååº”",
      board: "æ™ºèƒ½äº¤æ˜“é¢æ¿",
      empty: "å½“å‰æ²¡æœ‰åˆé€‚çš„ä¸€æ¢ä¸€äº¤æ˜“æ–¹æ¡ˆã€‚ä½ å¯ä»¥å…ˆæ•´ç†è–ªèµ„ï¼Œæˆ–è¿›å…¥ä¸‹ä¸€ä¸ªé˜¶æ®µåŽå†å°è¯•ã€‚",
      send: "ä½ é€å‡º",
      receive: "ä½ å¾—åˆ°",
    },
    schedule: {
      title: "èµ›ç¨‹ä¸Žç»“æžœ",
      subtitle: "æŸ¥çœ‹æ¯ä¸€è½®èµ›ç¨‹ï¼Œå…³æ³¨å³å°†åˆ°æ¥çš„æ¯”èµ›ï¼Œå¹¶å¤ç›˜å·²ç»æ¨¡æ‹Ÿå®Œæˆçš„èµ›æžœã€‚",
      final: "å·²ç»“æŸ",
      upcoming: "å³å°†å¼€å§‹",
    },
    standings: {
      title: "è”èµ›æŽ’å",
      subtitle: "å…ˆçœ‹èƒœåœºï¼Œå†çœ‹å‡€èƒœåˆ†ï¼Œæœ€åŽçœ‹æ€»å¾—åˆ†ã€‚",
      scoringLeader: "å¾—åˆ†çŽ‹",
      assistLeader: "åŠ©æ”»çŽ‹",
      reboundLeader: "ç¯®æ¿çŽ‹",
      mvpLadder: "MVP æŽ’è¡Œ",
      categoryLeaders: "æ•°æ®é¢†è¢–",
      table: "æŽ’åè¡¨",
    },
    stats: {
      title: "èµ›å­£æ•°æ®",
      subtitle: "è¿½è¸ªè”èµ›ä¸­è¡¨çŽ°æœ€å¼ºçš„çƒå‘˜ï¼Œå¹¶æ¯”è¾ƒè°æ­£åœ¨é¢†è·‘ MVP ç«žäº‰ã€‚",
      seasonAwards: "èµ›å­£å¥–é¡¹",
      contractWatch: "åˆåŒè§‚å¯Ÿ",
      franchiseTimeline: "çƒé˜Ÿå¹´è¡¨",
    },
    player: {
      profile: "çƒå‘˜èµ„æ–™",
      ratings: "èƒ½åŠ›åˆ†å¸ƒ",
      notes: "çƒå‘˜å¡è¯´æ˜Ž",
      training: "è®­ç»ƒä¸­å¿ƒ",
      games: "å‡ºåœº",
      contract: "åˆåŒ",
      position: "ä½ç½®",
      age: "å¹´é¾„",
      overall: "æ€»è¯„",
      salary: "è–ªèµ„",
      morale: "å£«æ°”",
      team: "çƒé˜Ÿ",
      potential: "æ½œåŠ›",
      archetype: "å®šä½",
    },
    common: {
      round: "ç¬¬",
      at: "å¯¹é˜µ",
      level: "ç­‰çº§",
      training: "è®­ç»ƒ",
      medical: "åŒ»ç–—",
      scouting: "çƒæŽ¢",
      scoring: "å¾—åˆ†",
      playmaking: "ç»„ç»‡",
      rebounding: "ç¯®æ¿",
      defense: "é˜²å®ˆ",
      stamina: "ä½“èƒ½",
      potential: "æ½œåŠ›",
      overall: "æ€»è¯„",
      salary: "è–ªèµ„",
      fit: "é€‚é…",
      age: "å¹´é¾„",
      yearsDeal: "å¹´åˆåŒ",
      player: "çƒå‘˜",
      position: "ä½ç½®",
      contractRemaining: "å‰©ä½™å¹´é™",
      legend: "ä¼ å¥‡",
      elite: "ç²¾è‹±",
      starter: "é¦–å‘",
      rotation: "è½®æ¢",
      creator: "ç»„ç»‡è€…",
      anchor: "æ”¯æŸ±",
      twoWay: "æ”»é˜²ä¸€ä½“",
      slasher: "çªç ´æ‰‹",
      bucket: "å¾—åˆ†æ‰‹",
      floorGeneral: "çƒåœºæŒ‡æŒ¥å®˜",
      stopper: "é˜²å®ˆå¤§é—¸",
      glassCleaner: "ç¯®æ¿æ€ª",
      shotCreator: "è‡ªä¸»å¾—åˆ†æ‰‹",
      pureScorer: "çº¯å¾—åˆ†æ‰‹",
      rimProtector: "æŠ¤æ¡†è€…",
      playmakingBig: "ç­–åº”å†…çº¿",
      bronze: "é’é“œ",
      silver: "ç™½é“¶",
      gold: "é»„é‡‘",
      platinum: "ä¼ å¥‡",
      recordCaption: "æ¯æ¨¡æ‹Ÿä¸€è½®åŽéƒ½ä¼šæ›´æ–°è”èµ›æŽ’åã€‚",
      strengthCaption: "æ ¹æ®å½“å‰é˜µå®¹ã€ä½“èƒ½å’Œå£«æ°”ç»¼åˆè®¡ç®—ã€‚",
      chemistryFallback: "å°½é‡æ­é…æ›´å¹³è¡¡çš„é¦–å‘äº”äººã€‚",
      payrollLine: "å·¥èµ„å¸½",
      payroll: "æ€»è–ªèµ„",
      rosterPayrollCaption: "å½“å‰é˜µå®¹å…¨éƒ¨çƒå‘˜çš„è–ªèµ„æ€»é¢ã€‚",
      rosterAverageCaption: "å¿«é€Ÿåˆ¤æ–­çƒé˜Ÿæ•´ä½“æˆ˜åŠ›ã€‚",
      rosterTopPlayerCaption: "å½“å‰æ€»è¯„æœ€é«˜çš„æ ¸å¿ƒçƒå‘˜ã€‚",
      rosterBudgetCaption: "é¢„ç®—ä¸Šé™",
      rosterChemistryCaption: "è§’è‰²è¶Šå¹³è¡¡ï¼Œçƒé˜Ÿæˆ˜åŠ›è¶Šç¨³å®šã€‚",
      marketCreditsCaption: "ç”¨èµ„é‡‘ç­¾ä¸‹è‡ªç”±çƒå‘˜å¹¶è®­ç»ƒä½ çš„é˜µå®¹ã€‚",
      marketSlotsCaption: "è¿™ä¸ª MVP ç‰ˆæœ¬æœ€å¤šå¯æ‹¥æœ‰ 12 åçƒå‘˜ã€‚",
      marketScoutingCaption: "æ›´é«˜çš„çƒæŽ¢ç­‰çº§æ›´å®¹æ˜“è¡¥å¼ºé˜µå®¹æ·±åº¦ã€‚",
      marketReserveCaption: "è¿˜æœ‰ä¸€äº›å¡åŒ…çƒå‘˜å°šæœªä»Žå‚¨å¤‡æ± ä¸­å¼€å‡ºã€‚",
      marketCapCaption: "å¦‚æžœç­¾çº¦åŽæ€»è–ªèµ„è¶…è¿‡",
      standardPackName: "é˜µå®¹è¡¥å¼ºåŒ…",
      standardPackDesc: "æ›´ä¾¿å®œçš„è¡¥å¼ºæ–¹å¼ï¼Œé€‚åˆå¢žåŠ æ·±åº¦å’Œè½®æ¢ã€‚",
      elitePackName: "é«˜çº§ç²¾é€‰åŒ…",
      elitePackDesc: "æ›´é«˜æ¦‚çŽ‡èŽ·å¾—å¼ºåŠ›çƒå‘˜ï¼Œèƒ½ç«‹åˆ»æå‡çƒé˜Ÿä¸Šé™ã€‚",
      eliteDrop: "é«˜çº§å¼€åŒ…",
      standardDrop: "æ™®é€šå¼€åŒ…",
      openedOn: "å¼€å¯äºŽ",
      ovrShort: "æ€»è¯„",
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
    "No lineup configured.": "å°šæœªè®¾ç½®é˜µå®¹ã€‚",
    "Natural starter positions are filled.": "é¦–å‘ä½ç½®é…ç½®åˆç†ï¼Œæ²¡æœ‰é”™ä½é—®é¢˜ã€‚",
    "Starter role overlap hurts spacing and balance.": "é¦–å‘è§’è‰²é‡å ï¼Œå½±å“ç©ºé—´å’Œé˜µå®¹å¹³è¡¡ã€‚",
    "Multiple creators keep the offense flowing.": "å¤šåç»„ç»‡ç‚¹è®©è¿›æ”»è¿è½¬æ›´åŠ æµç•…ã€‚",
    "Only one reliable creator in the first unit.": "é¦–å‘é˜µå®¹é‡Œåªæœ‰ä¸€åç¨³å®šç»„ç»‡ç‚¹ã€‚",
    "Interior anchor stabilizes defense and rebounding.": "å†…çº¿æ”¯æŸ±ç¨³ä½äº†é˜²å®ˆå’Œç¯®æ¿ã€‚",
    "No true interior anchor in the lineup.": "å½“å‰é˜µå®¹ç¼ºå°‘çœŸæ­£çš„å†…çº¿æ”¯æŸ±ã€‚",
    "Two-way wings improve matchup flexibility.": "æ”»é˜²ä¸€ä½“çš„é”‹çº¿æå‡äº†å¯¹ä½å¼¹æ€§ã€‚",
    "Slashing and spacing complement each other well.": "çªç ´ä¸Žæ‹‰å¼€ç©ºé—´å½¢æˆäº†å¾ˆå¥½çš„äº’è¡¥ã€‚",
    "The starters bring a healthy mix of roles.": "é¦–å‘è§’è‰²åˆ†å·¥æ¸…æ™°ï¼Œæ•´ä½“æ­é…å¥åº·ã€‚",
    "Too many starters share the same role profile.": "é¦–å‘è§’è‰²åŒè´¨åŒ–è¿‡é«˜ï¼ŒåŠŸèƒ½é‡å æ˜Žæ˜¾ã€‚",
  };

  return map[note] ?? note;
}

export function translateMatchSummary(summary: string | null, locale: Locale) {
  if (!summary || locale === "en") {
    return summary;
  }

  let result = summary;
  result = result.replace(/^([A-Z]{2,4}) controlled the fourth quarter and defended home court\.$/, "$1 åœ¨ç¬¬å››èŠ‚æŽŒæŽ§æ¯”èµ›ï¼ŒæˆåŠŸå®ˆä½ä¸»åœºã€‚");
  result = result.replace(/^([A-Z]{2,4}) stole a road win with a stronger late-game push\.$/, "$1 åœ¨æ¯”èµ›æœ«æ®µå®Œæˆåæ‰‘ï¼Œå®¢åœºå¸¦èµ°èƒœåˆ©ã€‚");
  return result;
}

export function translateServerMessage(message: string, locale: Locale) {
  if (locale === "en") {
    return message;
  }

  let result = message;
  const replacements: Array<[RegExp | string, string]> = [
    ["League reset with a fresh pro hoops season.", "è”èµ›å·²é‡ç½®ï¼Œæ–°çš„èŒä¸šç¯®çƒèµ›å­£å·²å‡†å¤‡å°±ç»ªã€‚"],
    ["Lineup saved.", "é˜µå®¹å·²ä¿å­˜ã€‚"],
    ["The season is already complete.", "æœ¬èµ›å­£å·²ç»ç»“æŸã€‚"],
    ["Finish the current season before rolling over.", "è¯·å…ˆå®Œæˆå½“å‰èµ›å­£ï¼Œå†è¿›å…¥ä¸‹ä¸€èµ›å­£ã€‚"],
    ["Unknown staff department.", "æœªçŸ¥çš„å‘˜å·¥éƒ¨é—¨ã€‚"],
    ["Unknown pack type.", "æœªçŸ¥çš„å¡åŒ…ç±»åž‹ã€‚"],
    ["Unknown training focus.", "æœªçŸ¥çš„è®­ç»ƒæ–¹å‘ã€‚"],
    ["Unknown language.", "æœªçŸ¥çš„è¯­è¨€é€‰é¡¹ã€‚"],
    ["That player is not on your roster.", "è¿™åçƒå‘˜ä¸åœ¨ä½ çš„é˜µå®¹ä¸­ã€‚"],
    ["This player is already on a long-term deal.", "è¿™åçƒå‘˜å·²ç»ç­¾ä¸‹é•¿æœŸåˆåŒã€‚"],
    ["Trade target is no longer available.", "äº¤æ˜“ç›®æ ‡å·²ç»æ— æ³•èŽ·å–ã€‚"],
    ["The other team rejected the value of this offer.", "å¯¹æ–¹çƒé˜Ÿè®¤ä¸ºè¿™ç¬”äº¤æ˜“ä»·å€¼ä¸åˆé€‚ã€‚"],
    ["That trade would push you over the salary limit.", "è¿™ç¬”äº¤æ˜“ä¼šè®©ä½ çš„è–ªèµ„è¶…é™ã€‚"],
    ["The other team cannot absorb this contract.", "å¯¹æ–¹çƒé˜Ÿæ— æ³•æŽ¥æ”¶è¿™ä»½åˆåŒã€‚"],
    ["That player is no longer on the market.", "è¿™åçƒå‘˜å·²ç»ä¸åœ¨å¸‚åœºä¸Šã€‚"],
    ["Your roster is full. Sell a player before signing another.", "ä½ çš„é˜µå®¹å·²æ»¡ï¼Œè¯·å…ˆå‡ºå”®çƒå‘˜å†ç­¾æ–°çƒå‘˜ã€‚"],
    ["Your roster is full. Sell a player before opening a pack.", "ä½ çš„é˜µå®¹å·²æ»¡ï¼Œè¯·å…ˆå‡ºå”®çƒå‘˜å†å¼€å¡åŒ…ã€‚"],
    ["Keep at least 8 players so your lineup remains valid.", "è¯·è‡³å°‘ä¿ç•™ 8 åçƒå‘˜ï¼Œç¡®ä¿é˜µå®¹ä¾ç„¶æœ‰æ•ˆã€‚"],
    ["No more player packs are available in this build.", "å½“å‰ç‰ˆæœ¬å·²ç»æ²¡æœ‰æ›´å¤šå¯å¼€å¯çš„çƒå‘˜å¡åŒ…ã€‚"],
    ["Every selected player must belong to your roster.", "æ‰€é€‰çƒå‘˜å¿…é¡»å…¨éƒ¨æ¥è‡ªä½ çš„é˜µå®¹ã€‚"],
    ["Each lineup slot must use a different player.", "æ¯ä¸ªé˜µå®¹ä½ç½®éƒ½å¿…é¡»ä½¿ç”¨ä¸åŒçš„çƒå‘˜ã€‚"],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern as never, replacement);
  }

  result = result.replace(/^Round (\d+) simulated\.$/, "ç¬¬$1è½®æ¨¡æ‹Ÿå®Œæˆã€‚");
  result = result.replace(/^(.+) is underway\.$/, "$1 å·²ç»å¼€å§‹ã€‚");
  result = result.replace(/^(training|medical|scouting) staff upgraded to level (\d+)\.$/, "$1 部门已升级到 $2 级。");
  result = result.replace(/^Not enough credits\. (training|medical|scouting) upgrade costs (\d+)\.$/, "èµ„é‡‘ä¸è¶³ã€‚$1 éƒ¨é—¨å‡çº§éœ€è¦ $2 ç‚¹èµ„é‡‘ã€‚");
  result = result.replace(/^Not enough credits\. Training costs (\d+)\.$/, "èµ„é‡‘ä¸è¶³ã€‚è®­ç»ƒéœ€è¦ $1 ç‚¹èµ„é‡‘ã€‚");
  result = result.replace(/^Not enough credits\. Extension costs (\d+)\.$/, "èµ„é‡‘ä¸è¶³ã€‚ç»­çº¦éœ€è¦ $1 ç‚¹èµ„é‡‘ã€‚");
  result = result.replace(/^Not enough credits\. Signing costs (\d+)\.$/, "èµ„é‡‘ä¸è¶³ã€‚ç­¾çº¦éœ€è¦ $1 ç‚¹èµ„é‡‘ã€‚");
  result = result.replace(/^Not enough credits\. (standard|elite) pack costs (\d+)\.$/, "èµ„é‡‘ä¸è¶³ã€‚$1 å¡åŒ…éœ€è¦ $2 ç‚¹èµ„é‡‘ã€‚");
  result = result.replace(/^Not enough cap room\. You need (\d+) more payroll room\.$/, "è–ªèµ„ç©ºé—´ä¸è¶³ã€‚ä½ è¿˜éœ€è¦é¢å¤–é‡Šæ”¾ $1 çš„è–ªèµ„ç©ºé—´ã€‚");
  result = result.replace(/^(.+) improved (scoring|playmaking|rebounding|defense|stamina)\.$/, "$1 çš„ $2 èƒ½åŠ›èŽ·å¾—æå‡ã€‚");
  result = result.replace(/^(.+) signed a one-year extension\.$/, "$1 å®Œæˆäº†ä¸€å¹´ç»­çº¦ã€‚");
  result = result.replace(/^([A-Z]{2,4}) accepted\. (.+) joined your club\.$/, "$1 æŽ¥å—äº†æŠ¥ä»·ã€‚$2 åŠ å…¥äº†ä½ çš„çƒé˜Ÿã€‚");
  result = result.replace(/^(.+) joined your club\.$/, "$1 åŠ å…¥äº†ä½ çš„çƒé˜Ÿã€‚");
  result = result.replace(/^(.+) was sold for (\d+) credits\.$/, "$1 å·²å‡ºå”®ï¼ŒèŽ·å¾— $2 ç‚¹èµ„é‡‘ã€‚");
  result = result.replace(/^(.+) joined your roster from a (standard|elite) pack\.$/, "$1 å·²ä»Ž $2 å¡åŒ…åŠ å…¥ä½ çš„é˜µå®¹ã€‚");
  result = result.replace(/^Your (PG|SG|SF|PF|C) starter must play (PG|SG|SF|PF|C)\.$/, "ä½ çš„ $1 é¦–å‘å¿…é¡»ç”± $2 ä½ç½®çš„çƒå‘˜æ‹…ä»»ã€‚");
  result = result.replace(/\btraining\b/g, "è®­ç»ƒ");
  result = result.replace(/\bmedical\b/g, "åŒ»ç–—");
  result = result.replace(/\bscouting\b/g, "çƒæŽ¢");
  result = result.replace(/\bscoring\b/g, "å¾—åˆ†");
  result = result.replace(/\bplaymaking\b/g, "ç»„ç»‡");
  result = result.replace(/\brebounding\b/g, "ç¯®æ¿");
  result = result.replace(/\bdefense\b/g, "é˜²å®ˆ");
  result = result.replace(/\bstamina\b/g, "ä½“èƒ½");
  result = result.replace(/\bstandard\b/g, "æ™®é€š");
  result = result.replace(/\belite\b/g, "é«˜çº§");
  return result;
}

