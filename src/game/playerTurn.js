import { drawCards } from '../utils/deck';
import {
  applyTurnStartModules,
  applyTurnEndModules,
  applyTurnStartAfterHandRefill,
  applyCombatStartDrawBypass,
  onDeckShuffled,
  createRandomCard,
} from './moduleEffects';

function drawWithModules(player, amount, log) {
  const onReshuffle = () => onDeckShuffled(player, log);
  return drawCards(player, amount, onReshuffle);
}

export function applyPlayerTurnStart(player, log, enemies = [], isCombatStart = false) {
  player.selectedCardIndices = [];
  player.shield = 0;
  player.combatState.cardsUsedThisTurn = [];

  applyTurnStartModules(player, log);

  let drawAmount = 6 - player.hand.length;

  if (player.combatState.drawPenalty > 0) {
    drawAmount = Math.min(drawAmount, player.combatState.drawPenalty);
    player.combatState.drawPenalty = 0;
    log('과부하 칩의 부작용으로 이번 턴 드로우가 제한됩니다.', 'system');
  }

  if (player.modules.includes('spade_loader')) {
    player.hand.push(createRandomCard({ suit: '♠' }));
    drawAmount--;
    log('[지정칩] 스페이드 1장을 생성하여 손패에 더했습니다.', 'system');
  }

  drawAmount = Math.max(0, drawAmount);

  if (drawAmount > 0) {
    const { drawn, reshuffled } = drawWithModules(player, drawAmount, log);
    if (reshuffled) log('덱을 다시 섞습니다.', 'system');
    player.hand.push(...drawn);
  }

  player.rerolls = player.baseRerolls;
  if (player.combatState.overloadCooldown > 0) {
    player.combatState.overloadCooldown--;
  }

  applyTurnStartAfterHandRefill(player, log, enemies);

  if (isCombatStart) {
    applyCombatStartDrawBypass(player, log);
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

export function applyEndTurnCleanup(player, log) {
  player.selectedCardIndices = [];
  player.hand = player.hand.filter((c) => !c.isClone);

  if (player.modules.includes('minimalist') && player.hand.length < 3) {
    player.combatState.minimalistHeart = true;
  }

  applyTurnEndModules(player, log);
}
