import { shuffle } from '../utils/shuffle';
import { WEAPONS_DB, getReqLabel } from '../data/weapons';
import { MODULES_DB } from '../data/modules';

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

export function generateModuleRewards(player) {
  const unowned = Object.values(MODULES_DB).filter(
    (m) => !player.modules.includes(m.id) && !player.inventoryModules.includes(m.id)
  );
  return shuffle([...unowned]).slice(0, 3);
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
    if (w) w.level++;
    log(`${WEAPONS_DB[value].name} LV.${w.level} 강화!`, 'system');
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
