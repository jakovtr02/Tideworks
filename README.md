# Tidewords v2 — progression edition

Open `index.html` with `styles.css` and `game.js` in the same folder, or use the separate self-contained `tidewords-v2.html` file.

## Play
Drag over a word in any straight direction or focus the board and use arrow keys + Enter/Space. Find about 70% of listed words to unlock the mystery clue. Tide moves unlocked letters; found words are anchored. Find two words within five seconds to earn a pearl; spend one to freeze the tide for ten seconds or two to highlight a word's first letter.

## Progression
Earn XP per found word; level up for larger boards, blended word pools, modifiers and new islands. The Islands screen offers focused sub-theme challenges and Bronze/Silver/Gold mastery. Daily goals reward 80 XP, 10 shells and 1 pearl each. The Shell Shop lets you buy and equip color palettes. Achievements record 19 milestones. The Daily mode uses the current UTC date and a fixed puzzle level to keep grids identical across player profiles.

## Balance
- Cumulative level threshold: floor(150 * (level - 1)^1.45)
- Listed-word XP: round((22 + 5 * word length) * tide * daily-streak * speed * modifier); Chill uses 0.55x flat.
- Tide XP multiplier: Calm 1x, Steady 1.5x, Rough 2x; speed up to 1.3x; daily streak +5% per day to +50%.
- Grid size: 10x10 to 14x14 (one step each four levels). Words: 8 to 14 (one additional word every three levels).
- Drift intervals: 18, 12 or 8 seconds multiplied by max(0.58, 1 - 0.027*(level-1)).
- New islands: Space at level 4, Kitchen at level 8, or after two completed subthemes on the previous island.
- Mastery: Bronze on any completion (Chill capped at Bronze); Silver at >=85% accuracy, no hints and <=max(240s, 25s per word); Gold at >=95% accuracy, no hints and <=max(120s,15s per word).
- Modifiers: available from level 5 with a 38% chance each Tide Run; XP buffs +20% to +35%.
- Round shells: 5 + floor(number of words/4). Skins cost 25, 40 and 65 shells and require levels 2, 5 and 9.

Previous tidewords-progress-v1 saves migrate automatically to tidewords-profile-v3, retaining unlocks, records and daily streaks. localStorage access is optional and protected by try/catch. No frameworks, CDN, web fonts or network requests.
