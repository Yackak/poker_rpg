import { useCallback, useMemo, useRef, useState } from 'react';
import { GameContext } from './GameContext';
import { useCombatLog } from '../hooks/useCombatLog';
import { useFloatText } from '../hooks/useFloatText';
import { createInitialMeta } from './gameEngine';
import { createPlayer } from '../game/constants';
import { generateDeck } from '../utils/deck';
import { useStartActions } from './useStartActions';
import { useCombatHandlers } from './useCombatHandlers';
import { useRewardHandlers } from './useRewardHandlers';
import {
  useJokerChip,
  useTuning,
  useOverloadChip,
  useCopyDiscard,
  useDelayDraw,
  useEmptyDeckRescue,
  useCombatDoubleDraw,
  useSpadeThreeChip,
  useHeartAceChip,
} from '../game/moduleLogic';
import { GAME_STATES } from '../game/constants';

export function GameProvider({ children }) {
  const { logs, log, clearLogs } = useCombatLog();
  const { floats, showFloatText } = useFloatText();
  const [player, setPlayer] = useState(() => createPlayer({ deck: generateDeck() }));
  const [meta, setMeta] = useState(createInitialMeta);
  const stateRef = useRef({ player, meta });
  stateRef.current = { player, meta };

  const getState = useCallback(() => stateRef.current, []);

  const showFloatAtEnemy = useCallback(
    (text, color, enemyIndex = 0) => {
      const el = document.getElementById(`enemy-${enemyIndex}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        showFloatText(
          text,
          rect.left + rect.width / 2 - 20,
          rect.top + rect.height / 2 - 20,
          color
        );
      } else {
        showFloatText(text, window.innerWidth / 2 - 20, 80, color);
      }
    },
    [showFloatText]
  );

  const { initGame, startStage, selectStartWeapon, selectStartModule } = useStartActions(
    setPlayer,
    setMeta,
    log,
    clearLogs
  );

  const rewardHandlers = useRewardHandlers(player, meta, setPlayer, setMeta, log, startStage);

  const combat = useCombatHandlers(
    setPlayer,
    setMeta,
    log,
    showFloatAtEnemy,
    rewardHandlers.openVictory,
    getState
  );

  const useActiveModule = useCallback(
    (modId, payload) => {
      if (meta.gameState !== GAME_STATES.PLAYER_TURN) return;
      const enemies = stateRef.current.meta.enemies;
      setPlayer((p) => {
        const copy = structuredClone(p);
        if (copy.combatState.activeModulesUsed[modId]) return p;

        if (modId === 'joker_chip') {
          useJokerChip(copy, payload.cardIndex, payload.suit, log, enemies);
        } else if (modId === 'tuning') {
          useTuning(copy, payload.cardIndex, payload.increase, log, enemies);
        } else if (modId === 'overload_chip') {
          useOverloadChip(copy, log);
        } else if (modId === 'copy_discard') {
          useCopyDiscard(copy, payload.cardIndex, log);
        } else if (modId === 'delay_draw') {
          useDelayDraw(copy, payload.cardIndices, log);
        } else if (modId === 'empty_deck_rescue') {
          useEmptyDeckRescue(copy, log);
        } else if (modId === 'combat_double_draw') {
          useCombatDoubleDraw(copy, log);
        } else if (modId === 'spade_three_chip') {
          useSpadeThreeChip(copy, payload.cardIndex, enemies, log);
        } else if (modId === 'heart_ace_chip') {
          useHeartAceChip(copy, payload.cardIndex, enemies, log);
        }
        return copy;
      });
    },
    [meta.gameState, log, setPlayer]
  );

  const value = useMemo(
    () => ({
      player,
      meta,
      logs,
      floats,
      initGame,
      startStage,
      selectStartWeapon: (id, name) => selectStartWeapon(id, name),
      selectStartModule: (id, name) => selectStartModule(id, name, startStage),
      toggleCard: combat.toggleCard,
      handleReroll: combat.handleReroll,
      handleAttack: combat.handleAttack,
      handleDefend: combat.handleDefend,
      handleEndTurn: combat.handleEndTurn,
      selectEnemy: combat.selectEnemy,
      useActiveModule,
      log,
      ...rewardHandlers,
      GAME_STATES,
    }),
    [
      player,
      meta,
      logs,
      floats,
      initGame,
      startStage,
      selectStartWeapon,
      selectStartModule,
      combat,
      useActiveModule,
      log,
      rewardHandlers,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
