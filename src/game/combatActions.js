import { drawCards } from '../utils/deck';
import { WEAPONS_DB } from '../data/weapons';

export function executeReroll(player, log) {
  if (player.rerolls <= 0 || player.selectedCardIndices.length === 0) return false;

  if (player.modules.includes('one_way') && player.selectedCardIndices.length > 1) {
    log('[외길 인생] 리롤은 최대 1장만 선택 가능합니다.', 'system');
    return false;
  }

  player.rerolls--;

  if (player.modules.includes('reroll_battery') && Math.random() < 0.5) {
    player.rerolls++;
    log('[리롤 배터리] 리롤권을 돌려받았습니다!', 'heal');
  }

  const sortedIdx = player.selectedCardIndices
    .filter((i) => i !== 'keep')
    .sort((a, b) => b - a);
  const discardedCards = [];
  sortedIdx.forEach((i) => discardedCards.push(player.hand.splice(i, 1)[0]));

  const keepSelected = player.selectedCardIndices.includes('keep');
  if (keepSelected && player.keepSlot) {
    discardedCards.push(player.keepSlot);
    player.keepSlot = null;
  }

  player.deck.unshift(...discardedCards);
  const { drawn } = drawCards(player, discardedCards.length);

  drawn.forEach((c) => {
    if (keepSelected && !player.keepSlot) player.keepSlot = c;
    else player.hand.push(c);
  });

  player.selectedCardIndices = [];
  log(`${discardedCards.length}장 리롤 완료.`, 'system');
  return true;
}

export function discardSelectedCards(player) {
  const sortedIdx = player.selectedCardIndices
    .filter((i) => i !== 'keep')
    .sort((a, b) => b - a);
  sortedIdx.forEach((i) => player.discard.push(player.hand.splice(i, 1)[0]));
  if (player.selectedCardIndices.includes('keep') && player.keepSlot) {
    player.discard.push(player.keepSlot);
    player.keepSlot = null;
  }
  player.selectedCardIndices = [];
}

export function applyEmergencyExit(player, log) {
  if (
    player.hand.length === 0 &&
    player.modules.includes('emergency_exit') &&
    !player.combatState.emergencyUsed
  ) {
    player.combatState.emergencyUsed = true;
    const { drawn } = drawCards(player, 3);
    player.hand.push(...drawn);
    log('[비상 탈출구] 패가 모두 소진되어 3장을 긴급 드로우합니다!', 'system');
  }
}

export function applyEngineDraw(player, cards, log) {
  let spadeCount = 0;
  let kCount = 0;

  cards.forEach((c) => {
    if (c.suit === '♠') spadeCount++;
    let effectiveNum = c.num;
    if (
      player.modules.includes('kings_decree') &&
      player.combatState.firstFiveUsedThisTurn &&
      effectiveNum === 5
    ) {
      effectiveNum = 'K';
    }
    if (effectiveNum === 'K') kCount++;
  });

  const engineDraws = spadeCount + kCount;
  if (engineDraws > 0) {
    log(`엔진 가동! ♠(${spadeCount}) K(${kCount}) -> ${engineDraws}장 드로우`, 'system');
    const { drawn } = drawCards(player, engineDraws);
    player.hand.push(...drawn);
  }
}

export function applyWeaponEffects(weapon, w, target, actualDmg, player, log) {
  if (w.level < 2) return { isCrit: false };

  let isCrit = false;
  if (w.id === 'thorn' && Math.random() * 100 <= (w.level - 1) * 10) {
    isCrit = true;
  }

  if (weapon.id === 'greatsword') {
    target.status.bleed = (target.status.bleed || 0) + (w.level - 1);
    log(`${target.name} 출혈 ${w.level - 1} 부여.`, 'system');
  }
  if (weapon.id === 'eclipse') {
    target.status.burn = (target.status.burn || 0) + (w.level - 1);
    log(`${target.name} 화상 ${w.level - 1} 부여.`, 'system');
  }
  if (weapon.id === 'club') {
    const chance = 10 + (w.level - 2) * 15;
    if (Math.random() * 100 <= chance) {
      target.status.stun = true;
      log(`${target.name} 기절!`, 'heal');
    }
  }
  if (weapon.id === 'axe') {
    const heal = Math.floor((actualDmg * (15 + (w.level - 2) * 5)) / 100);
    if (heal > 0) {
      player.hp = Math.min(player.maxHp, player.hp + heal);
      log(`${heal} 체력 회복.`, 'heal');
    }
  }

  return { isCrit };
}

export function calcWeaponDamage(w) {
  const wInfo = WEAPONS_DB[w.id];
  let dmg = wInfo.baseDmg + (w.level - 1) * 2;
  let isCrit = false;
  if (w.id === 'thorn' && w.level >= 2 && Math.random() * 100 <= (w.level - 1) * 10) {
    dmg *= 2;
    isCrit = true;
  }
  return { dmg, isCrit, wInfo };
}
