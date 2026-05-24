import { drawCards, addToDiscard } from '../utils/deck';
import { getSelectedCards } from '../utils/pokerHands';
import { WEAPONS_DB } from '../data/weapons';
import {
  applyRerollModules,
  applyPostRerollModules,
  applyEmptyHandDraws,
  onDeckShuffled,
  calcModuleDamageMultiplier,
  calcModuleDamageBonus,
} from './moduleEffects';

function drawWithModules(player, amount, log) {
  return drawCards(player, amount, () => onDeckShuffled(player, log));
}

export function executeReroll(player, enemies, log) {
  if (player.rerolls <= 0 || player.selectedCardIndices.length === 0) return false;

  if (player.modules.includes('one_way') && player.selectedCardIndices.length > 1) {
    log('[외길 인생] 리롤은 최대 1장만 선택 가능합니다.', 'system');
    return false;
  }

  const isFreeReroll =
    player.modules.includes('free_first_reroll') &&
    !player.combatState.firstRerollFreeUsed;

  if (!isFreeReroll) {
    player.rerolls--;
  } else {
    player.combatState.firstRerollFreeUsed = true;
    log('[첫 리롤 면제권] 첫 리롤은 무료입니다!', 'system');
  }

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

  applyRerollModules(player, discardedCards, enemies, log);

  player.deck.unshift(...discardedCards);
  const { drawn } = drawWithModules(player, discardedCards.length, log);

  drawn.forEach((c) => {
    if (keepSelected && !player.keepSlot) player.keepSlot = c;
    else player.hand.push(c);
  });

  applyPostRerollModules(player, log);

  player.selectedCardIndices = [];
  log(`${discardedCards.length}장 리롤 완료.`, 'system');
  applyEmptyHandDraws(player, log, enemies);
  return true;
}

export function getCardShieldValue(card, player) {
  let num = card.num;
  if (
    player.modules.includes('kings_decree') &&
    !player.combatState.firstFiveUsedThisTurn &&
    num === 5
  ) {
    num = 'K';
  }
  return num === 'K' ? 10 : num;
}

export function calcShieldFromCards(cards, player) {
  return cards.reduce((sum, card) => sum + getCardShieldValue(card, player), 0);
}

export function executeDefend(player, log, enemies = []) {
  const cards = getSelectedCards(player);
  if (cards.length === 0) return false;

  const hasKingsDecreeFive =
    player.modules.includes('kings_decree') &&
    !player.combatState.firstFiveUsedThisTurn &&
    cards.some((c) => c.num === 5);

  const shieldGain = calcShieldFromCards(cards, player);

  if (hasKingsDecreeFive) {
    log('[왕의 칙령] 제출된 5가 K로 취급됩니다!', 'system');
    player.combatState.firstFiveUsedThisTurn = true;
  }

  discardSelectedCards(player);
  player.shield = (player.shield || 0) + shieldGain;
  log(`방어! ${shieldGain} 쉴드 획득 (총 ${player.shield})`, 'heal');
  applyEmergencyExit(player, log, enemies);
  return true;
}

export function discardSelectedCards(player) {
  const sortedIdx = player.selectedCardIndices
    .filter((i) => i !== 'keep')
    .sort((a, b) => b - a);
  const discarded = [];
  sortedIdx.forEach((i) => discarded.push(player.hand.splice(i, 1)[0]));
  if (player.selectedCardIndices.includes('keep') && player.keepSlot) {
    discarded.push(player.keepSlot);
    player.keepSlot = null;
  }
  addToDiscard(player, discarded);
  player.selectedCardIndices = [];
}

export function applyEmergencyExit(player, log, enemies = []) {
  applyEmptyHandDraws(player, log, enemies);
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
    const { drawn } = drawWithModules(player, engineDraws, log);
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

export function calcWeaponDamage(w, player, submittedCards) {
  const wInfo = WEAPONS_DB[w.id];
  let dmg = wInfo.baseDmg + (w.level - 1) * 2;

  if (player) {
    const mult = calcModuleDamageMultiplier(player, w.id, submittedCards || []);
    const bonus = calcModuleDamageBonus(player, w.id);
    dmg = Math.floor(dmg * mult) + bonus;
  }

  let isCrit = false;
  if (w.id === 'thorn' && w.level >= 2 && Math.random() * 100 <= (w.level - 1) * 10) {
    dmg *= 2;
    isCrit = true;
  }
  return { dmg, isCrit, wInfo };
}
