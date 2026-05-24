import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import EnemyArea from './EnemyArea';
import CombatLog from './CombatLog';
import PlayerPanel from './PlayerPanel';
import HandArea from './HandArea';
import Controls from './Controls';
import Overlay from './Overlay';

export default function GameLayout() {
  const { meta, player, floats, initGame, useActiveModule, log, selectEnemy, GAME_STATES } =
    useGame();

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleUseModule = (modId) => {
    const sel = player.selectedCardIndices.filter((i) => i !== 'keep');

    if (modId === 'joker_chip') {
      if (sel.length !== 1) return;
      const suit = prompt('변경할 문양을 입력하세요 (♠, ♥, ♦, ♣)', '♠');
      if (suit) useActiveModule(modId, { cardIndex: sel[0], suit });
    } else if (modId === 'tuning') {
      if (sel.length !== 1) return;
      const increase = confirm('숫자를 올리시겠습니까? (취소 시 내림)');
      useActiveModule(modId, { cardIndex: sel[0], increase });
    } else if (modId === 'spade_three_chip' || modId === 'heart_ace_chip') {
      if (sel.length !== 1) {
        log('손패에서 카드 1장을 선택하세요.', 'system');
        return;
      }
      useActiveModule(modId, { cardIndex: sel[0] });
    } else if (modId === 'copy_discard') {
      if (sel.length !== 1) {
        log('복사할 카드 1장을 선택하세요.', 'system');
        return;
      }
      useActiveModule(modId, { cardIndex: sel[0] });
    } else if (modId === 'delay_draw' || modId === 'blood_draw') {
      useActiveModule(modId, {});
    } else if (modId === 'empty_deck_rescue' || modId === 'combat_double_draw' || modId === 'overload_chip') {
      useActiveModule(modId, {});
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col ${meta.shake ? 'shake' : ''}`}>
      <Overlay />
      {floats.map((f) => (
        <div
          key={f.id}
          className="damage-float"
          style={{ left: f.x, top: f.y, color: f.color }}
        >
          {f.text}
        </div>
      ))}
      <EnemyArea
        enemies={meta.enemies}
        selectedEnemyIndex={meta.selectedEnemyIndex ?? 0}
        canSelect={meta.gameState === GAME_STATES.PLAYER_TURN && meta.enemies.length > 0}
        onSelectEnemy={selectEnemy}
      />
      <CombatLog />
      <PlayerPanel
        player={player}
        gameState={meta.gameState}
        onUseModule={handleUseModule}
      />
      <div className="h-40 w-full bg-[#0a0a0a] border-t-4 border-gray-700 p-2 flex items-center justify-between shrink-0">
        <HandArea />
        <Controls />
      </div>
    </div>
  );
}
