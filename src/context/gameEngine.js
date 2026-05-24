import { generateDeck } from '../utils/deck';
import { getSelectedCards, isWeaponActive } from '../utils/pokerHands';
import { WEAPONS_DB } from '../data/weapons';
import { MODULES_DB } from '../data/modules';
import { createCombatState, createPlayer, GAME_STATES, MAX_STAGE } from '../game/constants';
import { spawnEnemies } from '../game/spawnEnemies';
import { applyPlayerTurnStart, applyEndTurnCleanup } from '../game/playerTurn';
import {
  executeReroll,
  discardSelectedCards,
  applyEmergencyExit,
  applyEngineDraw,
  calcWeaponDamage,
} from '../game/combatActions';
import { processSingleEnemyTurn, handleEnemyDeath } from '../game/enemyTurn';
import {
  generateModuleRewards,
  generateWeaponRewards,
  applyWeaponReward,
  applyModuleReward,
} from '../game/rewardLogic';
import { replaceModule, swapModuleToEquipped, swapModuleToInventory } from '../game/moduleLogic';
import { useJokerChip, useTuning, useOverloadChip } from '../game/moduleLogic';

export function createInitialMeta() {
  return {
    stage: 1,
    gameState: GAME_STATES.START,
    enemies: [],
    moduleDropEarned: false,
    startStep: 'weapon',
    modal: 'start',
    rewardOptions: [],
    choiceContext: null,
    pendingNewWeapon: null,
    pendingNewModule: null,
    shake: false,
  };
}

export function buildAttackResult(player, enemies, log, showFloat) {
  const selected = getSelectedCards(player);
  const activeWeapons = player.weapons.filter((w) =>
    isWeaponActive(w, selected, player.modules, player.combatState)
  );

  if (activeWeapons.length === 0) {
    log('조건을 만족하는 무기가 없습니다!', 'system');
    return null;
  }

  if (
    player.modules.includes('kings_decree') &&
    !player.combatState.firstFiveUsedThisTurn &&
    selected.some((c) => c.num === 5)
  ) {
    log('[왕의 칙령] 제출된 5가 K로 취급됩니다!', 'system');
    player.combatState.firstFiveUsedThisTurn = true;
  }

  const submitted = [...selected];
  discardSelectedCards(player);

  const target = enemies[0];
  const hits = [];

  activeWeapons.forEach((w) => {
    if (!target || target.hp <= 0) return;
    const { dmg, isCrit, wInfo } = calcWeaponDamage(w);
    const actualDmg = Math.max(1, dmg - target.armor);
    target.hp -= actualDmg;
    hits.push({ wInfo, actualDmg, isCrit });

    if (w.level >= 2) {
      if (w.id === 'greatsword') {
        target.status.bleed = (target.status.bleed || 0) + (w.level - 1);
        log(`${target.name} 출혈 ${w.level - 1} 부여.`, 'system');
      }
      if (w.id === 'eclipse') {
        target.status.burn = (target.status.burn || 0) + (w.level - 1);
        log(`${target.name} 화상 ${w.level - 1} 부여.`, 'system');
      }
      if (w.id === 'club') {
        const chance = 10 + (w.level - 2) * 15;
        if (Math.random() * 100 <= chance) {
          target.status.stun = true;
          log(`${target.name} 기절!`, 'heal');
        }
      }
      if (w.id === 'axe') {
        const heal = Math.floor((actualDmg * (15 + (w.level - 2) * 5)) / 100);
        if (heal > 0) {
          player.hp = Math.min(player.maxHp, player.hp + heal);
          log(`${heal} 체력 회복.`, 'heal');
        }
      }
    }
  });

  hits.forEach(({ wInfo, actualDmg, isCrit }) => {
    const critText = isCrit ? ' 치명타!' : '';
    log(`${wInfo.name} 공격! ${target.name}에게 ${actualDmg} 피해.${critText}`, 'damage');
    showFloat(`-${actualDmg}`, isCrit ? '#facc15' : '#ef4444');
  });

  applyEmergencyExit(player, log);
  applyEngineDraw(player, submitted, log);

  return { targetDead: target && target.hp <= 0 };
}

export function processEnemyQueue(enemies, player, log, showFloat, onDone) {
  let index = 0;

  const next = () => {
    if (index >= enemies.length) {
      onDone();
      return;
    }

    const enemy = enemies[index];
    const result = processSingleEnemyTurn(enemy, player, log);

    if (result.events.some((e) => e.type === 'burn')) {
      showFloat(`-${result.events.find((e) => e.type === 'burn').damage}`, '#f97316');
    }
    if (result.events.some((e) => e.type === 'attack')) {
      onDone({ shake: true, gameOver: player.hp <= 0 });
      if (player.hp <= 0) return;
    }

    if (result.died) {
      onDone({ enemyDied: true, index });
      return;
    }

    index += 1;
    setTimeout(next, 800);
  };

  setTimeout(next, 500);
}

export {
  generateDeck,
  createPlayer,
  createCombatState,
  spawnEnemies,
  applyPlayerTurnStart,
  applyEndTurnCleanup,
  executeReroll,
  getSelectedCards,
  isWeaponActive,
  WEAPONS_DB,
  MODULES_DB,
  GAME_STATES,
  MAX_STAGE,
  generateModuleRewards,
  generateWeaponRewards,
  applyWeaponReward,
  applyModuleReward,
  handleEnemyDeath,
  replaceModule,
  swapModuleToEquipped,
  swapModuleToInventory,
  useJokerChip,
  useTuning,
  useOverloadChip,
};
