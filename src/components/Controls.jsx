import { useGame } from '../context/GameContext';

export default function Controls() {
  const { player, meta, handleReroll, handleAttack, handleEndTurn, GAME_STATES } = useGame();
  const isPlayerTurn = meta.gameState === GAME_STATES.PLAYER_TURN;

  return (
    <div className="w-24 md:w-32 flex flex-col gap-2 ml-2 shrink-0">
      <button
        type="button"
        className="pixel-btn py-2 text-xs md:text-sm text-blue-300"
        disabled={!isPlayerTurn || player.rerolls <= 0}
        onClick={handleReroll}
      >
        리롤 ({player.rerolls})
      </button>
      <button
        type="button"
        className="pixel-btn py-3 text-sm md:text-base text-red-400 font-bold"
        disabled={!isPlayerTurn || player.selectedCardIndices.length === 0}
        onClick={handleAttack}
      >
        공격하기
      </button>
      <button
        type="button"
        className="pixel-btn py-2 text-xs md:text-sm text-gray-400"
        disabled={!isPlayerTurn}
        onClick={handleEndTurn}
      >
        턴 종료
      </button>
    </div>
  );
}
