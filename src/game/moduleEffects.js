import { drawCards, addToDiscard } from '../utils/deck';
import { WEAPONS_DB } from '../data/weapons';
import { MODULES_DB } from '../data/modules';

const SUITS = ['♠', '♥', '♦', '♣'];
const NUMBERS = [1, 2, 3, 4, 5, 'K'];

export function hasKeepSlotAccess(player) {
  return player.modules.includes('keep_slot') || player.modules.includes('fullhand_cache');
}

export function clearKeepSlotOnModuleRemove(player, modId) {
  if ((modId === 'keep_slot' || modId === 'fullhand_cache') && player.keepSlot) {
    addToDiscard(player, player.keepSlot);
    player.keepSlot = null;
  }
}

export function createRandomCard(overrides = {}) {
  return {
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
    num: NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
    id: crypto.randomUUID(),
    ...overrides,
  };
}

export function randomMorphCard(card) {
  card.suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  card.num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
}

/** Deck draws that ignore hand size cap — same as drawCards; call only after normal refill phase. */
export function drawCardsIgnoringHandCap(player, amount, onReshuffle) {
  return drawCards(player, amount, onReshuffle);
}

function healPlayer(player, amount, log, source) {
  if (amount <= 0) return;
  const before = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + amount);
  const healed = player.hp - before;
  if (healed > 0) log(`[${source}] ${healed} 체력 회복.`, 'heal');
}

export function onCardTransformed(player, enemies, log, sourceName) {
  if (player.modules.includes('morph_heal')) {
    healPlayer(player, 1, log, '변형 재생기');
  }
  if (player.modules.includes('morph_aoe') && enemies.length > 0) {
    enemies.forEach((enemy) => {
      if (enemy.hp > 0) enemy.hp -= 1;
    });
    log(`[변형 폭발기] 모든 적에게 1 피해!`, 'damage');
  }
  log(`[${sourceName}] 카드가 변형되었습니다.`, 'system');
}

export function morphRandomHandCard(player, enemies, log, sourceName) {
  if (player.hand.length === 0) return;
  const idx = Math.floor(Math.random() * player.hand.length);
  const card = player.hand[idx];
  randomMorphCard(card);
  onCardTransformed(player, enemies, log, sourceName);
}

export function applyEmptyHandDraws(player, log, enemies = []) {
  if (player.hand.length > 0) return;

  if (player.modules.includes('empty_hand_draw') && !player.combatState.emptyHandDrawUsedThisTurn) {
    player.combatState.emptyHandDrawUsedThisTurn = true;
    const { drawn } = drawCards(player, 3);
    player.hand.push(...drawn);
    log('[공허 드로우] 손패가 비어 3장을 드로우합니다. (턴당 1회)', 'system');
  }

  if (player.modules.includes('emergency_exit') && !player.combatState.emergencyUsed) {
    player.combatState.emergencyUsed = true;
    const { drawn } = drawCards(player, 3);
    player.hand.push(...drawn);
    log('[비상 탈출구] 패가 모두 소진되어 3장을 긴급 드로우합니다!', 'system');
  }
}

export function onDeckShuffled(player, log) {
  if (!player.modules.includes('shuffle_draw')) return;
  const { drawn } = drawCards(player, 1);
  player.hand.push(...drawn);
  log('[셔플 드로우] 덱을 섞으며 카드 1장을 드로우했습니다.', 'system');
}

export function applyCombatStartDrawBypass(player, log) {
  if (!player.modules.includes('combat_start_draw')) return;
  const { drawn } = drawCardsIgnoringHandCap(player, 1, () => onDeckShuffled(player, log));
  player.hand.push(...drawn);
  log('[전투 개시 드로우] 전투 시작! 카드 1장 추가 드로우 (손패 상한 무시).', 'system');
}

/** Turn counter and flags; effects that do not compete with 6-card refill timing. */
export function applyTurnStartModules(player, log) {
  player.combatState.turnCounter = (player.combatState.turnCounter || 0) + 1;
  player.combatState.attackedThisTurn = false;
  player.combatState.rerollUsedThisTurn = false;
  player.combatState.firstRerollFreeUsed = false;
  player.combatState.rerollDiscardCount = 0;
  player.combatState.handsCompletedThisTurn = 0;
  player.combatState.emptyHandDrawUsedThisTurn = false;
  player.combatState.oneWayReqConsumed = false;
  player.combatState.activeModulesUsed = {};

  if (player.modules.includes('turn_heal')) {
    healPlayer(player, 1, log, '턴 회복기');
  }

  if (player.combatState.saveProtocolBonus > 0) {
    player.rerolls += player.combatState.saveProtocolBonus;
    log(`[절약 프로토콜] 리롤권 +${player.combatState.saveProtocolBonus}.`, 'system');
    player.combatState.saveProtocolBonus = 0;
  }
}

/**
 * Draws / spawns after normal "fill to 6" — may exceed 6 cards in hand.
 */
export function applyTurnStartAfterHandRefill(player, log, enemies = []) {
  const onReshuffle = () => onDeckShuffled(player, log);

  if (player.combatState.minimalistHeart) {
    player.combatState.minimalistHeart = false;
    player.hand.push(createRandomCard({ suit: '♥', num: 3 }));
    log('[미니멀리스트] 6장 드로우 후 하트 3을 추가로 얻었습니다.', 'system');
  }

  if (player.combatState.pendingDelayDraw > 0) {
    const n = player.combatState.pendingDelayDraw;
    const { drawn } = drawCardsIgnoringHandCap(player, n, onReshuffle);
    player.hand.push(...drawn);
    log(`[지연 드로우] 예약된 카드 ${n}장 드로우 (손패 상한 무시).`, 'system');
    player.combatState.pendingDelayDraw = 0;
  }

  if (player.modules.includes('patience_draw') && !player.combatState.attackedLastTurn) {
    const { drawn } = drawCards(player, 1, onReshuffle);
    player.hand.push(...drawn);
    log('[인내의 시계] 지난 턴 공격하지 않아 카드 1장 추가 드로우.', 'system');
  }

  if (player.modules.includes('biennial_draw') && player.combatState.turnCounter % 2 === 0) {
    const { drawn } = drawCardsIgnoringHandCap(player, 1, onReshuffle);
    player.hand.push(...drawn);
    log('[격턴 드로우] 2턴마다 카드 1장 추가 드로우 (손패 상한 무시).', 'system');
  }

  if (player.modules.includes('biennial_suit_spawn') && player.combatState.turnCounter % 2 === 0) {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const card = createRandomCard({ suit, num: 3 });
    player.hand.push(card);
    log(`[문양 생성기] ${suit} 숫자 3 카드 1장 생성!`, 'system');
  }

  if (player.modules.includes('turn_morph')) {
    morphRandomHandCard(player, enemies, log, '일일 변형기');
  }
}

export function applyTurnEndModules(player, log) {
  if (player.modules.includes('save_protocol') && !player.combatState.rerollUsedThisTurn) {
    player.combatState.saveProtocolBonus = 2;
    log('[절약 프로토콜] 리롤을 아껴 다음 턴 리롤권 +2 예약.', 'system');
  }
  player.combatState.attackedLastTurn = player.combatState.attackedThisTurn;
}

function hasPairInCards(cards) {
  const counts = {};
  cards.forEach((c) => {
    counts[c.num] = (counts[c.num] || 0) + 1;
  });
  return Object.values(counts).some((v) => v >= 2);
}

function hasConsecutiveTwoPlus(cards) {
  const nums = cards.map((c) => (c.num === 'K' ? 6 : c.num)).sort((a, b) => a - b);
  const unique = [...new Set(nums)];
  if (unique.length < 2) return false;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === unique[i - 1] + 1) {
      run++;
      if (run >= 2) return true;
    } else {
      run = 1;
    }
  }
  return false;
}

export function applyRerollModules(player, discardedCards, enemies, log) {
  player.combatState.rerollUsedThisTurn = true;
  player.combatState.rerollDiscardCount += discardedCards.length;

  if (player.modules.includes('pair_refund') && hasPairInCards(discardedCards)) {
    if (Math.random() < 0.5) {
      player.rerolls++;
      log('[페어 환수 칩] 50% 성공! 리롤권 +1.', 'heal');
    }
  }

  if (
    player.modules.includes('straight_returner') &&
    hasConsecutiveTwoPlus(discardedCards) &&
    discardedCards.length > 0
  ) {
    const card = discardedCards[Math.floor(Math.random() * discardedCards.length)];
    player.deck.push(card);
    log('[스트레이트 반송기] 버린 카드 1장을 덱 맨 위로 돌려보냈습니다.', 'system');
  }

  if (player.modules.includes('bleed_crusher') && discardedCards.length >= 3 && enemies.length > 0) {
    const target = enemies[Math.floor(Math.random() * enemies.length)];
    if (target.hp > 0) {
      target.status.bleed = (target.status.bleed || 0) + 1;
      log(`[출혈 분쇄기] ${target.name}에게 출혈 1 부여.`, 'system');
    }
  }
}

export function applyPostRerollModules(player, log) {
  if (player.modules.includes('fullhand_cache') && player.hand.length >= 6) {
    const idx = Math.floor(Math.random() * player.hand.length);
    const card = player.hand.splice(idx, 1)[0];
    if (player.keepSlot) {
      addToDiscard(player, player.keepSlot);
    }
    player.keepSlot = card;
    log(`[풀핸드 캐시] ${card.suit}${card.num}을(를) 킵 슬롯에 보관.`, 'system');
  }
}

export function calcModuleDamageMultiplier(player, weaponId, submittedCards) {
  const wInfo = WEAPONS_DB[weaponId];
  let mult = 1;

  if (wInfo.reqType === 'triple' && player.modules.includes('triple_amp')) {
    mult *= 1.2;
  }
  if (wInfo.reqType === 'straight' && player.modules.includes('straight_amp')) {
    mult *= 1.2;
  }
  if (
    wInfo.reqType === 'triple' &&
    player.modules.includes('k_triple_amp') &&
    submittedCards.some((c) => c.num === 'K')
  ) {
    mult *= 1.5;
  }
  if (player.modules.includes('scrap_recycler') && player.combatState.rerollDiscardCount > 0) {
    mult *= 1 + 0.1 * player.combatState.rerollDiscardCount;
  }

  return mult;
}

export function calcModuleDamageBonus(player, weaponId) {
  const wInfo = WEAPONS_DB[weaponId];
  if (wInfo.reqType === 'flush' && player.modules.includes('flush_buff')) {
    return player.combatState.flushDamageBonus || 0;
  }
  return 0;
}

export function applyPostAttackModules(
  player,
  enemies,
  submittedCards,
  activeWeapons,
  log
) {
  player.combatState.attackedThisTurn = true;
  player.combatState.handsCompletedThisTurn += 1;

  if (player.modules.includes('mother') && submittedCards.some((c) => c.suit === '♥')) {
    healPlayer(player, 5, log, '어머니');
  }

  activeWeapons.forEach((w) => {
    const wInfo = WEAPONS_DB[w.id];
    if (wInfo.reqType === 'flush' && player.modules.includes('flush_buff')) {
      player.combatState.flushDamageBonus = (player.combatState.flushDamageBonus || 0) + 1;
      log('[플러시 축적기] 이번 전투 공격 피해 +1 누적.', 'system');
    }
    if (wInfo.reqType === 'straight' && player.modules.includes('straight_spawn')) {
      const card = createRandomCard();
      player.hand.push(card);
      log(`[스트레이트 생성기] ${card.suit}${card.num} 생성!`, 'system');
    }
  });

  if (player.modules.includes('attack_morph')) {
    morphRandomHandCard(player, enemies, log, '전투 변환기');
  }

  if (
    player.modules.includes('triple_combo') &&
    player.combatState.handsCompletedThisTurn === 3 &&
    enemies.length > 0
  ) {
    const alive = enemies.filter((e) => e.hp > 0);
    if (alive.length > 0) {
      const target = alive[Math.floor(Math.random() * alive.length)];
      target.hp -= 10;
      log(`[연속 족보 폭격] ${target.name}에게 10 피해!`, 'damage');
    }
  }

  applyEmptyHandDraws(player, log, enemies);
}

export function useCopyDiscard(player, cardIndex, log) {
  const card = player.hand[cardIndex];
  if (!card || player.hand.length <= 1) {
    log('[쌍둥이 칩] 손패 2장 이상 필요.', 'system');
    return false;
  }
  const otherIndices = player.hand.map((_, i) => i).filter((i) => i !== cardIndex);
  const discardIdx = otherIndices[Math.floor(Math.random() * otherIndices.length)];
  const discarded = player.hand.splice(discardIdx, 1)[0];
  const srcIdx = player.hand.findIndex((c) => c.id === card.id);
  const src = player.hand[srcIdx];
  player.hand.push({ ...src, id: crypto.randomUUID(), isClone: true });
  addToDiscard(player, discarded);
  player.combatState.activeModulesUsed.copy_discard = true;
  player.selectedCardIndices = [];
  log(`[쌍둥이 칩] ${src.suit}${src.num} 복사, ${discarded.suit}${discarded.num} 버림.`, 'system');
  return true;
}

export function useDelayDraw(player, log) {
  if (player.hand.length < 2) {
    log('[지연 드로우] 손패 2장 이상 필요.', 'system');
    return false;
  }
  const i1 = Math.floor(Math.random() * player.hand.length);
  let i2 = Math.floor(Math.random() * player.hand.length);
  while (i2 === i1) i2 = Math.floor(Math.random() * player.hand.length);
  const sorted = [i1, i2].sort((a, b) => b - a);
  const discarded = [];
  sorted.forEach((i) => discarded.push(player.hand.splice(i, 1)[0]));
  addToDiscard(player, discarded);
  player.combatState.pendingDelayDraw = 1;
  player.combatState.activeModulesUsed.delay_draw = true;
  player.selectedCardIndices = [];
  log('[지연 드로우] 무작위 카드 2장 버림. 다음 턴 1장 추가 드로우 예약.', 'system');
  return true;
}

export function useEmptyDeckRescue(player, log) {
  if (player.deck.length > 0) {
    log('[덱 비상 구조] 덱에 카드가 남아 있습니다.', 'system');
    return false;
  }
  const { drawn } = drawCards(player, 3);
  player.hand.push(...drawn);
  player.combatState.activeModulesUsed.empty_deck_rescue = true;
  log('[덱 비상 구조] 덱이 비어 3장 드로우!', 'system');
  return true;
}

export function useCombatDoubleDraw(player, log) {
  if (player.combatState.combatDrawUsed) {
    log('[전투 더블 드로우] 이미 이번 전투에서 사용했습니다.', 'system');
    return false;
  }
  const { drawn } = drawCards(player, 2);
  player.hand.push(...drawn);
  player.combatState.combatDrawUsed = true;
  player.combatState.activeModulesUsed.combat_double_draw = true;
  log('[전투 더블 드로우] 카드 2장 드로우!', 'system');
  return true;
}

export function useBloodDraw(player, log) {
  player.hp = Math.max(0, player.hp - 3);
  log('[피의 계약] 체력 3을 잃었습니다.', 'damage');
  const { drawn } = drawCards(player, 3, () => onDeckShuffled(player, log));
  player.hand.push(...drawn);
  player.combatState.activeModulesUsed.blood_draw = true;
  player.selectedCardIndices = [];
  log('[피의 계약] 카드 3장 드로우.', 'system');
  return true;
}

export function useSpadeThreeChip(player, cardIndex, enemies, log) {
  const card = player.hand[cardIndex];
  if (!card) return false;
  card.suit = '♠';
  card.num = 3;
  player.combatState.activeModulesUsed.spade_three_chip = true;
  player.selectedCardIndices = [];
  onCardTransformed(player, enemies, log, '스페이드 3 칩');
  return true;
}

export function useHeartAceChip(player, cardIndex, enemies, log) {
  const card = player.hand[cardIndex];
  if (!card) return false;
  card.suit = '♥';
  card.num = 1;
  player.combatState.activeModulesUsed.heart_ace_chip = true;
  player.selectedCardIndices = [];
  onCardTransformed(player, enemies, log, '하트 A 칩');
  return true;
}

export function useTransformWithMorphHooks(player, cardIndex, transformFn, enemies, log, moduleName) {
  const card = player.hand[cardIndex];
  if (!card) return false;
  transformFn(card);
  player.combatState.activeModulesUsed[moduleName] = true;
  player.selectedCardIndices = [];
  onCardTransformed(player, enemies, log, MODULES_DB[moduleName]?.name || moduleName);
  return true;
}

export { MODULES_DB };
