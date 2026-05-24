import { shuffle } from '../utils/shuffle';
import { WEAPONS_DB, getReqLabel } from '../data/weapons';
import { MODULES_DB } from '../data/modules';
import { DEFAULT_MODULE_TIER_WEIGHTS } from './constants';

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
 * Stage clear (= 보스 처치) 시 legend 풀. 일반 전투 보상 추가 시 `{ isBossVictory: false }` 와 등급 확률을 연동.
 */
export function buildVictoryRewards(
  player,
  stage,
  weaponBonus = false,
  moduleRewardOpts = { isBossVictory: true }
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

export function generateModuleRewards(player, opts = {}) {
  const isBossVictory = opts.isBossVictory !== false;

  let pool = Object.values(MODULES_DB).filter(
    (m) => !player.modules.includes(m.id) && !player.inventoryModules.includes(m.id)
  );

  if (isBossVictory) {
    pool = pool.filter((m) => m.rarity === 'legend');
  }

  return shuffle([...pool]).slice(0, 3);
}

/** 매 3전투마다 호출하면 될 드리프트 (추후 일반 전투 보상 연동용). normal -6%, rare +5%, epic +1%. */
export function driftModuleTierWeights(weights = DEFAULT_MODULE_TIER_WEIGHTS) {
  const next = {
    normal: Math.max(0, weights.normal - 6),
    rare: Math.min(100, weights.rare + 5),
    epic: Math.min(100, weights.epic + 1),
  };
  return next;
}

/**
 * 일반 전투 보상용 등급 굴림 스텁. 추후 확률/드리프트를 연결하세요.
 * @returns {'normal' | 'rare' | 'epic'}
 */
export function rollModuleTier(_weights = DEFAULT_MODULE_TIER_WEIGHTS) {
  return 'normal';
}

/** 일반 전투에서 선택지 3개 뽑기 스텁 (등급 풀·드리프트 연동 예정). */
export function generateNormalFightModuleRewards(_player, _weights = DEFAULT_MODULE_TIER_WEIGHTS) {
  return [];
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
