import { useGame } from '../../context/GameContext';
import { WEAPONS_DB } from '../../data/weapons';
import { MODULES_DB } from '../../data/modules';

export default function ChoiceModal() {
  const { meta, player, replaceWeapon, replaceModuleChoice, abandonModule, backToReward } = useGame();

  if (meta.modal !== 'choice') return null;

  const isWeapon = meta.choiceContext === 'weapon';
  const newWeapon = meta.pendingNewWeapon;
  const newModId = meta.pendingNewModule;

  if (isWeapon && newWeapon) {
    const newWInfo = WEAPONS_DB[newWeapon.id];
    return (
      <div className="pixel-box p-6 max-w-2xl w-full mx-4 flex flex-col gap-4">
        <h2 className="text-xl text-center text-yellow-400 mb-4">
          <span className="text-blue-400">[{newWInfo.name}]</span> LV.{newWeapon.level} 획득!
          <span className="text-sm text-gray-400 mt-2 block">어떤 무기를 버리시겠습니까?</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {player.weapons.map((wpn, index) => {
            const wInfo = WEAPONS_DB[wpn.id];
            return (
              <button
                key={index}
                type="button"
                className="pixel-btn p-4 flex flex-col items-center gap-2 h-32 hover:bg-red-900/40 border-red-900"
                onClick={() => replaceWeapon(index)}
              >
                <div className="font-bold text-red-400 animate-pulse">버리기</div>
                <div className="text-sm text-gray-300">
                  {wInfo.name} <span className="text-xs text-yellow-400">LV.{wpn.level}</span>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            className="pixel-btn p-4 flex flex-col items-center gap-2 h-32 hover:bg-gray-700"
            onClick={backToReward}
          >
            <div className="font-bold text-gray-400">뒤로 가기</div>
          </button>
        </div>
      </div>
    );
  }

  const newModInfo = MODULES_DB[newModId];
  const allMods = [
    ...player.modules.map((id, index) => ({ id, type: 'equipped', index })),
    ...player.inventoryModules.map((id, index) => ({ id, type: 'inventory', index })),
  ];

  return (
    <div className="pixel-box p-6 max-w-2xl w-full mx-4 flex flex-col gap-4">
      <h2 className="text-xl text-center text-yellow-400 mb-4">
        <span className="text-purple-400">[{newModInfo?.name}]</span> 획득!
        <span className="text-sm text-gray-400 mt-2 block">슬롯이 가득 찼습니다. 영구히 버릴 모듈을 선택하세요.</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMods.map((item) => {
          const mInfo = MODULES_DB[item.id];
          return (
            <button
              key={`${item.type}-${item.index}`}
              type="button"
              className="pixel-btn p-3 flex flex-col items-center gap-1 h-36 hover:bg-red-900/40 border-red-900"
              onClick={() => replaceModuleChoice(item)}
            >
              <div className="text-[10px] text-gray-500">[{item.type === 'equipped' ? '장착 중' : '보관 중'}]</div>
              <div className="font-bold text-red-400 animate-pulse">버리기</div>
              <div className="text-sm text-gray-300">{mInfo.name}</div>
            </button>
          );
        })}
        <button type="button" className="pixel-btn p-3 flex flex-col items-center gap-2 h-36 hover:bg-gray-700" onClick={abandonModule}>
          <div className="font-bold text-gray-400">포기하기</div>
        </button>
      </div>
    </div>
  );
}
