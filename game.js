(() => {
  'use strict';

  // ── Data, state & deterministic random ────────────────────────────────
  let SIZE = 10;
  const DIRECTIONS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  const TIDES = {
    calm: {interval:18000,multiplier:1},
    steady: {interval:12000,multiplier:1.5},
    rough: {interval:8000,multiplier:2}
  };
  // ── Content data: island → sub-theme → word bank and rotating riddles ──
  // Every puzzle draws from one focused habitat; higher levels may blend two.
  const makeSub = (name,difficulty,words,riddles) => ({name,difficulty,words:words.trim().split(/\s+/),riddles});
  const THEMES = {
    rainforest: { name:'Rainforest', icon:'🌿', minLevel:1, subThemes:{
      canopyBirds:makeSub('Canopy birds',1,`TOUCAN MACAW PARROT HORNBILL TANAGER QUETZAL ORIOLE FALCON KITE IBIS HERON EGRET JACANA SWIFT MARTIN FINCH JAYBIRD OSPREY COCKATOO TINAMOU MOTMOT MANAKIN CURASSOW TROGON`,[
        ['QUETZAL','My bright feathers were treasured by ancient forest kings.'],['TOUCAN','My rainbow beak is larger than my bite.'],['MACAW','My colorful wings and loud calls fill the canopy.']]),
      fungiAndDecay:makeSub('Fungi & decay',2,`FUNGUS SPORES MYCELIUM MUSHROOM TRUFFLE MOREL YEAST MOLDY ROTTING HUMUS MULCH COMPOST LICHEN DECAY SHELF ENZYME GILLS BRACKET DECOMPOSE ROOTLET LOAM MILDEW SAPROBE BACTERIA FERNBED`,[
        ['MOREL','My honeycomb cap is a prized woodland delicacy.'],['SPORES','Wind carries us like invisible mushroom seeds.'],['LICHEN','I am a partnership clinging to bark and stone.']]),
      forestMammals:makeSub('Forest mammals',1,`JAGUAR OCELOT TAPIR SLOTH HOWLER TAMARIN GIBBON LEMUR OKAPI COATI AGOUTI PECCARY CAPYBARA ANTEATER PANGOLIN ARMADILLO PUMA OTTER CIVET POSSUM RODENT MARGAY MONKEY KINKAJOU`,[
        ['OKAPI','I wear zebra stripes but live among forest giraffe kin.'],['TAPIR','My short trunk helps me browse lush forest leaves.'],['SLOTH','I spend slow afternoons hanging upside down.']]),
      tropicalPlants:makeSub('Tropical plants',2,`ORCHID BROMELIAD BAMBOO KAPOK CEIBA LIANA VINES PALM FERN HELICONIA GINGER BEGONIA ANTHURIUM AROID CYCAD MOSS LEAVES SEEDLING SAPLING ROOTS PETIOLE FRONDS NECTAR LOTUS CATTLEYA`,[
        ['KAPOK','Fluffy fibers fill my pods high above the forest.'],['ORCHID','My ornate bloom often grows above the forest floor.'],['BAMBOO','My hollow stems can shoot upward very quickly.']]),
      riversAndRain:makeSub('River & rain',2,`MONSOON RAINFALL DELUGE STREAM RIVER CASCADE RAPIDS CREEK BROOK LAGOON MARSH PUDDLE CANAL DOWNPOUR DRIZZLE FOGBANK MISTY CLOUDY HUMID ESTUARY WATERFALL FLOODPLAIN CURRENT SPRING`,[
        ['DELUGE','I am rain that pours down in overwhelming sheets.'],['CASCADE','I tumble down rocks in a watery staircase.'],['LAGOON','A quiet shallow pool separated from the open sea.']])
    }},
    space: { name:'Space', icon:'✦', minLevel:4, subThemes:{
      starScience:makeSub('Star science',2,`NEBULA QUASAR PULSAR PHOTON FUSION PLASMA FLARE CORONA NOVA SUPERNOVA REDGIANT DWARF HELIUM HYDROGEN SUNSPOTS SPECTRUM LUMINOSITY RADIANT STELLAR GRAVITY SINGULAR BINARY BRIGHTEN STARLIGHT`,[
        ['QUASAR','A dazzling core of a galaxy powered by a hungry black hole.'],['PULSAR','I flash with the rhythm of a spinning neutron star.'],['NEBULA','A glowing cloud where new stars may be born.']]),
      spacecraft:makeSub('Spacecraft',1,`ROCKET SHUTTLE LANDER ROVER PROBE CAPSULE THRUSTER ENGINE MODULE PAYLOAD HATCH AIRLOCK ANTENNA SOLARPANEL BOOSTER ORBITER STATION DOCKING LAUNCH REENTRY TRAJECTORY FLIGHT SUIT VISOR`,[
        ['ROVER','I explore distant worlds on wheels.'],['SHUTTLE','I flew into orbit and glided home with wings.'],['CAPSULE','A tiny crew cabin that returns from orbit.']]),
      nightSky:makeSub('Night sky',1,`METEOR COMET AURORA ECLIPSE MOONLIGHT TWILIGHT ZENITH HORIZON AQUARIUS ASTERISM NORTHSTAR SKYLINE STARFALL NIGHTFALL SUNDOWN DUSK DAWN GALAXY COSMOS DARKNESS SHADOW GLOWING CRATER ORION`,[
        ['AURORA','Curtains of dancing light paint polar skies.'],['METEOR','A streak of fire as space dust meets the air.'],['ECLIPSE','One celestial body passes into another’s shadow.']]),
      solarSystem:makeSub('Solar system',2,`MERCURY VENUS EARTH MARS JUPITER SATURN URANUS NEPTUNE PLUTO CERES TITAN EUROPA ORBITS GANYMEDE CALLISTO PHOBOS DEIMOS TRITON CHARON ORBIT AXIS SOLAR LUNAR PLANET`,[
        ['TITAN','I am Saturn’s largest moon, wrapped in hazy air.'],['CERES','I am the largest dwarf planet in the asteroid belt.'],['NEPTUNE','A distant blue giant swept by fierce winds.']]),
      deepSpace:makeSub('Deep space',3,`ANDROMEDA MAGELLAN CLUSTER VACUUM DARKMATTER REDSHIFT BLUESHIFT COSMIC INFINITY PARSEC LIGHTYEAR WORMHOLE BLACKHOLE EVENT HALO GALACTIC UNIVERSE EXPANSE FILAMENT DUSTLANE STARBURST VOID NEUTRINO ENTROPY`,[
        ['PARSEC','Astronomers use me to measure immense distances.'],['REDSHIFT','Light stretches toward crimson as galaxies recede.'],['WORMHOLE','A hypothetical tunnel through space and time.']])
    }},
    kitchen: { name:'Kitchen', icon:'✳', minLevel:8, subThemes:{
      baking:makeSub('Baking day',1,`FLOUR DOUGH BATTER YEAST RISING KNEAD WHISK ROLLING FROSTING ICING MUFFIN BISCUIT COOKIE BROWNIE CUPCAKE SHORTBREAD SCONE PASTRY CRUST TARTLET BUNDT LOAF SOURDOUGH PROOFING`,[
        ['MUFFIN','A small domed cake in a paper cup.'],['KNEAD','Fold and stretch bread dough until elastic.'],['PASTRY','Flaky or tender dough used for sweet treats.']]),
      herbsSpices:makeSub('Herbs & spices',2,`SAFFRON CUMIN PAPRIKA PEPPER CINNAMON TURMERIC CARDAMOM CLOVES NUTMEG OREGANO BASIL THYME SAGE MINT PARSLEY DILL FENNEL ALLSPICE CORIANDER TARRAGON ROSEMARY CHERVIL SUMAC ANISE`,[
        ['SAFFRON','Rare golden threads tint rice a sunny yellow.'],['CUMIN','My earthy seeds flavor many curries.'],['TARRAGON','My leaves add a gentle licorice note to sauces.']]),
      cookware:makeSub('Cookware',1,`SKILLET SAUCEPAN STOCKPOT FRYPAN GRIDDLE DUTCHOVEN SPATULA LADLE TONGS COLANDER STRAINER PEELER GRATER CLEAVER WHETSTONE CUTLERY KETTLE TOASTER BLENDER MIXER SIEVE MANDOLINE TRIVET CHOPPER`,[
        ['COLANDER','My holes let water drain from cooked pasta.'],['LADLE','My deep bowl serves soup from a pot.'],['SKILLET','A shallow pan for frying breakfast.']]),
      vegetables:makeSub('Garden kitchen',2,`CARROT PARSNIP POTATO TOMATO TURNIP CELERY RADISH CABBAGE LETTUCE SPINACH BROCCOLI ZUCCHINI EGGPLANT PUMPKIN SQUASH OKRA ONION SHALLOT GARLIC LEEK BEETROOT KALE CHARD ASPARAGUS`,[
        ['PARSNIP','A pale sweet root that resembles a carrot.'],['ZUCCHINI','A summer squash with shiny green skin.'],['SHALLOT','A small mild member of the onion family.']]),
      tableAndTaste:makeSub('Table & taste',3,`UMAMI SAVORY BITTER SOUR SWEET TANGY CRUNCHY CREAMY SALTY CRISPY AROMA TASTING PLATTER NAPKIN FORK KNIFE SPOON CHOPSTICK GOBLET TUMBLER SAUCER PITCHER COASTER BANQUET`,[
        ['UMAMI','The fifth savory taste found in broth and mushrooms.'],['PLATTER','A broad dish for serving a feast.'],['GOBLET','A stemmed drinking vessel fit for a banquet.']])
    }}
  };
  // Shared expeditions can blend into any island after level 5.
  const WILDCARDS = {
    oceanLife:makeSub('Wildcard · Ocean life',2,`DOLPHIN WHALE SHARK TURTLE OCTOPUS SQUID SEAHORSE CORAL ANEMONE KELP PLANKTON STARFISH URCHIN OYSTER PEARL CLAM LOBSTER SHRIMP SEAL WALRUS NARWHAL PUFFERFISH MANTA MARLIN`,[
      ['NARWHAL','I swim with a long spiral tusk.'],['OYSTER','My shell may hide a luminous pearl.'],['OCTOPUS','Eight arms help me open jars and escape.']]),
    wildWeather:makeSub('Wildcard · Weather',3,`THUNDER LIGHTNING CYCLONE TYPHOON TORNADO BLIZZARD HAILSTONE HURRICANE BREEZE GUSTY RAINBOW SUNSHINE DROUGHT HEATWAVE FROST SNOWFALL SLEET TEMPEST ICEBERG FRONT WINDCHILL EQUINOX SOLSTICE BAROMETER`,[
      ['CYCLONE','A huge spinning storm over warm waters.'],['RAINBOW','I appear in a spectrum after rain.'],['SOLSTICE','One of the two days with the most extreme daylight.']]),
    ancientWorld:makeSub('Wildcard · Ancient world',3,`PYRAMID TEMPLE RUINS MOSAIC RELIC FOSSIL BRONZE OBELISK EMPIRE DYNASTY HIEROGLYPH CHARIOT PHARAOH SCROLL AMPHORA FORUM CITADEL COLOSSUS LEGEND MYTHICAL ARCHAIC KINGDOM ARTIFACT POTTERY`,[
      ['OBELISK','A tall stone monument ending in a pyramid point.'],['AMPHORA','An ancient two-handled storage jar.'],['MOSAIC','I am a picture made from tiny colored pieces.']])
  };
  const THEME_ORDER = Object.keys(THEMES);
  const ACHIEVEMENTS = [
    ['firstWord','First ripple','Find your first word','words',1],
    ['tenWords','Word collector','Find 10 words','words',10],
    ['century','Deep reader','Find 100 words','words',100],
    ['voyager','Island hopper','Finish 5 rounds','rounds',5],
    ['navigator','Ocean navigator','Finish 25 rounds','rounds',25],
    ['speedster','Lightning fingers','Find 3 words within 10 seconds','quickTriples',1],
    ['untouched','Pearl keeper','Win Rough tide without spending pearls','roughNoPearls',1],
    ['precise','Perfect current','Win with 100% accuracy','perfectWins',1],
    ['riddle','Riddle diver','Solve 3 mystery words','mysteries',3],
    ['diamonds','Deep pockets','Earn 12 pearls','pearlsEarned',12],
    ['ice','Icebreaker','Freeze the tide 5 times','freezes',5],
    ['backwards','Reverse explorer','Find 20 backward words','backwards',20],
    ['diagonal','Crosscurrent','Find 20 diagonal words','diagonals',20],
    ['daily3','Dawn patrol','Achieve a 3-day daily streak','streak',3],
    ['master','Island master','Earn Gold in all 5 sub-themes of one island','islandGold',1],
    ['goals','Goal getter','Finish 10 daily goals','goalsDone',10],
    ['closet','Fresh coat','Equip a new grid skin','skinsEquipped',1],
    ['modifiers','Storm chaser','Win 3 modified rounds','modifierWins',3],
    ['level10','Rising tide','Reach level 10','level',10]
  ].map(([id,title,description,stat,target])=>({id,title,description,stat,target}));
  const MODIFIERS = {
    fog:{name:'Fog bank',icon:'☁',description:'Some letters are veiled until selected.',xp:1.25},
    double:{name:'Double tide',icon:'≈',description:'Two separate lines drift with every wave.',xp:1.3},
    short:{name:'Short words only',icon:'✂',description:'Every listed word has six letters or fewer.',xp:1.2},
    reverse:{name:'Reversed only',icon:'↶',description:'All words read upward or leftward.',xp:1.35}
  };
  const SKINS = [
    {id:'seafoam',name:'Seafoam',cost:0,unlock:1,background:'Default mint and sea blue'},
    {id:'coral',name:'Coral reef',cost:25,unlock:2,background:'Warm coral and sunset'},
    {id:'deep',name:'Deep ocean',cost:40,unlock:5,background:'Midnight blue and sea glass'},
    {id:'sunrise',name:'Island sunrise',cost:65,unlock:9,background:'Golden sand and morning light'}
  ];

  const STORAGE_KEY = 'tidewords-profile-v3';
  const LEGACY_KEY = 'tidewords-progress-v1';
  const els = {};
  let state;
  let profile;
  let pendingTheme = null;
  let pendingSub = null;
  let toastTimer = null;
  let tickId = null;
  let audioContext = null;
  let soundEnabled = false;
  let manualReduceMotion = false;
  const systemReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedMotion = () => Boolean(systemReducedMotion || manualReduceMotion);
  const $ = id => document.getElementById(id);
  const indexOf = (r,c) => r * SIZE + c;
  const rowOf = idx => Math.floor(idx / SIZE);
  const colOf = idx => idx % SIZE;
  const timeString = ms => {
    const seconds = Math.floor(ms / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
  };
  const utcDay = () => new Date().toISOString().slice(0,10);
  const hashString = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i),16777619);
    return h >>> 0;
  };
  const createRandom = seed => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5)|0;
      let t = Math.imul(a ^ (a >>> 15),1|a);
      t ^= t + Math.imul(t ^ (t>>>7),61|t);
      return ((t ^ (t>>>14))>>>0)/4294967296;
    };
  };
  function shuffled(values,rng) {
    const a=values.slice();
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  // Cumulative XP needed to reach each level. ~150 XP for L2, ~1,544 XP for L6.
  const xpForLevel = level => Math.floor(150*Math.pow(Math.max(0,level-1),1.45));
  function levelFromXP(xp) { let level=1; while (level<100 && xp>=xpForLevel(level+1)) level++;return level; }
  function getDifficultyConfig(level) {
    const n=Math.max(1,Math.floor(level));
    return {
      size:Math.min(14,10+Math.floor((n-1)/4)),
      wordCount:Math.min(14,8+Math.floor((n-1)/3)),
      minLength:Math.min(6,4+Math.floor((n-1)/6)),
      maxLength:Math.min(10,8+Math.floor((n-1)/4)),
      driftFactor:Math.max(.58,1-(n-1)*.027),
      diagonalWeight:1+Math.min(3,(n-1)*.2),
      reverseWeight:1+Math.min(3,(n-1)*.22),
      blend:n>=6,
      selectionLevel:n,
      modifiers:n>=5
    };
  }
  const safeNumber = (v, fallback=0) => Number.isFinite(v)&&v>=0 ? v : fallback;
  // ── Persistence & migration ──────────────────────────────────────────
  function freshProfile() {
    return {version:3,xp:0,level:1,roundIndex:0,seenWords:{},seenMysteries:{},
      mastery:{},unlocked:['rainforest'],bestTimes:{},streak:0,lastDaily:'',totalWins:0,totalWords:0,
      pearls:0,shells:0,skin:'seafoam',ownedSkins:['seafoam'],achievements:[],
      stats:{},dailyGoals:{date:'',goals:[],values:{},claimed:[]},lastWinDaily:'',lastSeenDaily:'',
      sound:false};
  }
  function migrateProfile(raw,legacy) {
    const base=freshProfile();
    if (!raw || typeof raw!=='object') raw=legacy && typeof legacy==='object' ? legacy : {};
    // v1 saved only unlocked themes, daily streaks and records. Retain all of them.
    for (const key of ['bestTimes','mastery','seenWords','seenMysteries','stats'])
      if (raw[key] && typeof raw[key]==='object' && !Array.isArray(raw[key])) base[key]={...raw[key]};
    for (const key of ['streak','totalWins','totalWords','pearls','shells','roundIndex','xp']) base[key]=safeNumber(raw[key]);
    for (const key of ['lastDaily','lastWinDaily','lastSeenDaily']) if (typeof raw[key]==='string') base[key]=raw[key];
    for (const key of ['unlocked','ownedSkins','achievements']) if (Array.isArray(raw[key])) base[key]=[...new Set(raw[key])];
    if (typeof raw.skin==='string') base.skin=raw.skin;
    if (typeof raw.sound==='boolean') base.sound=raw.sound;
    if (raw.dailyGoals && typeof raw.dailyGoals==='object' && Array.isArray(raw.dailyGoals.goals) && raw.dailyGoals.values && typeof raw.dailyGoals.values==='object' && Array.isArray(raw.dailyGoals.claimed))base.dailyGoals=raw.dailyGoals;
    base.unlocked=[...new Set(['rainforest',...base.unlocked.filter(k=>THEMES[k])])];
    base.ownedSkins=[...new Set(['seafoam',...base.ownedSkins.filter(k=>SKINS.some(s=>s.id===k))])];
    if (!base.ownedSkins.includes(base.skin)) base.skin='seafoam';
    // XP is the authoritative level; preserve levels explicitly saved by v2 users.
    base.xp=Math.max(base.xp,xpForLevel(safeNumber(raw.level,1)));
    base.level=levelFromXP(base.xp);
    return base;
  }
  function loadProgress() {
    let saved=null,legacy=null;
    try {saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch(_error){/* Corrupt or unavailable v3 storage. */}
    try {legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');}catch(_error){/* Corrupt or unavailable v1 storage. */}
    profile=migrateProfile(saved,legacy);
  }
  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(profile)); }
    catch (_error) { /* Game is playable in restricted/private browsing. */ }
  }
  function stat(key,amount=1) {profile.stats[key]=safeNumber(profile.stats[key])+amount;}
  function statValue(key) {return key==='streak'?profile.streak:key==='level'?profile.level:safeNumber(profile.stats[key]);}
  function unlockCheck() {
    const unlocks=[];
    for (const [i,key] of THEME_ORDER.entries()) {
      if (canVisit(key) && !profile.unlocked.includes(key)) { profile.unlocked.push(key);unlocks.push(`${THEMES[key].name} island`); }
    }
    for (const item of ACHIEVEMENTS) {
      if (statValue(item.stat)>=item.target && !profile.achievements.includes(item.id)) {
        profile.achievements.push(item.id);unlocks.push(`🏅 ${item.title}`);
        showToast(`Achievement unlocked: ${item.title}`);
      }
    }
    return unlocks;
  }
  function canVisit(key) {
    const i=THEME_ORDER.indexOf(key);
    if (i===0) return true;
    const previous=THEME_ORDER[i-1];
    return profile.unlocked.includes(key) || profile.level>=THEMES[key].minLevel || completedCount(previous)>=2;
  }
  function completedCount(theme) {
    return Object.keys(THEMES[theme].subThemes).filter(key => (profile.mastery[`${theme}.${key}`]?.rank||0)>0).length;
  }
  function xpAdd(amount) {
    const old=profile.level;
    profile.xp+=Math.max(0,Math.round(amount));
    profile.level=levelFromXP(profile.xp);
    const unlocks=unlockCheck();
    if (profile.level>old) {
      const note=`Level ${profile.level}! ${unlocks.length?unlocks.join(', '):'New currents ahead'}`;
      showLevelUp(note);
      if (state) state.newUnlocks.push(`Level ${profile.level}`,...unlocks);
    } else if (state) state.newUnlocks.push(...unlocks);
    saveProgress();renderProfile();
    return amount;
  }
  function showLevelUp(note) {
    els.levelSplash.textContent=`✦ ${note}`;
    els.levelSplash.classList.remove('pop');void els.levelSplash.offsetWidth;
    els.levelSplash.classList.add('pop');
    els.announcer.textContent=note;
  }
  function weightedPick(pool,rng,history,roundIndex,chosen=new Set()) {
    const available=[...new Set(pool)].filter(w=>!chosen.has(w));
    if (!available.length) return null;
    // Recently encountered words nearly disappear from the roulette wheel.
    // Old/frequent words can still return once the limited pool is exhausted.
    const weights=available.map(w=> {
      const h=history[w]||{count:0,lastSeenRoundIndex:-9999};
      const age=roundIndex-safeNumber(h.lastSeenRoundIndex,-9999);
      const recent=age<=0?.002:age<3?.009:age<8?.06:age<16?.25:1;
      return recent/Math.pow(1+safeNumber(h.count),1.8);
    });
    let roll=rng()*weights.reduce((a,b)=>a+b,0);
    for (let i=0;i<available.length;i++) { roll-=weights[i];if(roll<=0) return available[i]; }
    return available[available.length-1];
  }
  function markSeen(history,words,index) {
    for (const word of new Set(words)) {
      const h=history[word]||{};
      history[word]={count:safeNumber(h.count)+1,lastSeenRoundIndex:index};
    }
    // Soft decay only once nearly all entries have appeared 3+ times.
    const entries=Object.values(history);
    if (entries.length>=320 && entries.filter(x=>x.count>=3).length/entries.length>.94) {
      for (const h of entries) h.count=Math.floor(h.count/2);
    }
  }
  function dailyGoalCatalog() {
    return [
      {id:'find12',label:'Find 12 words',metric:'words',target:12},
      {id:'find25',label:'Find 25 words',metric:'words',target:25},
      {id:'round2',label:'Complete 2 rounds',metric:'rounds',target:2},
      {id:'speed90',label:'Beat a round under 90 seconds',metric:'fastWins',target:1},
      {id:'mystery',label:'Solve a mystery',metric:'mysteries',target:1},
      {id:'diagonal',label:'Find 6 diagonal words',metric:'diagonals',target:6},
      {id:'three',label:'Earn 3 pearls',metric:'pearlsEarned',target:3},
      {id:'nohint',label:'Finish without hints',metric:'noHintWins',target:1},
      {id:'rough',label:'Complete a Rough tide run',metric:'roughWins',target:1}
    ];
  }
  function ensureDailyGoals() {
    const today=utcDay();
    if (profile.dailyGoals.date===today && Array.isArray(profile.dailyGoals.goals) && profile.dailyGoals.goals.length===3) return;
    const rng=createRandom(hashString('TIDEWORDS-GOALS-'+today));
    const pick=shuffled(dailyGoalCatalog(),rng).slice(0,3);
    profile.dailyGoals={date:today,goals:pick,values:{},claimed:[]};saveProgress();
  }
  function dailyProgress(metric,number=1) {
    ensureDailyGoals();
    const d=profile.dailyGoals;
    d.values[metric]=safeNumber(d.values[metric])+number;
    for (const goal of d.goals) {
      if (d.claimed.includes(goal.id) || safeNumber(d.values[goal.metric])<goal.target) continue;
      d.claimed.push(goal.id); profile.shells+=10; profile.pearls+=1;
      if (state) {state.pearls=profile.pearls;state.newUnlocks.push(`Goal: ${goal.label}`);}
      stat('goalsDone'); xpAdd(80);
      showToast(`Daily goal complete! +80 XP, +10 shells, +1 pearl`);
    }
    unlockCheck();saveProgress();renderProfile();
  }
  function rankForRound() {
    if (state.mode==='chill') return 1;
    const accuracy=state.found.size/(state.found.size+state.mistakes);
    const seconds=getElapsed()/1000;
    if (!state.hintsUsed && accuracy>=.95 && seconds<=Math.max(120,state.words.length*15)) return 3;
    if (!state.hintsUsed && accuracy>=.85 && seconds<=Math.max(240,state.words.length*25)) return 2;
    return 1;
  }
  const RANKS=['Unplayed','Bronze','Silver','Gold'];
  function awardWin() {
    profile.totalWins++; profile.totalWords+=state.found.size;stat('rounds');
    dailyProgress('rounds');
    const key=`${state.mode}:${state.theme}`;
    if (state.mode!=='chill') {
      const ms=getElapsed();
      if (!Number.isFinite(profile.bestTimes[key])||ms<profile.bestTimes[key]) profile.bestTimes[key]=ms;
      if (ms<90000) {stat('fastWins');dailyProgress('fastWins');}
      if (state.tide==='rough') {stat('roughWins');dailyProgress('roughWins');}
    }
    if (!state.hintsUsed) {stat('noHintWins');dailyProgress('noHintWins');}
    if (!state.mistakes) stat('perfectWins');
    if (state.mode!=='chill' && state.tide==='rough' && !state.pearlsSpent) stat('roughNoPearls');
    if (state.modifier) stat('modifierWins');
    if (state.mode==='daily') {
      const today=state.dailyDate;
      if (profile.lastDaily!==today) {
        const prior=new Date(`${today}T00:00:00Z`);prior.setUTCDate(prior.getUTCDate()-1);
        profile.streak=profile.lastDaily===prior.toISOString().slice(0,10)?profile.streak+1:1;
        profile.lastDaily=today;
      }
    }
    state.masteryChange=[];
    for (const key of state.subKeys) {
      if (WILDCARDS[key]) continue;
      const id=`${state.theme}.${key}`;
      const old=profile.mastery[id]||{rank:0,completions:0};
      const rank=Math.max(old.rank,rankForRound());
      profile.mastery[id]={rank,completions:old.completions+1};
      state.masteryChange.push(`${THEMES[state.theme].subThemes[key].name}: ${RANKS[old.rank]} → ${RANKS[rank]}`);
    }
    for (const theme of THEME_ORDER) {
      const keys=Object.keys(THEMES[theme].subThemes);
      if(keys.every(k=>profile.mastery[`${theme}.${k}`]?.rank===3) && !profile.stats[`golded-${theme}`]) {
        profile.stats[`golded-${theme}`]=1;stat('islandGold');
      }
    }
    profile.shells+=5+Math.floor(state.words.length/4);
    state.newUnlocks.push(...unlockCheck());
    saveProgress();renderProfile();
  }

  // ── Grid generation with randomized backtracking ───────────────────────
  function wordAt(board, cells) { return cells.map(i => board[i]).join(''); }
  function allPaths(word) {
    const paths = [];
    for (let row=0;row<SIZE;row++) for (let col=0;col<SIZE;col++) {
      for (const [dc,dr] of DIRECTIONS) {
        const endR = row + dr * (word.length - 1), endC = col + dc * (word.length - 1);
        if (endR < 0 || endR >= SIZE || endC < 0 || endC >= SIZE) continue;
        paths.push(Array.from({length: word.length}, (_,n) => indexOf(row + n*dr,col + n*dc)));
      }
    }
    return paths;
  }
  const PATH_CATALOG = new Map();
  function pathsFor(word) {
    const key=`${SIZE}:${word}`;
    if (!PATH_CATALOG.has(key)) PATH_CATALOG.set(key,allPaths(word));
    return PATH_CATALOG.get(key);
  }
  function compatible(path, word, board) {
    return path.every((cell,i) => board[cell] === null || board[cell] === word[i]);
  }
  function placeWords(words, fixed, rng, reference = null, rules = {}) {
    // Each branch tries a whole straight-line placement, including all eight
    // directions; conflicting letters cause the branch to backtrack. The fixed
    // board holds immutable letters from previously found words (and any intact
    // unfound paths). It is never overwritten by a search branch.
    const board = fixed.slice();
    const paths = {};
    const ordered = words.slice().sort((a,b) => b.length - a.length || a.localeCompare(b));
    function search(depth) {
      if (depth === ordered.length) return true;
      const word = ordered[depth];
      const options = [];
      for (const path of pathsFor(word)) {
        const dc=colOf(path[1])-colOf(path[0]),dr=rowOf(path[1])-rowOf(path[0]);
        const backward=dc<0 || (dc===0 && dr<0);
        if (rules.reverse && !backward) continue;
        if (!compatible(path,word,board)) continue;
        let overlaps=0, remembered=0;
        for (let i=0;i<path.length;i++) {
          if (board[path[i]] === word[i]) overlaps++;
          if (reference && reference[path[i]] === word[i]) remembered++;
        }
        // Randomized ordering with a slight bias towards clean crossings and
        // unchanged drifting letters. Try all candidates if needed.
        options.push({path,rank:overlaps*1.2+remembered*.12+rng()*5+ (dc!==0&&dr!==0?(rules.diagonalWeight||1):0)*.4 + (backward?(rules.reverseWeight||1):0)*.4});
      }
      options.sort((a,b) => b.rank - a.rank);
      for (const {path} of options.slice(0,Math.min(options.length,rules.tries||52))) {
        const added = [];
        for (let i=0;i<path.length;i++) if (board[path[i]] === null) {
          board[path[i]] = word[i]; added.push(path[i]);
        }
        paths[word] = path;
        if (search(depth+1)) return true;
        for (const i of added) board[i] = null;
        delete paths[word];
      }
      return false;
    }
    if (!search(0)) return null;
    return { board, paths };
  }
  function chooseSubThemes(theme,rng,config,forcedSub,modifier) {
    const own=Object.keys(THEMES[theme].subThemes);
    const getSub=k=>THEMES[theme].subThemes[k]||WILDCARDS[k];
    const tier=k=>getSub(k).difficulty;
    const eligible=own.filter(k=>tier(k)<=Math.max(1,Math.ceil((config.selectionLevel+2)/4)));
    let choices=eligible.length?eligible:own;
    const viable=keys=>{
      if(modifier!=='short')return true;
      const subs=keys.map(getSub);
      const pool=new Set(subs.flatMap(sub=>sub.words).filter(w=>w.length<=6));
      const riddles=subs.flatMap(sub=>sub.riddles.map(x=>x[0])).filter(w=>w.length<=6);
      return pool.size>=config.wordCount+1 && riddles.length>0;
    };
    // In short-word challenges prefer a single eligible habitat when possible.
    if(modifier==='short' && !config.blend && !forcedSub) {
      const valid=choices.filter(k=>viable([k]));
      if(valid.length)choices=valid;
    }
    const first=forcedSub || choices[Math.floor(rng()*choices.length)];
    const keys=[first];
    if(config.blend && !forcedSub || modifier==='short' && !viable(keys)) {
      const extra=[...own,...(config.selectionLevel>=7?Object.keys(WILDCARDS):[])].filter(k=>k!==first);
      const good=extra.filter(k=>viable([first,k]));
      const options=good.length?good:extra;
      if(options.length)keys.push(options[Math.floor(rng()*options.length)]);
    }
    return keys;
  }
  function choosePuzzleWords(theme,keys,count,modifier,rng,roundIndex,daily,config) {
    const subs=keys.map(key=>THEMES[theme].subThemes[key]||WILDCARDS[key]);
    const mysteries=subs.flatMap(sub=>sub.riddles.map(([answer,hint])=>({answer,hint})))
      .filter(item=>item.answer.length<=config.size && (modifier!=='short'||item.answer.length<=6));
    const bonusWord=weightedPick(mysteries.map(m=>m.answer),rng,daily?{}:profile.seenMysteries,roundIndex);
    const mystery=mysteries.find(m=>m.answer===bonusWord);
    if (!mystery) throw new Error('No eligible mysteries');
    const entries=[...new Set(subs.flatMap(sub=>sub.words))].filter(w=>w!==bonusWord);
    const filtered=entries.filter(w=>w.length<=config.maxLength && w.length>=config.minLength && (modifier!=='short'||w.length<=6));
    const pool=filtered.length>=count?filtered:entries.filter(w=>w.length<=Math.min(10,config.size) && (modifier!=='short'||w.length<=6));
    const chosen=new Set([bonusWord]),out=[];
    const history=daily?{}:profile.seenWords;
    while(out.length<count) {
      const long=pool.filter(w=>w.length>=config.minLength && !chosen.has(w));
      const weightedPool=out.length%3===0 && config.minLength>4 && long.length?long:pool;
      const word=weightedPick(weightedPool,rng,history,roundIndex,chosen);
      if(!word) break;
      chosen.add(word);out.push(word);
    }
    if(out.length!==count) throw new Error('Not enough eligible words');
    return {words:out,mystery};
  }
  function createPuzzle(theme,rng,config,forcedSub,modifier,daily,roundIndex) {
    const subKeys=chooseSubThemes(theme,rng,config,forcedSub,modifier);
    // Backtracking is randomized, so in a tight layout retry several draws.
    for (let attempt=0;attempt<7;attempt++) {
      let pick;try {pick=choosePuzzleWords(theme,subKeys,config.wordCount,modifier,rng,roundIndex,daily,config);} catch (_error) {continue;}
      const rules={reverse:modifier==='reverse',diagonalWeight:config.diagonalWeight,reverseWeight:config.reverseWeight,tries:attempt<3?52:110};
      const placed=placeWords([...pick.words,pick.mystery.answer],Array(config.size*config.size).fill(null),rng,null,rules);
      if (placed) return {
        words:pick.words,bonus:pick.mystery.answer,riddle:pick.mystery.hint,subKeys,
        board:placed.board.map(letter=>letter===null?'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(rng()*26)]:letter),paths:placed.paths
      };
    }
    // Guaranteed safe fallback: relax placement orientation, never drop words.
    for(let attempt=0;attempt<12;attempt++) {
      let pick;try {pick=choosePuzzleWords(theme,subKeys,config.wordCount,modifier,rng,roundIndex,daily,config);} catch (_error) {continue;}
      const placed=placeWords([...pick.words,pick.mystery.answer],Array(config.size*config.size).fill(null),rng,null,{reverse:modifier==='reverse',tries:260});
      if(placed) return {words:pick.words,bonus:pick.mystery.answer,riddle:pick.mystery.hint,subKeys,
        board:placed.board.map(letter=>letter===null?'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(rng()*26)]:letter),paths:placed.paths};
    }
    throw new Error('Unable to place all hidden words');
  }
  function findExistingPath(board,word) {
    for (const path of pathsFor(word)) {
      if(state?.modifier==='reverse') {
        const dc=colOf(path[1])-colOf(path[0]),dr=rowOf(path[1])-rowOf(path[0]);
        if(!(dc<0||(dc===0&&dr<0)))continue;
      }
      if(wordAt(board,path)===word)return path;
    }
    return null;
  }
  function reweaveAfterDrift(movedBoard) {
    const unresolved = [...state.words.filter(w => !state.found.has(w))];
    if (!state.bonusFound) unresolved.push(state.bonus);
    let fixed = Array(SIZE*SIZE).fill(null);
    for (const id of state.locked) fixed[id] = movedBoard[id];
    const preservedPaths = {};
    const needsPlacement = [];
    for (const word of unresolved) {
      const prior = state.paths[word];
      const path = prior && wordAt(movedBoard, prior) === word ? prior : findExistingPath(movedBoard,word);
      if (path) {
        preservedPaths[word] = path;
        path.forEach((cell,i) => { fixed[cell] = word[i]; });
      } else needsPlacement.push(word);
    }
    let result = placeWords(needsPlacement,fixed,state.rng,movedBoard,{reverse:state.modifier==='reverse',tries:110});
    if (!result) {
      // Soft-pinned paths can be discarded if they crowd a reflow. Only found
      // letters are truly immutable. This makes reweaving always achievable.
      fixed = Array(SIZE*SIZE).fill(null);
      for (const id of state.locked) fixed[id] = movedBoard[id];
      result = placeWords(unresolved,fixed,state.rng,movedBoard,{reverse:state.modifier==='reverse',tries:200});
      if (!result) return null;
      for (const key of Object.keys(preservedPaths)) delete preservedPaths[key];
    }
    return {
      board: result.board.map((letter,i) => letter === null ? movedBoard[i] : letter),
      paths: {...state.paths,...preservedPaths,...result.paths}
    };
  }

  // ── UI rendering ───────────────────────────────────────────────────────
  // ── Presentation: navigation, goals, badges, wardrobe ────────────────
  function nextUp() {
    for (const goal of profile.dailyGoals.goals||[]) {
      if (!profile.dailyGoals.claimed.includes(goal.id)) {
        const current=safeNumber(profile.dailyGoals.values[goal.metric]);
        if(goal.target-current<=6) return `${Math.max(0,goal.target-current)} more: ${goal.label}`;
      }
    }
    const next=THEME_ORDER.find(k=>!canVisit(k));
    if (next) return `${Math.max(0,THEMES[next].minLevel-profile.level)} levels to ${THEMES[next].name} island`;
    return `${xpForLevel(profile.level+1)-profile.xp} XP to level ${profile.level+1}`;
  }
  function renderProfile() {
    if(!els.xpFill)return;
    const low=xpForLevel(profile.level),high=xpForLevel(profile.level+1);
    els.levelLabel.textContent=`Level ${profile.level}`;
    els.xpLabel.textContent=`${profile.xp-low} / ${high-low} XP`;
    els.xpFill.style.width=`${Math.max(0,Math.min(100,(profile.xp-low)/(high-low)*100))}%`;
    els.nextGoal.textContent=nextUp();
    els.shellLabel.textContent=String(profile.shells);
    els.totalPearls.textContent=String(profile.pearls);
    els.goalList.replaceChildren();
    for (const goal of profile.dailyGoals.goals||[]) {
      const value=Math.min(goal.target,safeNumber(profile.dailyGoals.values[goal.metric]));
      const el=document.createElement('div');el.className='daily-goal';
      const top=document.createElement('div');top.className='goal-row';
      const label=document.createElement('span');label.textContent=goal.label;
      const counter=document.createElement('b');counter.textContent=`${value}/${goal.target}${profile.dailyGoals.claimed.includes(goal.id)?' ✓':''}`;
      top.append(label,counter);
      const track=document.createElement('div');track.className='mini-track';track.setAttribute('role','progressbar');track.setAttribute('aria-label',goal.label);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(goal.target));track.setAttribute('aria-valuenow',String(value));
      const fill=document.createElement('div');fill.style.width=`${value/goal.target*100}%`;track.append(fill);el.append(top,track);els.goalList.append(el);
    }
    document.body.dataset.skin=profile.skin;
  }
  function renderThemeOptions() {
    const selected=state?state.theme:'rainforest';
    els.themeSelect.replaceChildren();
    for(const key of THEME_ORDER) {
      const option=document.createElement('option');option.value=key;
      const locked=!canVisit(key) && state?.mode!=='daily';
      option.disabled=locked;
      option.textContent=`${THEMES[key].icon} ${THEMES[key].name}${locked?' · locked':''}`;
      els.themeSelect.append(option);
    }
    els.themeSelect.value=selected;
    els.themeSelect.disabled=state?.mode==='daily';
  }
  function openProgress(which='islands') {
    els.progressModal.hidden=false;
    renderProgress(which);
    els.closeProgressBtn.focus();
  }
  function closeProgress() {els.progressModal.hidden=true;els.mapBtn.focus();}
  function renderProgress(which) {
    els.progressTitle.textContent={islands:'Explore the islands',achievements:'Achievements',closet:'The shell shop'}[which];
    for (const btn of document.querySelectorAll('[data-progress-tab]')) btn.setAttribute('aria-pressed',String(btn.dataset.progressTab===which));
    els.progressBody.replaceChildren();
    if(which==='islands')renderIslands();
    else if(which==='achievements')renderAchievements();
    else renderCloset();
  }
  function note(parent,text,cls='') {const p=document.createElement('p');p.className=cls;p.textContent=text;parent.append(p);return p;}
  function renderIslands() {
    for(const key of THEME_ORDER) {
      const theme=THEMES[key],allowed=canVisit(key);
      const complete=completedCount(key),total=Object.keys(theme.subThemes).length;
      const card=document.createElement('section');card.className='island-card';
      const h=document.createElement('h3');h.textContent=`${theme.icon} ${theme.name} · ${Math.round(complete/total*100)}% complete`;card.append(h);
      const bar=document.createElement('div');bar.className='mini-track';const fill=document.createElement('div');fill.style.width=`${complete/total*100}%`;bar.append(fill);card.append(bar);
      if(!allowed) {note(card,`🔒 Unlock at level ${theme.minLevel} OR finish 2 sub-themes on ${THEMES[THEME_ORDER[THEME_ORDER.indexOf(key)-1]].name}.`);els.progressBody.append(card);continue;}
      const list=document.createElement('div');list.className='subtheme-list';
      for(const [subKey,sub] of Object.entries(theme.subThemes)) {
        const record=profile.mastery[`${key}.${subKey}`]||{rank:0,completions:0};
        const btn=document.createElement('button');btn.type='button';btn.className='subtheme-button';
        btn.innerHTML=`<strong></strong><small></small>`;
        btn.querySelector('strong').textContent=`${sub.name} · Tier ${sub.difficulty}`;
        btn.querySelector('small').textContent=`${['◌','🥉','🥈','🥇'][record.rank]} ${RANKS[record.rank]} · ${record.completions} clears`;
        btn.addEventListener('click',()=>{pendingTheme=key;pendingSub=subKey;els.modeSelect.value='classic';els.themeSelect.value=key;closeProgress();startRound();});
        list.append(btn);
      }
      card.append(list);els.progressBody.append(card);
    }
    note(els.progressBody,'Wildcard expeditions (Ocean life, Weather and Ancient world) can appear in blended rounds from level 7.','small-hint');
  }
  function renderAchievements() {
    note(els.progressBody,`${profile.achievements.length} / ${ACHIEVEMENTS.length} badges unlocked.`);
    for(const a of ACHIEVEMENTS) {
      const value=Math.min(a.target,statValue(a.stat));
      const row=document.createElement('div');row.className=`achievement-row ${profile.achievements.includes(a.id)?'achieved':''}`;
      const h=document.createElement('strong');h.textContent=`${profile.achievements.includes(a.id)?'🏅':'🔒'} ${a.title}`;
      const d=document.createElement('small');d.textContent=`${a.description} · ${value}/${a.target}`;
      const bar=document.createElement('div');bar.className='mini-track';const f=document.createElement('div');f.style.width=`${value/a.target*100}%`;bar.append(f);row.append(h,d,bar);els.progressBody.append(row);
    }
  }
  function renderCloset() {
    note(els.progressBody,`Your purse: ${profile.shells} shells. Earn shells from cleared rounds and daily goals. Choose a free owned skin or purchase another.`);
    const cards=document.createElement('div');cards.className='closet-list';
    for(const skin of SKINS) {
      const item=document.createElement('div');item.className='skin-card';
      const preview=document.createElement('div');preview.className=`skin-preview skin-${skin.id}`;preview.textContent='T I D E';
      const title=document.createElement('strong');title.textContent=skin.name;
      const desc=document.createElement('small');desc.textContent=`${skin.background} · Level ${skin.unlock}`;
      const button=document.createElement('button');button.type='button';button.className='button button-secondary';
      const owned=profile.ownedSkins.includes(skin.id);
      const locked=profile.level<skin.unlock;
      button.textContent=profile.skin===skin.id?'Equipped ✓':owned?'Equip':locked?`Unlocks at level ${skin.unlock}`:`Buy · ${skin.cost} shells`;
      button.disabled=profile.skin===skin.id||locked||(!owned && profile.shells<skin.cost);
      button.addEventListener('click',()=>{
        if(!profile.ownedSkins.includes(skin.id)) {profile.shells-=skin.cost;profile.ownedSkins.push(skin.id);}
        profile.skin=skin.id;if(skin.id!=='seafoam')stat('skinsEquipped');unlockCheck();saveProgress();renderProfile();renderProgress('closet');
        showToast(`Equipped ${skin.name}!`);
      });
      item.append(preview,title,desc,button);cards.append(item);
    }
    els.progressBody.replaceChildren(cards);
  }

  function isFog(i) {return state.modifier==='fog' && state.fogCells.has(i) && !state.locked.has(i) && !state.selection.includes(i) && !state.hintCells.has(i);}
  function renderGrid() {
    const fragment = document.createDocumentFragment();
    for (let i=0;i<SIZE*SIZE;i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.index = String(i);
      cell.setAttribute('role','gridcell');
      cell.textContent = isFog(i) ? '·' : state.board[i];
      cell.tabIndex = i === state.focused ? 0 : -1;
      cell.setAttribute('aria-label',`Row ${rowOf(i)+1}, column ${colOf(i)+1}: ${isFog(i)?'veiled letter':state.board[i]}${state.locked.has(i) ? ', found' : ''}`);
      if (state.locked.has(i)) cell.classList.add('locked');
      if (state.selection.includes(i)) cell.classList.add('selected');
      if (state.badSelection.includes(i)) cell.classList.add('bad');
      if (state.hintCells.has(i)) cell.classList.add('hinted');
      if (isFog(i)) cell.classList.add('fog');
      fragment.append(cell);
    }
    els.grid.replaceChildren(fragment);
  }
  function updateCells() {
    [...els.grid.children].forEach((cell,i) => {
      cell.textContent = isFog(i) ? '·' : state.board[i];
      cell.classList.toggle('locked',state.locked.has(i));
      cell.classList.toggle('selected',state.selection.includes(i));
      cell.classList.toggle('bad',state.badSelection.includes(i));
      cell.classList.toggle('hinted',state.hintCells.has(i));
      cell.classList.toggle('fog',isFog(i));
      cell.tabIndex = i === state.focused ? 0 : -1;
      cell.setAttribute('aria-label',`Row ${rowOf(i)+1}, column ${colOf(i)+1}: ${isFog(i)?'veiled letter':state.board[i]}${state.locked.has(i) ? ', found' : ''}`);
    });
  }
  function renderWordList() {
    const fragment = document.createDocumentFragment();
    for (const word of state.words) {
      const found = state.found.has(word);
      const item = document.createElement('div');
      item.className = `word-item${found ? ' found' : ''}`;
      item.innerHTML = `<span class="word-check" aria-hidden="true">${found ? '✓' : '·'}</span><span>${word}</span>`;
      item.setAttribute('aria-label',`${word}, ${found ? 'found' : 'not found'}`);
      fragment.append(item);
    }
    els.wordList.replaceChildren(fragment);
    els.foundLabel.textContent = String(state.found.size);
    els.countBubble.textContent = `${state.found.size} / ${state.words.length}`;
    const revealed = state.found.size >= Math.ceil(state.words.length*.7);
    els.mysteryLocked.hidden = revealed;
    els.mysteryRevealed.hidden = !revealed;
    els.mysteryProgressFill.style.width = `${Math.min(100,state.found.size/Math.ceil(state.words.length*.7)*100)}%`;
    els.riddleText.textContent = state.bonusFound ? `Solved: ${state.bonus}!` : state.riddle;
    els.mysteryCard.classList.toggle('solved',state.bonusFound);
    els.finishBtn.hidden = !(state.won && !state.bonusFound);
  }
  function getElapsed() {
    if (!state) return 0;
    if (state.startedAt===null) return 0;
    return state.finishedAt===null?Math.max(0,performance.now()-state.startedAt):state.finishedAt-state.startedAt;
  }
  function renderStats() {
    els.scoreLabel.textContent = state.mode === 'chill' ? '—' : state.score.toLocaleString('en-US');
    els.timeLabel.textContent = state.mode === 'chill' ? '—' : timeString(getElapsed());
    els.pearlLabel.textContent = String(state.pearls);
    els.streakLabel.textContent = `${profile.streak} ${profile.streak === 1 ? 'day' : 'days'}`;
    const freezeActive = state.freezeUntil > performance.now() && !state.won;
    els.freezeBtn.disabled = state.mode === 'chill' || state.won || state.pearls < 1 || freezeActive;
    els.revealBtn.disabled = state.pearls < 2 || state.found.size === state.words.length;
  }
  function renderTideControls() {
    els.tideCard.classList.toggle('inactive',state.mode === 'chill');
    for (const button of document.querySelectorAll('[data-tide]')) {
      const selected = button.dataset.tide === state.tide;
      button.setAttribute('aria-pressed',String(selected));
      button.disabled = state.mode === 'chill';
    }
    els.tideBarFill.style.width = state.mode === 'chill' ? '0%' : ({calm:'30%',steady:'65%',rough:'100%'}[state.tide]);
    els.tideDescription.textContent = state.mode === 'chill' ? 'No waves, no timer, no pressure.' : `A wave every ${(driftInterval()/1000).toFixed(1)} seconds (level adjusted).`;
  }
  function showToast(message, announce = true) {
    els.toast.textContent = message;
    els.toast.classList.add('visible');
    if (announce) els.announcer.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('visible'),2200);
  }
  function hideWarning() { els.warningMarker.classList.remove('active');els.warningMarker2.classList.remove('active'); }
  function showWarning(plan, marker = els.warningMarker) {
    const percent = `${(plan.index+.5)*100/SIZE}%`;
    if (plan.axis === 'row') {
      marker.style.bottom = 'auto';
      marker.style.top = percent;
      marker.style.left = plan.direction > 0 ? '-5px' : 'auto';
      marker.style.right = plan.direction > 0 ? 'auto' : '-5px';
      marker.style.transform = 'translateY(-50%)';
    } else {
      marker.style.left = percent;
      marker.style.top = plan.direction > 0 ? '-7px' : 'auto';
      marker.style.bottom = plan.direction > 0 ? 'auto' : '-7px';
      marker.style.right = 'auto';
      marker.style.transform = 'translateX(-50%)';
    }
    marker.classList.add('active');
  }
  function driftInterval() {return Math.round(TIDES[state.tide].interval*state.difficulty.driftFactor);}
  function updateClock() {
    if (state.startedAt===null) {els.waveStatus.textContent='A special wave is approaching…';return;}
    if (state.mode === 'chill') { els.waveStatus.textContent = 'The water is still · take your time'; return; }
    if (state.won) { els.waveStatus.textContent = 'Every listed word found · tide at rest'; return; }
    if (state.drifting) { els.waveStatus.textContent = 'The tide is drifting…'; return; }
    const now = performance.now();
    if (state.freezeUntil > now) { els.waveStatus.textContent = `❄ Tide frozen · ${Math.ceil((state.freezeUntil-now)/1000)}s`; return; }
    const remains = Math.max(0,state.nextDriftAt-now);
    els.waveStatus.textContent = `Next wave in ${Math.ceil(remains/1000)}s`;
    if (remains <= 1050 && !state.nextWave) {
      state.nextWave = {axis: state.rng()<.5?'row':'col',index:Math.floor(state.rng()*SIZE),direction:state.rng()<.5?-1:1};
      if(state.modifier==='double')state.nextWave.otherIndex=(state.nextWave.index+1+Math.floor(state.rng()*(SIZE-1)))%SIZE;
      showWarning(state.nextWave);
      if(state.modifier==='double')showWarning({...state.nextWave,index:state.nextWave.otherIndex},els.warningMarker2);
    }
    if (remains <= 0 && !state.pointer && !state.keyboardStart) startDrift();
  }

  // ── Input handling (pointer, touch, and keyboard) ────────────────────────
  function snappedPath(start,end) {
    const dx=colOf(end)-colOf(start), dy=rowOf(end)-rowOf(start);
    if (dx === 0 && dy === 0) return [start];
    // Quantize pointer angle into exactly one of eight 45-degree directions;
    // projection then chooses the closest integer number of grid steps.
    const angle = Math.atan2(dy,dx);
    const octant = ((Math.round(angle/(Math.PI/4))%8)+8)%8;
    const [vx,vy] = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]][octant];
    let steps = Math.max(0,Math.round((dx*vx+dy*vy)/(vx*vx+vy*vy)));
    const path = [];
    for (let i=0;i<=steps;i++) {
      const row = rowOf(start)+vy*i, col=colOf(start)+vx*i;
      if (row<0||row>=SIZE||col<0||col>=SIZE) break;
      path.push(indexOf(row,col));
    }
    return path;
  }
  function pointerToCell(x,y) {
    const rect = els.grid.getBoundingClientRect();
    if (!rect.width || !rect.height) return state.focused;
    // Compute against CURRENT bounding rect, not the drag-start rect: a
    // mid-gesture resize or device rotation cannot corrupt selection indices.
    const col = Math.max(0,Math.min(SIZE-1,Math.floor((x-rect.left)/rect.width*SIZE)));
    const row = Math.max(0,Math.min(SIZE-1,Math.floor((y-rect.top)/rect.height*SIZE)));
    return indexOf(row,col);
  }
  function updateSelection(end) {
    if (!state || state.won && state.bonusFound) return;
    const start = state.pointer ? state.pointer.start : state.keyboardStart;
    if (start === null || start === undefined) return;
    state.selection = snappedPath(start,end);
    updateCells();
  }
  function resetSelection() {
    state.selection = [];
    state.keyboardStart = null;
    state.pointer = null;
    updateCells();
  }
  function invalidSelection(path) {
    state.badSelection = path.slice();
    state.selection = [];
    updateCells();
    setTimeout(() => { if (!state) return; state.badSelection = []; updateCells(); },470);
  }
  function finishSelection() {
    if (!state) return;
    const selection = state.selection.slice();
    state.pointer = null; state.keyboardStart = null;
    state.selection = [];
    if (!selection.length) { updateCells(); return; }
    const chosen = wordAt(state.board,selection);
    const reversed = chosen.split('').reverse().join('');
    const match = state.words.find(w => !state.found.has(w) && (chosen === w || reversed === w));
    if (match) claimWord(match,selection,false);
    else if (state.found.size >= Math.ceil(state.words.length*.7) && !state.bonusFound && (chosen === state.bonus || reversed === state.bonus)) claimWord(state.bonus,selection,true);
    else if (selection.length > 1) {state.mistakes++; invalidSelection(selection); showToast('Not quite! Follow a hidden word.',false); }
    else { state.badSelection=[]; updateCells(); }
  }
  function setupGridEvents() {
    // Keep the roving tabindex synchronized with pointer, programmatic, and
    // assistive-technology focus, not just arrow-key navigation.
    els.grid.addEventListener('focusin',e => {
      const target = e.target.closest('.cell');
      if (!target) return;
      state.focused = Number(target.dataset.index);
      updateCells();
    });
    els.grid.addEventListener('pointerdown',e => {
      if (state.startedAt===null || state.drifting || state.pointer || state.won && state.bonusFound) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = e.target.closest('.cell');
      if (!target) return;
      e.preventDefault();
      const start = Number(target.dataset.index);
      state.focused = start;
      state.keyboardStart = null;
      state.pointer = {id:e.pointerId,start,x:e.clientX,y:e.clientY};
      state.badSelection=[];
      state.selection = [start];
      try { els.grid.setPointerCapture(e.pointerId); } catch (_error) { /* Safe fallback: window listeners below. */ }
      updateCells();
    });
    els.grid.addEventListener('pointermove',e => {
      if (!state.pointer || state.pointer.id !== e.pointerId) return;
      e.preventDefault();
      state.pointer.x=e.clientX; state.pointer.y=e.clientY;
      updateSelection(pointerToCell(e.clientX,e.clientY));
    });
    const pointerDone = e => {
      if (!state.pointer || state.pointer.id !== e.pointerId) return;
      updateSelection(pointerToCell(e.clientX,e.clientY));
      try { if (els.grid.hasPointerCapture(e.pointerId)) els.grid.releasePointerCapture(e.pointerId); } catch (_error) {}
      finishSelection();
    };
    els.grid.addEventListener('pointerup',pointerDone);
    window.addEventListener('pointerup',pointerDone);
    window.addEventListener('pointercancel',e => {
      if (state.pointer && state.pointer.id === e.pointerId) resetSelection();
    });
    window.addEventListener('resize',() => {
      if (state.pointer) updateSelection(pointerToCell(state.pointer.x,state.pointer.y));
    },{passive:true});
    els.grid.addEventListener('keydown',e => {
      if (state.startedAt===null || state.drifting) return;
      let next=state.focused;
      if (e.key === 'ArrowRight') next=indexOf(rowOf(next),Math.min(SIZE-1,colOf(next)+1));
      else if (e.key === 'ArrowLeft') next=indexOf(rowOf(next),Math.max(0,colOf(next)-1));
      else if (e.key === 'ArrowUp') next=indexOf(Math.max(0,rowOf(next)-1),colOf(next));
      else if (e.key === 'ArrowDown') next=indexOf(Math.min(SIZE-1,rowOf(next)+1),colOf(next));
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (state.keyboardStart === null) { state.keyboardStart = state.focused; state.selection = [state.focused]; }
        else finishSelection();
        updateCells();
        return;
      } else if (e.key === 'Escape') { resetSelection(); return; }
      else return;
      e.preventDefault();
      state.focused = next;
      if (state.keyboardStart !== null) updateSelection(next);
      else updateCells();
      els.grid.children[next].focus();
    });
  }

  // ── Tide logic ─────────────────────────────────────────────────────────
  function buildDrift(plan) {
    if (state.modifier==='double' && !plan.single) {
      const other={...plan,index:plan.otherIndex ?? (plan.index+1+Math.floor(state.rng()*(SIZE-1)))%SIZE,single:true};
      const a=buildDrift({...plan,single:true});
      const original=state.board;
      state.board=a.targetBoard;
      const b=buildDrift(other);
      state.board=original;
      return {movable:[...a.movable,...b.movable],mapping:[...a.mapping,...b.mapping],targetBoard:b.targetBoard};
    }
    const cells = Array.from({length:SIZE},(_,k) => plan.axis==='row' ? indexOf(plan.index,k) : indexOf(k,plan.index));
    const movable = cells.filter(cell => !state.locked.has(cell));
    // Circularly rotate only the unlocked slots. A locked tile behaves like an
    // anchored rock: it remains in its physical cell, even while other letters
    // wrap past it. Rotation by one always works for 0..10 unlocked slots.
    const targetBoard = state.board.slice();
    if (movable.length < 2) return {movable:[],mapping:[],targetBoard};
    const mapping = movable.map((src,i) => {
      const dest = movable[(i+plan.direction+movable.length)%movable.length];
      targetBoard[dest] = state.board[src];
      return {src,dest,wrap:plan.direction>0 ? i===movable.length-1 : i===0};
    });
    return {movable,mapping,targetBoard};
  }
  function animateDrift(mapping,done) {
    if (reducedMotion() || !mapping.length) { done(); return; }
    const cells = els.grid.children;
    const wrapRect = els.boardWrap.getBoundingClientRect();
    const floaters = [];
    const wrapIns = [];
    for (const {src,dest,wrap} of mapping) {
      const srcRect = cells[src].getBoundingClientRect();
      const destRect = cells[dest].getBoundingClientRect();
      const sprite = document.createElement('div');
      sprite.className = 'drift-floater';
      sprite.textContent = state.board[src];
      Object.assign(sprite.style,{left:`${srcRect.left-wrapRect.left}px`,top:`${srcRect.top-wrapRect.top}px`,width:`${srcRect.width}px`,height:`${srcRect.height}px`});
      els.driftOverlay.append(sprite);
      cells[src].classList.add('shifting');
      const distanceX = destRect.left-srcRect.left, distanceY=destRect.top-srcRect.top;
      floaters.push({sprite,src,dest,wrap,distanceX,distanceY});
      if (wrap) {
        const arrival = sprite.cloneNode(true);
        arrival.classList.add('wrap-in');
        Object.assign(arrival.style,{left:`${destRect.left-wrapRect.left}px`,top:`${destRect.top-wrapRect.top}px`});
        els.driftOverlay.append(arrival);
        wrapIns.push(arrival);
      }
    }
    // Two frames ensure the browser paints starting positions before applying
    // CSS transforms. Wrap-around uses an outgoing and an incoming faded tile
    // rather than dragging one tile all the way across a ten-cell row.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      for (const {sprite,wrap,distanceX,distanceY} of floaters) {
        if (wrap) {
          const fraction = .55;
          sprite.style.transform = `translate(${distanceX*fraction}px,${distanceY*fraction}px)`;
          sprite.classList.add('wrap-out');
        } else sprite.style.transform = `translate(${distanceX}px,${distanceY}px)`;
      }
      wrapIns.forEach(sprite => sprite.style.opacity='1');
    }));
    setTimeout(() => {
      for (const {src} of floaters) cells[src].classList.remove('shifting');
      els.driftOverlay.replaceChildren();
      done();
    },510);
  }
  function startDrift() {
    if (state.startedAt===null || state.drifting || state.won || state.mode === 'chill' || state.pointer || state.keyboardStart !== null) return;
    const plan = state.nextWave || {axis:state.rng()<.5?'row':'col',index:Math.floor(state.rng()*SIZE),direction:state.rng()<.5?-1:1};
    state.nextWave = null;
    hideWarning();
    const drift = buildDrift(plan);
    // Assemble a legal next board before showing any animation; if a proposed
    // slide has no legal reweave, another axis is tried rather than showing an
    // unsolvable board. Found cells always stay fixed.
    const rethread = reweaveAfterDrift(drift.targetBoard);
    if (!rethread) {
      state.nextDriftAt = performance.now()+driftInterval();
      return;
    }
    state.drifting = true;
    const runningRound=state;
    animateDrift(drift.mapping,() => {
      if(state!==runningRound)return;
      state.board = rethread.board;
      state.paths = rethread.paths;
      // A paid hint follows its target as the unfound word is rewoven.
      refreshHintCells();
      state.drifting = false;
      state.nextDriftAt = performance.now()+driftInterval();
      updateCells();
      playSound('splash');
      showToast('A new current! Unfound words have shifted.',false);
      renderStats();
    });
  }
  function tick() {
    if (!state) return;
    if(state.startedAt===null)return;
    renderStats();
    updateClock();
  }

  // ── Scoring and powers ─────────────────────────────────────────────────
  function playSound(kind) {
    if (!soundEnabled) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      audioContext = audioContext || new Context();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const now=audioContext.currentTime;
      if (kind === 'chime') {
        [660,880].forEach((hz,n) => {
          const osc=audioContext.createOscillator(),gain=audioContext.createGain();
          osc.type='sine'; osc.frequency.setValueAtTime(hz,now+n*.09);
          gain.gain.setValueAtTime(.0001,now+n*.09);
          gain.gain.exponentialRampToValueAtTime(.055,now+n*.09+.02);
          gain.gain.exponentialRampToValueAtTime(.0001,now+n*.09+.38);
          osc.connect(gain).connect(audioContext.destination); osc.start(now+n*.09);osc.stop(now+n*.09+.4);
        });
      } else {
        const osc=audioContext.createOscillator(),gain=audioContext.createGain();
        osc.type='sine';osc.frequency.setValueAtTime(260,now);osc.frequency.exponentialRampToValueAtTime(120,now+.3);
        gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.032,now+.045);gain.gain.exponentialRampToValueAtTime(.0001,now+.33);
        osc.connect(gain).connect(audioContext.destination);osc.start(now);osc.stop(now+.35);
      }
    } catch (_error) { /* Audio is decorative and should never interrupt play. */ }
  }
  function claimWord(word,path,isBonus) {
    state.hintedWords.delete(word);
    path.forEach(id => state.locked.add(id));
    refreshHintCells();
    state.badSelection=[];
    if (isBonus) {
      state.bonusFound = true;
      if (state.mode !== 'chill') state.score += Math.round(650*TIDES[state.tide].multiplier);
      stat('mysteries');dailyProgress('mysteries');const mysteryXP=state.mode==='chill'?20:Math.round(130*(state.modifier?MODIFIERS[state.modifier].xp:1));state.xpGained+=mysteryXP; xpAdd(mysteryXP); 
      showToast(`✦ Mystery solved: ${word}! Bonus treasure earned.`);
    } else {
      state.found.add(word);
      stat('words');dailyProgress('words');
      const delta=performance.now()-state.startedAt;
      const newTime=performance.now();
      state.findTimes.push(newTime);state.findTimes=state.findTimes.filter(t=>newTime-t<=10000);
      if (state.findTimes.length>=3 && !state.tripleGranted) {stat('quickTriples');state.tripleGranted=true;}
      const line=state.paths[word];
      if (line) { const dc=colOf(line[1])-colOf(line[0]),dr=rowOf(line[1])-rowOf(line[0]);
        if (dc!==0&&dr!==0){stat('diagonals');dailyProgress('diagonals');}
        if (dc<0||(dc===0&&dr<0))stat('backwards');
      }
      const speed=state.lastFoundAt!==null && newTime-state.lastFoundAt<5000 ? 1.3 : delta/state.found.size < 14000?1.15:1;
      const streakBonus=1+Math.min(.5,profile.streak*.05);
      const mult=state.mode==='chill'? .55 : TIDES[state.tide].multiplier*streakBonus*speed*(state.modifier?MODIFIERS[state.modifier].xp:1);
      const gained=Math.round((22+word.length*5)*mult); state.xpGained+=gained;xpAdd(gained);
      if (state.mode !== 'chill') state.score += Math.round(word.length*100*TIDES[state.tide].multiplier);
      const now=performance.now();
      if (state.lastFoundAt !== null && now-state.lastFoundAt <= 5000) {
        state.pearls++;profile.pearls++;stat('pearlsEarned');dailyProgress('pearlsEarned');saveProgress();
        showToast(`✦ ${word} found! Quick pair — you earned a pearl!`);
      } else showToast(`✦ ${word} found!`);
      state.lastFoundAt=now;
      if (state.found.size === Math.ceil(state.words.length*.7)) setTimeout(() => { if (state && state.found.size >= 6) showToast('A mystery riddle has surfaced!'); },750);
    }
    playSound('chime');
    renderWordList(); updateCells(); renderStats();
    // Allow the mystery to be solved after completing the eight listed words.
    if (state.found.size === state.words.length && !state.won) {
      state.won = true;
      state.finishedAt = performance.now();
      state.nextWave = null;
      hideWarning();
      awardWin();
      renderThemeOptions();renderStats();renderWordList();
      showWin();
    } else if (isBonus && state.won) showWin();
  }
  function freezeTide() {
    if (state.mode === 'chill' || state.won || state.pearls < 1 || state.freezeUntil > performance.now()) return;
      state.pearls--;profile.pearls--;state.pearlsSpent++;saveProgress();
    const now=performance.now();
    stat('freezes');unlockCheck();
    state.freezeUntil=now+10000;
    state.nextDriftAt += 10000;
    state.nextWave=null;
    hideWarning();
    showToast('❄ The tide is frozen for 10 seconds.');
    renderStats();updateClock();
  }
  function refreshHintCells() {
    state.hintCells.clear();
    for (const word of state.hintedWords) {
      if (state.found.has(word)) continue;
      const oldPath = state.paths[word];
      const path = oldPath && wordAt(state.board,oldPath) === word ? oldPath : findExistingPath(state.board,word);
      if (path) state.hintCells.add(path[0]);
    }
  }
  function revealFirstLetter() {
    if (state.pearls < 2) return;
    const remaining=state.words.filter(word=>!state.found.has(word));
    if (!remaining.length) return;
    state.pearls -= 2;profile.pearls-=2;state.pearlsSpent+=2;state.hintsUsed++;saveProgress();
    const word=remaining[Math.floor(state.rng()*remaining.length)];
    let path=state.paths[word];
    if (!path || wordAt(state.board,path)!==word) path=findExistingPath(state.board,word);
    if (path) state.hintedWords.add(word);
    refreshHintCells();
    showToast(`✧ The first letter of ${word} is glowing!`);
    updateCells();renderStats();
  }

  // ── Round lifecycle and modals ─────────────────────────────────────────
  function currentMode() { return els.modeSelect.value; }
  function startRound() {
    // A daily's level and all its random decisions are independent of the user
    // profile. This is essential for identical puzzles in different browsers.
    ensureDailyGoals();
    const mode=currentMode(),date=utcDay(),daily=mode==='daily';
    const seed=daily?hashString(`TIDEWORDS-DAILY-${date}`):Math.floor(Math.random()*4294967296);
    const rng=createRandom(seed);
    const theme=daily?THEME_ORDER[hashString(`TIDEWORDS-THEME-${date}`)%THEME_ORDER.length]:
      pendingTheme && canVisit(pendingTheme)?pendingTheme:canVisit(els.themeSelect.value)?els.themeSelect.value:'rainforest';
    const config=getDifficultyConfig(daily?6:profile.level);
    const modifier=mode==='classic' && config.modifiers && rng()<.38 ?
      Object.keys(MODIFIERS)[Math.floor(rng()*Object.keys(MODIFIERS).length)] : null;
    SIZE=config.size;PATH_CATALOG.clear();
    const roundIndex=profile.roundIndex+1;
    const puzzle=createPuzzle(theme,rng,config,daily?null:pendingSub,modifier,daily,roundIndex);
    pendingTheme=null;pendingSub=null;
    // Track seen content exactly once for repeat plays of a daily date.
    if(!daily || profile.lastSeenDaily!==date) {
      markSeen(profile.seenWords,puzzle.words,roundIndex);
      markSeen(profile.seenMysteries,[puzzle.bonus],roundIndex);
      if(daily)profile.lastSeenDaily=date;
    }
    if(!daily) profile.roundIndex=roundIndex;
    saveProgress();
    const tide=state?state.tide:'steady';
    state={mode,theme,seed,dailyDate:date,rng,tide,modifier,difficulty:config,subKeys:puzzle.subKeys,
      board:puzzle.board,words:puzzle.words,bonus:puzzle.bonus,riddle:puzzle.riddle,
      paths:puzzle.paths,found:new Set(),locked:new Set(),hintCells:new Set(),hintedWords:new Set(),bonusFound:false,
      score:0,pearls:profile.pearls,pearlsSpent:0,hintsUsed:0,mistakes:0,xpGained:0,newUnlocks:[],
      findTimes:[],tripleGranted:false,lastFoundAt:null,startedAt:performance.now(),finishedAt:null,
      focused:0,pointer:null,keyboardStart:null,selection:[],badSelection:[],fogCells:new Set(),
      nextWave:null,nextDriftAt:0,freezeUntil:0,drifting:false,won:false,masteryChange:[]};
    if(modifier==='fog') for(let i=0;i<SIZE*SIZE;i++)if(rng()<.18)state.fogCells.add(i);
    els.grid.style.gridTemplateColumns=`repeat(${SIZE},minmax(0,1fr))`;
    els.grid.style.gridTemplateRows=`repeat(${SIZE},minmax(0,1fr))`;
    els.grid.setAttribute('aria-label',`${SIZE} by ${SIZE} letter grid. Drag to select or use arrow keys and Enter.`);
    els.boardWrap.style.setProperty('--board-size',SIZE);
    els.winModal.hidden=true;els.helpModal.hidden=true;els.progressModal.hidden=true;
    els.driftOverlay.replaceChildren();hideWarning();
    els.roundBadge.textContent=`${THEMES[theme].icon} ${THEMES[theme].name.toUpperCase()} · ${puzzle.subKeys.map(k=>(THEMES[theme].subThemes[k]||WILDCARDS[k]).name).join(' + ')}${daily?' · DAILY':''}`;
    els.wordTotal.textContent=` / ${puzzle.words.length} words`;
    els.mysteryRequirement.textContent=`Find ${Math.ceil(puzzle.words.length*.7)} of ${puzzle.words.length} words to unlock a bonus riddle.`;
    els.modifierBadge.hidden=!modifier;
    if(modifier)els.modifierBadge.textContent=`${MODIFIERS[modifier].icon} ${MODIFIERS[modifier].name} · ${MODIFIERS[modifier].xp}× XP`;
    renderThemeOptions();renderGrid();renderWordList();renderTideControls();renderStats();renderProfile();
    state.nextDriftAt=performance.now()+driftInterval();updateClock();
    if(modifier) {
      els.modifierTitle.textContent=`${MODIFIERS[modifier].icon} ${MODIFIERS[modifier].name}`;
      els.modifierDescription.textContent=`${MODIFIERS[modifier].description} +${Math.round((MODIFIERS[modifier].xp-1)*100)}% XP this round.`;
      els.modifierModal.hidden=false;
      state.startedAt=null;
      els.beginModifierBtn.focus();
    } else els.modifierModal.hidden=true;
    els.announcer.textContent=`New ${mode} ${THEMES[theme].name} puzzle. ${puzzle.words.length} words to find.`;
  }
  function dailySummary() {
    return `≋ Tidewords Daily ${state.dailyDate}\n${state.found.size}/${state.words.length} words${state.bonusFound?' + mystery ✦':''}\nTime: ${timeString(getElapsed())}\nScore: ${state.score.toLocaleString('en-US')}\nDaily streak: ${profile.streak} days\n🌊 Find your flow.`;
  }
  function shareSummary() {
    return state.mode==='daily'?dailySummary():
      `≋ Tidewords · ${THEMES[state.theme].name} / ${state.subKeys.join(' + ')}\n${state.found.size}/${state.words.length} words${state.bonusFound?' + mystery ✦':''}\n${state.mode==='chill'?'Chill mode':'Time: '+timeString(getElapsed())+' · Score: '+state.score.toLocaleString('en-US')}\n🌊 Find your flow.`;
  }
  async function copySummary() {
    const summary=shareSummary();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('No secure clipboard');
      await navigator.clipboard.writeText(summary);
      els.shareFallback.hidden=true;
      showToast('Result copied! Share your wave 🌊');
    } catch (_error) {
      // file:// pages and permission-restricted browsers can lack Clipboard API.
      const input=document.createElement('textarea');
      input.value=summary;input.style.position='fixed';input.style.opacity='0';
      document.body.append(input);input.select();
      let copied=false;
      try { copied=document.execCommand('copy'); } catch (_error2) {}
      input.remove();
      if (!copied) {
        els.shareFallback.hidden=false;
        els.shareFallback.value=summary;
        els.shareFallback.focus();
        els.shareFallback.select();
      } else els.shareFallback.hidden=true;
      showToast(copied?'Result copied! Share your wave 🌊':'Select and copy the result text below.');
    }
  }
  function showWin() {
    els.shareFallback.hidden=true;
    els.winScore.textContent=state.mode==='chill'?'Relaxed':state.score.toLocaleString('en-US');
    els.winTime.textContent=state.mode==='chill'?'Untimed':timeString(getElapsed());
    els.winWords.textContent=`${state.found.size} / ${state.words.length}`;
    els.winSubtitle.textContent=state.bonusFound?'Every word and the mystery treasure found!':`All ${state.words.length} words gathered. A mystery still waits below.`;
    const best=profile.bestTimes[`${state.mode}:${state.theme}`];
    const extras=[];
    if(state.mode==='daily')extras.push(`${state.dailyDate} · ${profile.streak}-day streak`);
    if(state.mode!=='chill'&&Number.isFinite(best))extras.push(`Best time: ${timeString(best)}`);
    extras.push(`+${5+Math.floor(state.words.length/4)} shells earned`);
    els.winExtra.textContent=extras.join(' · ');
    els.winXP.textContent=`+${state.xpGained} XP`;
    els.winXP.classList.remove('xp-reveal');void els.winXP.offsetWidth;els.winXP.classList.add('xp-reveal');
    const low=xpForLevel(profile.level),high=xpForLevel(profile.level+1);
    els.winXpBar.style.width=`${(profile.xp-low)/(high-low)*100}%`;
    els.winXpDetail.textContent=`Level ${profile.level} · ${high-profile.xp} XP to next level`;
    els.winMastery.textContent=state.masteryChange.length?state.masteryChange.join(' · '):'Wildcard voyage';
    els.winUnlocks.textContent=state.newUnlocks.length?`New: ${[...new Set(state.newUnlocks)].join(', ')}`:'Keep exploring to unlock more islands and cosmetics.';
    els.winNext.textContent=nextUp();
    els.bonusContinueBtn.hidden=state.bonusFound;
    els.winModal.hidden=false;els.continueBtn.focus();
  }
  function setupUIEvents() {
    els.newBtn.addEventListener('click',startRound);
    els.modeSelect.addEventListener('change',startRound);
    els.themeSelect.addEventListener('change',startRound);
    document.querySelectorAll('[data-tide]').forEach(button => button.addEventListener('click',() => {
      if (state.mode==='chill') return;
      state.tide=button.dataset.tide;
      state.freezeUntil=0;state.nextWave=null;
      state.nextDriftAt=performance.now()+driftInterval();
      hideWarning();renderTideControls();renderStats();updateClock();
      showToast(`${button.dataset.tide[0].toUpperCase()+button.dataset.tide.slice(1)} tide · ${TIDES[state.tide].multiplier}× score.`);
    }));
    els.freezeBtn.addEventListener('click',freezeTide);
    els.revealBtn.addEventListener('click',revealFirstLetter);
    els.soundBtn.addEventListener('click',() => {
      soundEnabled=!soundEnabled;profile.sound=soundEnabled;saveProgress();
      els.soundBtn.setAttribute('aria-pressed',String(soundEnabled));
      els.soundBtn.setAttribute('aria-label',soundEnabled?'Mute sounds':'Enable sounds');
      showToast(soundEnabled?'Sounds on ♪':'Sounds off',false);
      if (soundEnabled) playSound('chime');
    });
    els.motionBtn.addEventListener('click',() => {
      if (systemReducedMotion) { showToast('Reduced motion is on in your system settings.');return; }
      manualReduceMotion=!manualReduceMotion;
      document.body.classList.toggle('reduce-motion',manualReduceMotion);
      els.motionBtn.setAttribute('aria-pressed',String(manualReduceMotion));
      els.motionBtn.setAttribute('aria-label',manualReduceMotion?'Disable reduced motion':'Enable reduced motion');
      showToast(manualReduceMotion?'Reduced motion on':'Full motion on',false);
    });
    if (systemReducedMotion) els.motionBtn.setAttribute('aria-pressed','true');
    const openHelp=() => { els.helpModal.hidden=false;els.closeHelpBtn.focus(); };
    const closeHelp=() => { els.helpModal.hidden=true;els.helpBtn.focus(); };
    els.helpBtn.addEventListener('click',openHelp);
    els.closeHelpBtn.addEventListener('click',closeHelp);
    els.gotItBtn.addEventListener('click',closeHelp);
    els.helpModal.addEventListener('click',e => { if (e.target===els.helpModal) closeHelp(); });
    els.replayBtn.addEventListener('click',startRound);
    els.themeBtn.addEventListener('click',() => { els.winModal.hidden=true;openProgress('islands'); });
    els.continueBtn.addEventListener('click',()=>{els.winModal.hidden=true;startRound();});
    els.mapBtn.addEventListener('click',()=>openProgress('islands'));
    els.achievementsBtn.addEventListener('click',()=>openProgress('achievements'));
    els.closetBtn.addEventListener('click',()=>openProgress('closet'));
    els.closeProgressBtn.addEventListener('click',closeProgress);
    els.progressModal.addEventListener('click',e=>{if(e.target===els.progressModal)closeProgress();});
    document.querySelectorAll('[data-progress-tab]').forEach(b=>b.addEventListener('click',()=>renderProgress(b.dataset.progressTab)));
    els.beginModifierBtn.addEventListener('click',()=>{els.modifierModal.hidden=true;state.startedAt=performance.now();state.nextDriftAt=performance.now()+driftInterval();els.grid.children[0].focus();});
    els.shareBtn.addEventListener('click',copySummary);
    els.bonusContinueBtn.addEventListener('click',() => { els.winModal.hidden=true;els.grid.children[state.focused].focus(); });
    els.finishBtn.addEventListener('click',showWin);
    window.addEventListener('keydown',e => {
      if (e.key === 'Tab') {
        const modal=!els.helpModal.hidden?els.helpModal:!els.winModal.hidden?els.winModal:!els.progressModal.hidden?els.progressModal:!els.modifierModal.hidden?els.modifierModal:null;
        if (modal) {
          const focusable = [...modal.querySelectorAll('button:not([disabled]):not([hidden])')];
          const first=focusable[0],last=focusable[focusable.length-1];
          if (first && (e.shiftKey && document.activeElement===first)) { e.preventDefault();last.focus(); }
          else if (last && !e.shiftKey && document.activeElement===last) { e.preventDefault();first.focus(); }
        }
      }
      if (e.key!=='Escape') return;
      if (!els.helpModal.hidden) closeHelp();
      else if (!els.progressModal.hidden)closeProgress();
      else if (!els.winModal.hidden && !state.bonusFound)els.winModal.hidden=true;
    });
  }
  function init() {
    for (const id of ['grid','boardWrap','driftOverlay','warningMarker','modeSelect','themeSelect','newBtn','scoreLabel','timeLabel','pearlLabel','streakLabel','roundBadge','foundLabel','countBubble','wordList','mysteryCard','mysteryLocked','mysteryRevealed','mysteryProgressFill','riddleText','tideCard','tideBarFill','tideDescription','waveStatus','freezeBtn','revealBtn','soundBtn','motionBtn','helpBtn','helpModal','closeHelpBtn','gotItBtn','winModal','winScore','winTime','winWords','winSubtitle','winExtra','replayBtn','themeBtn','shareBtn','bonusContinueBtn','finishBtn','shareFallback','toast','announcer','xpFill','xpLabel','levelLabel','nextGoal','shellLabel','totalPearls','goalList','mapBtn','achievementsBtn','closetBtn','progressModal','progressTitle','progressBody','closeProgressBtn','winXP','winXpBar','winXpDetail','winMastery','winUnlocks','winNext','continueBtn','modifierModal','modifierTitle','modifierDescription','beginModifierBtn','modifierBadge','mysteryRequirement','wordTotal','warningMarker2','levelSplash']) els[id]=$(id);
    loadProgress();ensureDailyGoals();soundEnabled=profile.sound;
    els.soundBtn.setAttribute('aria-pressed',String(soundEnabled));
    setupGridEvents();setupUIEvents();startRound();
    tickId = window.setInterval(tick,100);
    window.addEventListener('pagehide',() => { clearInterval(tickId); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
