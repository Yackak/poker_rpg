import { useCallback } from 'react';
import { createCombatState, GAME_STATES, spawnEnemies } from './gameEngine';
import { generateDeck } from '../utils/deck';
import { applyPlayerTurnStart } from '../game/playerTurn';
import { createPlayer } from '../game/constants';

export function useStartActions(setPlayer, setMeta, log, clearLogs) {
  const startStage = useCallback(
    (stageNum) => {
      const enemies = spawnEnemies(stageNum);
      setMeta((m) => ({
        ...m,
        stage: stageNum,
        enemies,
        selectedEnemyIndex: 0,
        weaponBonusEarned: false,
        rewardPhase: 'module',
        moduleRewardOptions: [],
        weaponRewardOptions: [],
        gameState: GAME_STATES.PLAYER_TURN,
        modal: null,
      }));
      log(`=== 스테이지 ${stageNum} 시작 ===`, 'system');
      setPlayer((p) => {
        const copy = structuredClone({ ...p, combatState: createCombatState() });
        applyPlayerTurnStart(copy, log, enemies, true);
        return copy;
      });
    },
    [log, setMeta, setPlayer]
  );

  const initGame = useCallback(() => {
    clearLogs();
    setPlayer(createPlayer({ deck: generateDeck() }));
    setMeta({
      stage: 1,
      gameState: GAME_STATES.START,
      enemies: [],
      selectedEnemyIndex: 0,
      weaponBonusEarned: false,
      rewardPhase: 'module',
      moduleRewardOptions: [],
      weaponRewardOptions: [],
      startStep: 'weapon',
      modal: 'start',
      rewardOptions: [],
      choiceContext: null,
      pendingNewWeapon: null,
      pendingNewModule: null,
      shake: false,
    });
  }, [clearLogs, setMeta, setPlayer]);

  const selectStartWeapon = useCallback(
    (wId, weaponName) => {
      setPlayer((p) => ({ ...p, weapons: [{ id: wId, level: 1 }] }));
      log(`[${weaponName}]을(를) 선택했습니다.`, 'system');
      setMeta((m) => ({ ...m, startStep: 'module' }));
    },
    [log, setMeta, setPlayer]
  );

  const selectStartModule = useCallback(
    (modId, modName, startStageFn) => {
      setPlayer((p) => ({ ...p, modules: [modId] }));
      log(`${modName} 모듈 장착.`, 'system');
      setMeta((m) => ({ ...m, modal: null }));
      startStageFn(1);
    },
    [log, setMeta, setPlayer]
  );

  return { initGame, startStage, selectStartWeapon, selectStartModule };
};
