import { drawCards } from '../utils/deck';

export function applyPlayerTurnStart(player, log) {
  player.selectedCardIndices = [];
  player.combatState.firstFiveUsedThisTurn = false;

  let drawAmount = 6 - player.hand.length;

  if (player.combatState.drawPenalty > 0) {
    drawAmount = Math.min(drawAmount, player.combatState.drawPenalty);
    player.combatState.drawPenalty = 0;
    log('과부하 칩의 부작용으로 이번 턴 드로우가 제한됩니다.', 'system');
  }

  if (player.modules.includes('spade_loader')) {
    const sIdx = player.deck.findIndex((c) => c.suit === '♠');
    if (sIdx > -1) {
      player.hand.push(player.deck.splice(sIdx, 1)[0]);
      drawAmount--;
      log('[지정 칩] 덱에서 스페이드를 확정 드로우했습니다.', 'system');
    }
  }

  if (player.combatState.minimalistHeart) {
    player.combatState.minimalistHeart = false;
    player.hand.push({ suit: '♥', num: 3, id: 'min_heart' });
    drawAmount--;
    log('[미니멀리스트] 지난 턴 조건을 만족하여 하트 3을 얻었습니다.', 'system');
  }

  if (drawAmount > 0) {
    const { drawn, reshuffled } = drawCards(player, drawAmount);
    if (reshuffled) log('덱을 다시 섞습니다.', 'system');
    player.hand.push(...drawn);
  }

  player.rerolls = player.baseRerolls;
  if (player.combatState.overloadCooldown > 0) {
    player.combatState.overloadCooldown--;
  }

  if (player.modules.includes('holo_clone') && player.hand.length > 0) {
    const randomIdx = Math.floor(Math.random() * player.hand.length);
    const targetCard = player.hand[randomIdx];
    player.hand.push({
      ...targetCard,
      id: `${targetCard.id}_clone`,
      isClone: true,
    });
    log(`[홀로그램 복제기] ${targetCard.suit}${targetCard.num} 카드를 임시 복제했습니다.`, 'system');
  }
}

export function applyEndTurnCleanup(player) {
  player.selectedCardIndices = [];
  player.hand = player.hand.filter((c) => !c.isClone);

  if (player.modules.includes('minimalist') && player.hand.length < 3) {
    player.combatState.minimalistHeart = true;
  }
}
