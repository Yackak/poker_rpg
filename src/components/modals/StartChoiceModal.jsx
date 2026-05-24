import { useGame } from '../../context/GameContext';
import { WEAPONS_DB, getReqLabel } from '../../data/weapons';
import { MODULES_DB } from '../../data/modules';
import { START_WEAPONS, START_MODULES } from '../../game/constants';

export default function StartChoiceModal() {
  const { meta, selectStartWeapon, selectStartModule } = useGame();

  if (meta.modal !== 'start') return null;

  const isWeapon = meta.startStep === 'weapon';

  return (
    <div className="pixel-box p-6 max-w-md w-full mx-4 flex flex-col gap-4">
      <h2 className="text-xl text-center text-yellow-400 mb-2">
        {isWeapon ? '시작 무기 선택' : '시작 모듈 선택'}
      </h2>
      <div className="flex flex-col gap-3">
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
          : START_MODULES.map((modId) => {
              const m = MODULES_DB[modId];
              return (
                <button
                  key={modId}
                  type="button"
                  className="pixel-btn py-3 px-4 flex flex-col items-center hover:bg-gray-700"
                  onClick={() => selectStartModule(modId, m.name)}
                >
                  <span className="text-purple-300 font-bold">{m.name}</span>
                  <span className="text-xs text-gray-400 mt-1">{m.desc}</span>
                </button>
              );
            })}
      </div>
    </div>
  );
}
