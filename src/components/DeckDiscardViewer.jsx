import { useState } from 'react';
import CardMini from './CardMini';

function CardRow({ label, cards, emptyText }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="text-[10px] text-gray-400 shrink-0">
        {label} ({cards.length})
      </div>
      {cards.length === 0 ? (
        <div className="text-[10px] text-gray-500 italic">{emptyText}</div>
      ) : (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {cards.map((card) => (
            <CardMini key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DeckDiscardViewer({ usedCards, discardCards, deckCount }) {
  const [showUsed, setShowUsed] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const panelOpen = showUsed || showDiscard;

  const toggleBtnClass = (active, color) =>
    `pixel-btn px-2 py-0.5 text-[10px] md:text-xs ${active ? color : 'text-gray-500 border-gray-700'}`;

  return (
    <div className="flex flex-col items-end gap-1 min-w-0 max-w-[60%]">
      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
        <span className="text-[10px] md:text-xs text-gray-500">덱 {deckCount}</span>
        <button
          type="button"
          className={toggleBtnClass(showUsed, 'text-orange-300 border-orange-700 bg-orange-900/20')}
          onClick={() => setShowUsed((v) => !v)}
        >
          사용 {usedCards.length}
        </button>
        <button
          type="button"
          className={toggleBtnClass(showDiscard, 'text-purple-300 border-purple-700 bg-purple-900/20')}
          onClick={() => setShowDiscard((v) => !v)}
        >
          무덤 {discardCards.length}
        </button>
      </div>
      {panelOpen && (
        <div className="w-full max-w-sm pixel-box p-2 bg-[#111] flex flex-col gap-2">
          {showUsed && (
            <CardRow label="이번 턴 사용" cards={usedCards} emptyText="사용한 카드 없음" />
          )}
          {showDiscard && (
            <CardRow label="무덤" cards={discardCards} emptyText="무덤이 비어 있습니다" />
          )}
        </div>
      )}
    </div>
  );
}
