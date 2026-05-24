import { useGame } from '../../context/GameContext';
import { WEAPONS_DB, getReqLabel } from '../../data/weapons';
import { START_WEAPONS } from '../../game/constants';

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

export default function StartChoiceModal() {
  const { meta, selectStartWeapon, selectStartModule } = useGame();

  if (meta.modal !== 'start') return null;

  const isWeapon = meta.startStep === 'weapon';

  return (
    <div className={`pixel-box p-6 w-full mx-4 flex flex-col gap-4 ${isWeapon ? 'max-w-md' : 'max-w-2xl'}`}>
      <h2 className="text-xl text-center text-yellow-400 mb-2">
        {isWeapon ? '시작 무기 선택' : '시작 모듈 선택'}
      </h2>
      {!isWeapon && (
        <p className="text-center text-xs text-gray-400">
          일반 / 레어 / 에픽 확률로 제시된 모듈 중 1개를 선택하세요
        </p>
      )}
      <div className={isWeapon ? 'flex flex-col gap-3' : 'grid grid-cols-1 md:grid-cols-3 gap-3'}>
        {isWeapon
          ? START_WEAPONS.map((wId) => {
              const w = WEAPONS_DB[wId];
              return (
                <button
                  key={wId}
                  type="button"
                  className="pixel-btn py-3 px-4 flex flex-col items-center hover:bg-gray-700"
                  onClick={() => selectStartWeapon(wId, w.name)}
                >
                  <span className="text-blue-300 font-bold">{w.name}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    [{w.reqCount}
                    {getReqLabel(w.reqType)}] {w.effectDesc(1)}
                  </span>
                </button>
              );
            })
          : meta.startModuleOptions?.length > 0
            ? meta.startModuleOptions.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  className="pixel-btn py-3 px-4 flex flex-col items-center hover:bg-gray-700"
                  onClick={() => selectStartModule(mod.id, mod.name)}
                >
                  <span className={`text-[10px] font-bold ${RARITY_COLOR[mod.rarity] || 'text-gray-400'}`}>
                    {RARITY_LABEL[mod.rarity] || mod.rarity}
                  </span>
                  <span className="text-purple-300 font-bold mt-1">{mod.name}</span>
                  <span className="text-xs text-gray-400 mt-1 text-center">{mod.desc}</span>
                </button>
              ))
            : (
                <div className="text-center text-gray-400 text-sm">선택 가능한 모듈이 없습니다.</div>
              )}
      </div>
    </div>
  );
}
