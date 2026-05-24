import { shuffle } from '../utils/shuffle';
import { WEAPONS_DB } from '../data/weapons';
import { MODULES_DB } from '../data/modules';

export function generateModuleRewards(player) {
  const unowned = Object.values(MODULES_DB).filter(
    (m) => !player.modules.includes(m.id) && !player.inventoryModules.includes(m.id)
  );
  return shuffle([...unowned]).slice(0, 3);
}

export function generateWeaponRewards(player, stage) {
  const options = [];

  for (let i = 0; i < 3; i++) {
    const isUpgrade = Math.random() < 0.3;

    if (isUpgrade && player.weapons.some((w) => w.level < 6)) {
      const upWpn = shuffle(player.weapons.filter((w) => w.level < 6))[0];
      options.push({
        type: 'upgrade',
        weaponId: upWpn.id,
        label: '무기 강화',
        title: `${WEAPONS_DB[upWpn.id].name} LV.${upWpn.level} ▶ LV.${upWpn.level + 1}`,
        desc: WEAPONS_DB[upWpn.id].effectDesc(upWpn.level + 1),
      });
    } else {
      const newWpnLvl = Math.ceil(stage / 4);
      const unowned = Object.keys(WEAPONS_DB).filter(
        (id) => !player.weapons.some((w) => w.id === id)
      );
      if (unowned.length === 0) continue;
      const newWpnId = shuffle(unowned)[0];
      const wInfo = WEAPONS_DB[newWpnId];
      options.push({
        type: 'new_weapon',
        weaponId: newWpnId,
        level: newWpnLvl,
        label: '새로운 무기',
        title: `${wInfo.name} LV.${newWpnLvl}`,
        desc: `[ ${wInfo.reqCount}${wInfo.reqType === 'straight' ? '스트레이트' : wInfo.reqType === 'flush' ? '플러시' : '트리플'} ]`,
      });
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
