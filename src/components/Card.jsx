import { getSuitClass } from '../utils/deck';

export default function Card({ card, selected, onClick, label }) {
  if (!card) {
    return (
      <div
        className={`card ml-2 border-dashed border-purple-500 bg-[#222] text-purple-400 ${selected ? 'selected' : ''}`}
        onClick={onClick}
      >
        <div className="text-[10px]">빈 슬롯</div>
      </div>
    );
  }

  const colorClass = getSuitClass(card.suit);
  return (
    <div className={`card ${colorClass} ${selected ? 'selected' : ''}`} onClick={onClick}>
      {label && (
        <div className="absolute -top-3 text-[10px] text-purple-400 bg-black px-1">{label}</div>
      )}
      {card.isClone && (
        <div className="absolute -top-2 text-[8px] text-purple-500 bg-white px-1 border border-purple-500">
          CLONE
        </div>
      )}
      <div className="text-sm md:text-lg">{card.suit}</div>
      <div className="text-lg md:text-2xl">{card.num}</div>
    </div>
  );
}
