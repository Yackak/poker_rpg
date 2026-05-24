import { useGame } from '../context/GameContext';
import { getLogClass } from '../hooks/useCombatLog';
import DeckDiscardViewer from './DeckDiscardViewer';

export default function CombatLog() {
  const { logs, player, meta } = useGame();
  const usedCards = player.combatState?.cardsUsedThisTurn ?? [];

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-2 flex flex-col min-h-0">
      <div className="flex justify-between items-start mb-1 shrink-0 gap-2">
        <div className="text-xs text-gray-400 shrink-0">
          스테이지 <span className="text-yellow-400 text-sm">{meta.stage}</span>
        </div>
        <DeckDiscardViewer
          usedCards={usedCards}
          discardCards={player.discard}
          deckCount={player.deck.length}
        />
      </div>
      <div className="pixel-box flex-1 p-3 overflow-y-auto log-container flex flex-col gap-1 text-xs md:text-sm break-keep">
        {logs.map((entry) => (
          <div key={entry.id} className={getLogClass(entry.type)}>
            {'> '}
            {entry.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
