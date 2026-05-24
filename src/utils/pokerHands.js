import { WEAPONS_DB } from '../data/weapons';

export function checkHandRequirement(mappedCards, reqType, reqCount) {
  if (mappedCards.length < reqCount) return false;

  if (reqType === 'triple') {
    const counts = {};
    mappedCards.forEach((c) => {
      counts[c.num] = (counts[c.num] || 0) + 1;
    });
    return Object.values(counts).some((v) => v >= reqCount);
  }

  if (reqType === 'pair') {
    const counts = {};
    mappedCards.forEach((c) => {
      counts[c.num] = (counts[c.num] || 0) + 1;
    });
    return Object.values(counts).filter((v) => v >= 2).length >= reqCount;
  }

  if (reqType === 'flush') {
    const counts = {};
    mappedCards.forEach((c) => {
      counts[c.suit] = (counts[c.suit] || 0) + 1;
    });
    return Object.values(counts).some((v) => v >= reqCount);
  }

  if (reqType === 'straight') {
    const nums = mappedCards.map((c) => (c.num === 'K' ? 6 : c.num)).sort((a, b) => a - b);
    const uniqueNums = [...new Set(nums)];
    if (uniqueNums.length < reqCount) return false;
    let maxConsecutive = 1;
    let current = 1;
    for (let i = 1; i < uniqueNums.length; i++) {
      if (uniqueNums[i] === uniqueNums[i - 1] + 1) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 1;
      }
    }
    return maxConsecutive >= reqCount;
  }

  return false;
}

export function isWeaponActive(weapon, selectedCards, modules, combatState) {
  if (selectedCards.length === 0) return false;

  const wInfo = WEAPONS_DB[weapon.id];
  if (!wInfo) return false;

  let reqCount = wInfo.reqCount;
  if (modules.includes('one_way') && !combatState.oneWayReqConsumed) {
    reqCount = Math.max(1, reqCount - 1);
  }

  return checkHandRequirement(selectedCards, wInfo.reqType, reqCount);
}

export function getSelectedCards(player) {
  const cards = player.selectedCardIndices
    .filter((i) => i !== 'keep')
    .map((i) => player.hand[i]);
  if (player.selectedCardIndices.includes('keep') && player.keepSlot) {
    cards.push(player.keepSlot);
  }
  return cards;
}
