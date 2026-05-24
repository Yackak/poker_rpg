import { useCallback } from 'react';
import { buildAttackResult, executeReroll, executeDefend, GAME_STATES } from './gameEngine';
import { applyEndTurnCleanup, applyPlayerTurnStart } from '../game/playerTurn';
import { processSingleEnemyTurn, handleEnemyDeath } from '../game/enemyTurn';
import { normalizeSelectedEnemyIndex } from '../game/enemyTarget';

export function useCombatHandlers(setPlayer, setMeta, log, showFloatAtEnemy, onVictory, getState) {
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
    const { meta: m } = getState();
    setPlayer((p) => {
      const copy = structuredClone(p);
      if (executeReroll(copy, m.enemies, log)) return copy;
      return p;
    });
  }, [getState, log, setPlayer]);

  const handleDefend = useCallback(() => {
    const { meta: m } = getState();
    setPlayer((p) => {
      const copy = structuredClone(p);
      if (executeDefend(copy, log, m.enemies)) return copy;
      return p;
    });
  }, [getState, log, setPlayer]);

  const selectEnemy = useCallback(
    (index) => {
      setMeta((m) => {
        if (m.gameState !== GAME_STATES.PLAYER_TURN) return m;
        if (!m.enemies[index] || m.enemies[index].hp <= 0) return m;
        return { ...m, selectedEnemyIndex: index };
      });
    },
    [setMeta]
  );

  const handleAttack = useCallback(() => {
    const { player: p, meta: m } = getState();
    const copy = structuredClone(p);
    const enemiesCopy = structuredClone(m.enemies);
    const targetIndex = normalizeSelectedEnemyIndex(enemiesCopy, m.selectedEnemyIndex ?? 0);
    const result = buildAttackResult(copy, enemiesCopy, targetIndex, log, (text, color) =>
      showFloatAtEnemy(text, color, targetIndex)
    );
    if (!result) return;

    let weaponBonus = m.weaponBonusEarned;
    let nextEnemies = enemiesCopy;
    let nextTargetIndex = targetIndex;

    if (result.targetDead && enemiesCopy.length > 0) {
      const dead = enemiesCopy.splice(result.targetIndex, 1)[0];
      const deathResult = handleEnemyDeath(dead, copy, log);
      if (deathResult.weaponBonus) weaponBonus = true;
      nextEnemies = enemiesCopy;
      nextTargetIndex = normalizeSelectedEnemyIndex(enemiesCopy, result.targetIndex);
    }

    setPlayer(copy);
    setMeta({
      ...m,
      enemies: nextEnemies,
      selectedEnemyIndex: nextTargetIndex,
      weaponBonusEarned: weaponBonus,
    });
    if (nextEnemies.length === 0) {
      setTimeout(() => onVictory(weaponBonus), 1000);
    }
  }, [getState, log, showFloatAtEnemy, onVictory, setMeta, setPlayer]);

  const runEnemyTurns = useCallback(
    (enemies, playerSnapshot, weaponBonusEarned) => {
      let idx = 0;
      let currentEnemies = structuredClone(enemies);
      let currentPlayer = structuredClone(playerSnapshot);
      let weaponBonus = weaponBonusEarned;

      const finishPlayerTurn = () => {
        setMeta((m) => ({
          ...m,
          gameState: GAME_STATES.PLAYER_TURN,
          enemies: currentEnemies,
          weaponBonusEarned: weaponBonus,
          selectedEnemyIndex: normalizeSelectedEnemyIndex(
            currentEnemies,
            m.selectedEnemyIndex ?? 0
          ),
        }));
        setPlayer((p) => {
          const copy = structuredClone({ ...p, ...currentPlayer });
          applyPlayerTurnStart(copy, log, currentEnemies);
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
          showFloatAtEnemy(
            `-${result.events.find((e) => e.type === 'burn').damage}`,
            '#f97316',
            idx
          );
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
          if (deathResult.weaponBonus) weaponBonus = true;
          setMeta((m) => ({
            ...m,
            enemies: currentEnemies,
            weaponBonusEarned: weaponBonus,
            selectedEnemyIndex: normalizeSelectedEnemyIndex(
              currentEnemies,
              m.selectedEnemyIndex ?? 0
            ),
          }));
          if (currentEnemies.length === 0) {
            setTimeout(() => onVictory(weaponBonus), 500);
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
      applyEndTurnCleanup(copy, log);
      setMeta((m) => {
        setTimeout(() => runEnemyTurns(m.enemies, copy, m.weaponBonusEarned), 0);
        return { ...m, gameState: GAME_STATES.ENEMY_TURN };
      });
      return copy;
    });
  }, [log, runEnemyTurns, setMeta, setPlayer]);

  return { toggleCard, handleReroll, handleAttack, handleDefend, handleEndTurn, selectEnemy };
}
