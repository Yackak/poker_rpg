import { useGame } from '../../context/GameContext';

const RARITY_LABEL = {
  normal: '일반',
  rare: '레어',
  epic: '에픽',
  legend: '레전드',
};

const RARITY_COLOR = {
  normal: 'text-gray-300',
  rare: 'text-blue-300',
  epic: 'text-purple-300',
  legend: 'text-yellow-300',
};

export default function RewardModal() {
  const { meta, pickReward, skipReward } = useGame();

  if (meta.modal !== 'reward') return null;

  const isWeaponPhase = meta.rewardPhase === 'weapon';
  const isBossVictory = meta.isBossVictory;
  const title = isWeaponPhase
    ? '보너스! 무기 보상을 선택하세요'
    : isBossVictory
      ? '최종 보스 격파! 레전드 모듈을 선택하세요'
      : '전투 승리! 모듈을 선택하세요';
  const skipLabel = isWeaponPhase ? '무기 보너스 건너뛰기' : '모듈 건너뛰기';

  return (
    <div className="pixel-box p-6 max-w-2xl w-full mx-4 flex flex-col gap-4">
      <h2 className="text-xl md:text-2xl text-center text-yellow-400 mb-2">{title}</h2>
      {!isWeaponPhase && meta.weaponBonusEarned && meta.weaponRewardOptions?.length > 0 && (
        <p className="text-center text-xs text-blue-300">
          모듈 선택 후 무기 보너스도 받을 수 있습니다
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meta.rewardOptions.length === 0 ? (
          <div className="text-center text-gray-400 col-span-3">
            {isWeaponPhase
              ? '더 이상 획득할 수 있는 무기가 없습니다.'
              : '더 이상 획득할 수 있는 모듈이 없습니다.'}
          </div>
        ) : (
          meta.rewardOptions.map((option) => (
            <button
              key={`${option.type}-${option.weaponId || option.id}`}
              type="button"
              className="pixel-btn p-4 flex flex-col items-center justify-center gap-2 h-32 hover:bg-gray-700"
              onClick={() => pickReward(option)}
            >
              {option.type === 'module' ? (
                <>
                  <div className={`text-[10px] font-bold ${RARITY_COLOR[option.data.rarity] || 'text-gray-400'}`}>
                    {RARITY_LABEL[option.data.rarity] || option.data.rarity}
                  </div>
                  <div className="font-bold text-green-300 text-sm md:text-base">{option.data.name}</div>
                  <div className="text-[10px] md:text-xs text-gray-400 text-center">{option.data.desc}</div>
                </>
              ) : (
                <>
                  <div
                    className={`text-xs font-bold mb-1 ${option.type === 'upgrade' ? 'text-green-400' : 'text-yellow-400'}`}
                  >
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
      <button
        type="button"
        className="pixel-btn py-3 mt-2 text-gray-400 border-gray-600 hover:bg-gray-800"
        onClick={skipReward}
      >
        {skipLabel}
      </button>
    </div>
  );
}
