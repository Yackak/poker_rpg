import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import EnemyArea from './EnemyArea';
import CombatLog from './CombatLog';
import PlayerPanel from './PlayerPanel';
import HandArea from './HandArea';
import Controls from './Controls';
import Overlay from './Overlay';

export default function GameLayout() {
  const { meta, player, floats, initGame, useActiveModule, GAME_STATES } = useGame();

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleUseModule = (modId) => {
    if (modId === 'joker_chip') {
      if (player.selectedCardIndices.length !== 1 || player.selectedCardIndices.includes('keep')) {
        return;
      }
      const suit = prompt('변경할 문양을 입력하세요 (♠, ♥, ♦, ♣)', '♠');
      if (suit) useActiveModule(modId, { cardIndex: player.selectedCardIndices[0], suit });
    } else if (modId === 'tuning') {
      if (player.selectedCardIndices.length !== 1 || player.selectedCardIndices.includes('keep')) {
        return;
      }
      const increase = confirm('숫자를 올리시겠습니까? (취소 시 내림)');
      useActiveModule(modId, { cardIndex: player.selectedCardIndices[0], increase });
    } else if (modId === 'overload_chip') {
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
      <EnemyArea enemies={meta.enemies} />
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
