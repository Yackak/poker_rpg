import { useGame } from '../../context/GameContext';

export default function GameOverModal() {
  const { meta, initGame } = useGame();

  if (meta.modal !== 'gameover') return null;

  return (
    <div className="pixel-box p-8 max-w-md w-full mx-4 flex flex-col items-center gap-6">
      <h2 className="text-3xl text-red-500 animate-pulse">YOU DIED</h2>
      <p className="text-center text-gray-300">도달 스테이지: {meta.stage}</p>
      <button type="button" className="pixel-btn px-6 py-3 text-lg w-full" onClick={initGame}>
        다시 시작
      </button>
    </div>
  );
}
