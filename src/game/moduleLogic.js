export function useJokerChip(player, cardIndex, suit, log) {
  if (!['♠', '♥', '♦', '♣'].includes(suit)) return false;
  player.hand[cardIndex].suit = suit;
  player.combatState.activeModulesUsed.joker_chip = true;
  player.selectedCardIndices = [];
  log(`문양이 ${suit}로 변경되었습니다.`, 'system');
  return true;
}

export function useTuning(player, cardIndex, increase, log) {
  const card = player.hand[cardIndex];
  if (card.num === 'K') {
    log('K는 조율할 수 없습니다.', 'system');
    return false;
  }
  card.num = increase ? Math.min(5, card.num + 1) : Math.max(1, card.num - 1);
  player.combatState.activeModulesUsed.tuning = true;
  player.selectedCardIndices = [];
  log(`숫자가 ${card.num}으로 조율되었습니다.`, 'system');
  return true;
}

export function useOverloadChip(player, log) {
  player.rerolls++;
  player.combatState.drawPenalty = 5;
  player.combatState.overloadCooldown = 2;
  player.combatState.activeModulesUsed.overload_chip = true;
  log('과부하 칩 가동! 리롤+1 (다음 턴 드로우 제한)', 'system');
  return true;
}

export function swapModuleToInventory(player, modId, index) {
  if (player.inventoryModules.length >= 5) return false;
  if (modId === 'keep_slot' && player.keepSlot) {
    player.discard.push(player.keepSlot);
    player.keepSlot = null;
  }
  player.modules.splice(index, 1);
  player.inventoryModules.push(modId);
  return true;
}

export function swapModuleToEquipped(player, index) {
  if (player.modules.length >= 5) return false;
  player.modules.push(player.inventoryModules.splice(index, 1)[0]);
  return true;
}

export function replaceModule(player, item, newModId, log) {
  if (item.type === 'equipped') {
    if (item.id === 'keep_slot' && player.keepSlot) {
      player.discard.push(player.keepSlot);
      player.keepSlot = null;
    }
    player.modules.splice(item.index, 1);
    player.inventoryModules.push(newModId);
  } else {
    player.inventoryModules.splice(item.index, 1);
    player.inventoryModules.push(newModId);
  }
  log('모듈 교체 완료.', 'system');
}
