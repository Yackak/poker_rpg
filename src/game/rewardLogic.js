import { shuffle } from '../utils/shuffle';
import { WEAPONS_DB, getReqLabel } from '../data/weapons';
import { MODULES_DB } from '../data/modules';
import { DEFAULT_MODULE_TIER_WEIGHTS, TIER_SHIFT_INTERVAL } from './constants';

function buildUpgradeOptions(player) {
  return player.weapons
    .filter((w) => w.level < 6)
    .map((w) => ({
      type: 'upgrade',
      weaponId: w.id,
      label: '무기 강화',
      title: `${WEAPONS_DB[w.id].name} LV.${w.level} ▶ LV.${w.level + 1}`,
      desc: WEAPONS_DB[w.id].effectDesc(w.level + 1),
    }));
}

function buildNewWeaponOptions(player, stage) {
  const newWpnLvl = Math.ceil(stage / 4);
  return Object.keys(WEAPONS_DB)
    .filter((id) => !player.weapons.some((w) => w.id === id))
    .map((id) => {
      const wInfo = WEAPONS_DB[id];
      return {
        type: 'new_weapon',
        weaponId: id,
        level: newWpnLvl,
        label: '새로운 무기',
        title: `${wInfo.name} LV.${newWpnLvl}`,
        desc: `[ ${wInfo.reqCount}${getReqLabel(wInfo.reqType)} ]`,
      };
    });
}

/**
 * @param {{ isBossVictory?: boolean, tierWeights?: typeof DEFAULT_MODULE_TIER_WEIGHTS }} moduleRewardOpts
 */
export function buildVictoryRewards(
  player,
  stage,
  weaponBonus = false,
  moduleRewardOpts = { isBossVictory: false }
) {
  const moduleOptions = generateModuleRewards(player, moduleRewardOpts).map((m) => ({
    type: 'module',
    id: m.id,
    data: m,
  }));
  const weaponOptions = weaponBonus
    ? generateWeaponRewards(player, stage).map((o) => ({ ...o }))
    : [];

  return { moduleOptions, weaponOptions };
}

export function rollModuleTier(weights = DEFAULT_MODULE_TIER_WEIGHTS) {
  const roll = Math.random() * 100;
  if (roll < weights.normal) return 'normal';
  if (roll < weights.normal + weights.rare) return 'rare';
  return 'epic';
}

function pickFromPool(pool, usedIds) {
  const available = pool.filter((m) => !usedIds.has(m.id));
  if (available.length === 0) return null;
  return shuffle([...available])[0];
}

function pickNormalModuleRewards(unowned, weights, count = 3) {
  const picks = [];
  const usedIds = new Set();
  const nonLegend = unowned.filter((m) => m.rarity !== 'legend');

  for (let i = 0; i < count; i++) {
    const tier = rollModuleTier(weights);
    let pick =
      pickFromPool(
        nonLegend.filter((m) => m.rarity === tier),
        usedIds
      ) ?? pickFromPool(nonLegend, usedIds);

    if (!pick) break;
    picks.push(pick);
    usedIds.add(pick.id);
  }

  return picks;
}

export function generateModuleRewards(player, opts = {}) {
  const isBossVictory = opts.isBossVictory === true;
  const weights = opts.tierWeights ?? DEFAULT_MODULE_TIER_WEIGHTS;

  const unowned = Object.values(MODULES_DB).filter(
    (m) => !player.modules.includes(m.id) && !player.inventoryModules.includes(m.id)
  );

  if (isBossVictory) {
    const pool = unowned.filter((m) => m.rarity === 'legend');
    return shuffle([...pool]).slice(0, 3);
  }

  return pickNormalModuleRewards(unowned, weights, 3);
}

/** 매 3전투마다 normal -6%, rare +5%, epic +1%. */
export function driftModuleTierWeights(weights = DEFAULT_MODULE_TIER_WEIGHTS) {
  return {
    normal: Math.max(0, weights.normal - 6),
    rare: Math.min(100, weights.rare + 5),
    epic: Math.min(100, weights.epic + 1),
  };
}

export function advanceTierWeightsAfterBattle(battlesSinceTierShift, moduleTierWeights, isBossVictory) {
  if (isBossVictory) {
    return { moduleTierWeights, battlesSinceTierShift };
  }

  let nextBattles = battlesSinceTierShift + 1;
  let nextWeights = moduleTierWeights;

  if (nextBattles >= TIER_SHIFT_INTERVAL) {
    nextWeights = driftModuleTierWeights(moduleTierWeights);
    nextBattles = 0;
  }

  return { moduleTierWeights: nextWeights, battlesSinceTierShift: nextBattles };
}

export function generateWeaponRewards(player, stage) {
  let upgrades = buildUpgradeOptions(player);
  let newWeapons = buildNewWeaponOptions(player, stage);
  const options = [];

  for (let i = 0; i < 3; i++) {
    const preferUpgrade = Math.random() < 0.3 && upgrades.length > 0;
    let pool;

    if (preferUpgrade) {
      pool = upgrades;
    } else if (newWeapons.length > 0) {
      pool = newWeapons;
    } else if (upgrades.length > 0) {
      pool = upgrades;
    } else {
      break;
    }

    const pick = shuffle(pool)[0];
    options.push(pick);

    if (pick.type === 'upgrade') {
      upgrades = upgrades.filter((o) => o.weaponId !== pick.weaponId);
    } else {
      newWeapons = newWeapons.filter((o) => o.weaponId !== pick.weaponId);
    }
  }

  return options;
}

export function applyWeaponReward(player, type, value, log) {
  if (type === 'upgrade') {
    const w = player.weapons.find((wp) => wp.id === value);
    if (w) {
      w.level++;
      log(`${WEAPONS_DB[value].name} LV.${w.level} 강화!`, 'system');
    }
    return { needsReplace: false };
  }

  if (player.weapons.length >= 2) {
    return { needsReplace: true, newWeapon: value };
  }

  player.weapons.push({ id: value.id, level: value.level });
  log(`새 무기 [${WEAPONS_DB[value.id].name}] LV.${value.level} 획득!`, 'system');
  return { needsReplace: false };
}

export function applyModuleReward(player, modId, log) {
  if (player.modules.length < 5) {
    player.modules.push(modId);
    log(`[${MODULES_DB[modId].name}] 획득!`, 'system');
    return { needsReplace: false };
  }
  if (player.inventoryModules.length < 5) {
    player.inventoryModules.push(modId);
    log(`[${MODULES_DB[modId].name}] 보관소 획득!`, 'system');
    return { needsReplace: false };
  }
  return { needsReplace: true, modId };
}
