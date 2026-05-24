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
import { useJokerChip, useTuning, useOverloadChip } from '../game/moduleLogic';
import { GAME_STATES } from '../game/constants';

export function GameProvider({ children }) {
  const { logs, log, clearLogs } = useCombatLog();
  const { floats, showFloatText } = useFloatText();
  const [player, setPlayer] = useState(() => createPlayer({ deck: generateDeck() }));
  const [meta, setMeta] = useState(createInitialMeta);
  const stateRef = useRef({ player, meta });
  stateRef.current = { player, meta };

  const showFloatAtEnemy = useCallback(
    (text, color) => showFloatText(text, window.innerWidth / 2 - 20, 80, color),
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
    rewardHandlers.openVictory
  );

  const handleAttack = useCallback(
    () => combat.handleAttack(() => stateRef.current),
    [combat]
  );

  const useActiveModule = useCallback(
    (modId, payload) => {
      if (meta.gameState !== GAME_STATES.PLAYER_TURN) return;
      setPlayer((p) => {
        const copy = structuredClone(p);
        if (copy.combatState.activeModulesUsed[modId]) return p;
        if (modId === 'joker_chip') {
          useJokerChip(copy, payload.cardIndex, payload.suit, log);
        } else if (modId === 'tuning') {
          useTuning(copy, payload.cardIndex, payload.increase, log);
        } else if (modId === 'overload_chip') {
          useOverloadChip(copy, log);
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
      handleAttack,
      handleEndTurn: combat.handleEndTurn,
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
      handleAttack,
      useActiveModule,
      log,
      rewardHandlers,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
