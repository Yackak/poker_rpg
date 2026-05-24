import { getSuitClass } from '../utils/deck';

export default function CardMini({ card }) {
  if (!card) return null;

  const colorClass = getSuitClass(card.suit);
  return (
    <div
      className={`card-mini ${colorClass}`}
      title={`${card.suit}${card.num}${card.isClone ? ' (복제)' : ''}`}
    >
      {card.isClone && <div className="card-mini-clone">C</div>}
      <div className="card-mini-suit">{card.suit}</div>
      <div className="card-mini-num">{card.num}</div>
    </div>
  );
}
