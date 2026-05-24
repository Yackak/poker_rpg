import { useCallback } from 'react';
import { createCombatState, GAME_STATES, spawnEnemies } from './gameEngine';
import { generateDeck } from '../utils/deck';
import { applyPlayerTurnStart } from '../game/playerTurn';
import { createPlayer, DEFAULT_MODULE_TIER_WEIGHTS } from '../game/constants';
import { isBossRound } from '../game/spawnEnemies';
import { generateStartModuleOptions } from '../game/rewardLogic';

export function useStartActions(setPlayer, setMeta, log, clearLogs) {
  const startRound = useCallback(
    (stageNum, roundNum) => {
      const enemies = spawnEnemies(stageNum, roundNum);
      const boss = isBossRound(roundNum);
      setMeta((m) => ({
        ...m,
        stage: stageNum,
        round: roundNum,
        enemies,
        selectedEnemyIndex: 0,
        weaponBonusEarned: false,
        rewardPhase: 'module',
        moduleRewardOptions: [],
        weaponRewardOptions: [],
        gameState: GAME_STATES.PLAYER_TURN,
        modal: null,
      }));
      const roundLabel = boss ? '최종 보스' : `라운드 ${roundNum}`;
      log(`=== 스테이지 ${stageNum} · ${roundLabel} ===`, 'system');
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
      round: 1,
      gameState: GAME_STATES.START,
      enemies: [],
      selectedEnemyIndex: 0,
      weaponBonusEarned: false,
      rewardPhase: 'module',
      moduleRewardOptions: [],
      weaponRewardOptions: [],
      startStep: 'weapon',
      startModuleOptions: [],
      modal: 'start',
      rewardOptions: [],
      choiceContext: null,
      pendingNewWeapon: null,
      pendingNewModule: null,
      shake: false,
      battlesSinceTierShift: 0,
      moduleTierWeights: { ...DEFAULT_MODULE_TIER_WEIGHTS },
      isBossVictory: false,
    });
  }, [clearLogs, setMeta, setPlayer]);

  const selectStartWeapon = useCallback(
    (wId, weaponName) => {
      setPlayer((p) => ({ ...p, weapons: [{ id: wId, level: 1 }] }));
      log(`[${weaponName}]을(를) 선택했습니다.`, 'system');
      const startModuleOptions = generateStartModuleOptions();
      setMeta((m) => ({ ...m, startStep: 'module', startModuleOptions }));
    },
    [log, setMeta, setPlayer]
  );

  const selectStartModule = useCallback(
    (modId, modName, startRoundFn) => {
      setPlayer((p) => ({ ...p, modules: [modId] }));
      log(`${modName} 모듈 장착.`, 'system');
      setMeta((m) => ({ ...m, modal: null }));
      startRoundFn(1, 1);
    },
    [log, setMeta, setPlayer]
  );

  return { initGame, startRound, selectStartWeapon, selectStartModule };
};
