import { useCallback } from 'react';
import { buildAttackResult, executeReroll, GAME_STATES } from './gameEngine';
import { applyEndTurnCleanup, applyPlayerTurnStart } from '../game/playerTurn';
import { processSingleEnemyTurn, handleEnemyDeath } from '../game/enemyTurn';

export function useCombatHandlers(setPlayer, setMeta, log, showFloatAtEnemy, onVictory) {
  const toggleCard = useCallback(
    (index) => {
      setPlayer((p) => {
        const sel = [...p.selectedCardIndices];
        const pos = sel.indexOf(index);
        if (pos > -1) sel.splice(pos, 1);
        else sel.push(index);
        return { ...p, selectedCardIndices: sel };
      });
    },
    [setPlayer]
  );

  const handleReroll = useCallback(() => {
    setPlayer((p) => {
      const copy = structuredClone(p);
      if (executeReroll(copy, log)) return copy;
      return p;
    });
  }, [log, setPlayer]);

  const handleAttack = useCallback(
    (getState) => {
      const { player: p, meta: m } = getState();
      const copy = structuredClone(p);
      const enemiesCopy = structuredClone(m.enemies);
      const result = buildAttackResult(copy, enemiesCopy, log, showFloatAtEnemy);
      if (!result) return;

      let moduleDrop = m.moduleDropEarned;
      if (result.targetDead && enemiesCopy.length > 0) {
        const dead = enemiesCopy.shift();
        const deathResult = handleEnemyDeath(dead, copy, log);
        if (deathResult.moduleDrop) moduleDrop = true;
      }

      setPlayer(copy);
      setMeta({ ...m, enemies: enemiesCopy, moduleDropEarned: moduleDrop });
      if (enemiesCopy.length === 0) {
        setTimeout(() => onVictory(moduleDrop), 1000);
      }
    },
    [log, showFloatAtEnemy, onVictory, setMeta, setPlayer]
  );

  const runEnemyTurns = useCallback(
    (enemies, playerSnapshot, moduleDropEarned) => {
      let idx = 0;
      let currentEnemies = structuredClone(enemies);
      let currentPlayer = structuredClone(playerSnapshot);
      let moduleDrop = moduleDropEarned;

      const finishPlayerTurn = () => {
        setMeta((m) => ({ ...m, gameState: GAME_STATES.PLAYER_TURN, enemies: currentEnemies, moduleDropEarned: moduleDrop }));
        setPlayer((p) => {
          const copy = structuredClone({ ...p, ...currentPlayer });
          applyPlayerTurnStart(copy, log);
          return copy;
        });
      };

      const next = () => {
        if (idx >= currentEnemies.length) {
          finishPlayerTurn();
          return;
        }

        const enemy = currentEnemies[idx];
        const result = processSingleEnemyTurn(enemy, currentPlayer, log);

        if (result.events.some((e) => e.type === 'burn')) {
          showFloatAtEnemy(`-${result.events.find((e) => e.type === 'burn').damage}`, '#f97316');
        }
        if (result.events.some((e) => e.type === 'attack')) {
          setMeta((m) => ({ ...m, shake: true }));
          setTimeout(() => setMeta((m) => ({ ...m, shake: false })), 400);
          setPlayer({ ...currentPlayer });
          if (currentPlayer.hp <= 0) {
            setMeta((m) => ({ ...m, gameState: GAME_STATES.GAMEOVER, modal: 'gameover' }));
            return;
          }
        }

        if (result.died) {
          const dead = currentEnemies.splice(idx, 1)[0];
          const deathResult = handleEnemyDeath(dead, currentPlayer, log);
          if (deathResult.moduleDrop) moduleDrop = true;
          setMeta((m) => ({ ...m, enemies: currentEnemies, moduleDropEarned: moduleDrop }));
          if (currentEnemies.length === 0) {
            setTimeout(() => onVictory(moduleDrop), 500);
            return;
          }
          setTimeout(next, 800);
          return;
        }

        idx += 1;
        setPlayer({ ...currentPlayer });
        setMeta((m) => ({ ...m, enemies: currentEnemies }));
        setTimeout(next, 800);
      };

      setTimeout(next, 500);
    },
    [log, showFloatAtEnemy, onVictory, setMeta, setPlayer]
  );

  const handleEndTurn = useCallback(() => {
    setPlayer((p) => {
      const copy = structuredClone(p);
      applyEndTurnCleanup(copy);
      setMeta((m) => {
        setTimeout(() => runEnemyTurns(m.enemies, copy, m.moduleDropEarned), 0);
        return { ...m, gameState: GAME_STATES.ENEMY_TURN };
      });
      return copy;
    });
  }, [runEnemyTurns, setMeta, setPlayer]);

  return { toggleCard, handleReroll, handleAttack, handleEndTurn };
}
