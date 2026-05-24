import { useGame } from '../context/GameContext';
import Card from './Card';
import { hasKeepSlotAccess } from '../game/moduleEffects';

export default function HandArea() {
  const { player, toggleCard, meta, GAME_STATES } = useGame();
  const canSelect = meta.gameState === GAME_STATES.PLAYER_TURN;

  return (
    <div className="flex-1 flex justify-center gap-1 md:gap-2">
      {player.hand.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          selected={player.selectedCardIndices.includes(index)}
          onClick={() => canSelect && toggleCard(index)}
        />
      ))}
      {hasKeepSlotAccess(player) && (
        <Card
          card={player.keepSlot}
          selected={player.selectedCardIndices.includes('keep')}
          onClick={() => canSelect && toggleCard('keep')}
          label="KEEP"
        />
      )}
    </div>
  );
}
