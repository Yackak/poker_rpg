import { useGame } from '../../context/GameContext';

export default function RewardModal() {
  const { meta, pickReward, skipReward } = useGame();

  if (meta.modal !== 'reward') return null;

  const isModule = meta.moduleDropEarned;
  const title = isModule
    ? '전투 승리! 모듈 보상을 선택하세요'
    : '전투 승리! 무기 보상을 선택하세요';

  return (
    <div className="pixel-box p-6 max-w-2xl w-full mx-4 flex flex-col gap-4">
      <h2 className="text-xl md:text-2xl text-center text-yellow-400 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meta.rewardOptions.length === 0 ? (
          <div className="text-center text-gray-400 col-span-3">더 이상 획득할 수 있는 보상이 없습니다.</div>
        ) : (
          meta.rewardOptions.map((option, i) => (
            <button
              key={i}
              type="button"
              className="pixel-btn p-4 flex flex-col items-center justify-center gap-2 h-32 hover:bg-gray-700"
              onClick={() => pickReward(option)}
            >
              {option.type === 'module' ? (
                <>
                  <div className="font-bold text-green-300 text-sm md:text-base">{option.data.name}</div>
                  <div className="text-[10px] md:text-xs text-gray-400 text-center">{option.data.desc}</div>
                </>
              ) : (
                <>
                  <div className={`text-xs font-bold mb-1 ${option.type === 'upgrade' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {option.label}
                  </div>
                  <div className="font-bold text-blue-300 text-sm md:text-base">{option.title}</div>
                  <div className="text-[10px] text-gray-400 text-center">{option.desc}</div>
                </>
              )}
            </button>
          ))
        )}
      </div>
      <button type="button" className="pixel-btn py-3 mt-4 text-gray-400 border-gray-600 hover:bg-gray-800" onClick={skipReward}>
        보상 받지 않고 넘어가기
      </button>
    </div>
  );
}
