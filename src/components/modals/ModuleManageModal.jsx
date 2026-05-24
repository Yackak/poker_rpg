import { useGame } from '../../context/GameContext';
import { MODULES_DB } from '../../data/modules';
import { ROUNDS_PER_STAGE, MAX_STAGE } from '../../game/constants';

export default function ModuleManageModal() {
  const { meta, player, toggleModuleEquip, finishModuleManagement } = useGame();

  if (meta.modal !== 'module_manage') return null;

  const nextRound = meta.round + 1;
  const nextLabel =
    meta.round >= ROUNDS_PER_STAGE
      ? meta.stage >= MAX_STAGE
        ? '정비 완료 (클리어!)'
        : `정비 완료 (스테이지 ${meta.stage + 1} 진입)`
      : `정비 완료 (라운드 ${nextRound} 진입)`;

  return (
    <div className="pixel-box p-4 md:p-6 max-w-4xl w-full mx-4 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl md:text-2xl text-center text-purple-400 mb-2">모듈 정비소</h2>
      <div className="text-center text-xs md:text-sm text-gray-400 mb-2">
        장착할 모듈과 보관할 모듈을 클릭하여 교체하세요. (각 최대 5개)
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <ModuleColumn
          title="장착 중"
          count={player.modules.length}
          color="green"
          items={player.modules}
          actionLabel="해제 ▶"
          actionSide="right"
          onClick={(index, modId) => toggleModuleEquip('equipped', index, modId)}
        />
        <ModuleColumn
          title="보관소"
          count={player.inventoryModules.length}
          color="gray"
          items={player.inventoryModules}
          actionLabel="◀ 장착"
          actionSide="left"
          onClick={(index) => toggleModuleEquip('inventory', index)}
        />
      </div>
      <button
        type="button"
        className="pixel-btn py-3 mt-2 w-full text-white text-base md:text-lg border-green-600 bg-green-900/30 hover:bg-green-800"
        onClick={finishModuleManagement}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ModuleColumn({ title, count, color, items, actionLabel, actionSide, onClick }) {
  const titleColor = color === 'green' ? 'text-green-400' : 'text-gray-400';
  return (
    <div className="flex-1 border-2 border-gray-600 p-3 bg-[#111]">
      <h3 className={`text-base md:text-lg ${titleColor} border-b border-gray-600 pb-2 mb-3`}>
        {title} ({count}/5)
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((modId, index) => {
          const mInfo = MODULES_DB[modId];
          const typeColor = mInfo.type === 'active' ? 'text-purple-300' : 'text-green-300';
          return (
            <button
              key={`${modId}-${index}`}
              type="button"
              className="pixel-box p-3 cursor-pointer hover:border-yellow-500 flex justify-between items-center bg-gray-800 text-left"
              onClick={() => onClick(index, modId)}
            >
              {actionSide === 'left' && (
                <span className="text-xs text-green-400 font-bold shrink-0 border border-green-700 px-2 py-1 mr-2">
                  {actionLabel}
                </span>
              )}
              <div className={`flex-1 overflow-hidden ${actionSide === 'left' ? 'text-right' : ''}`}>
                <div className={`text-sm font-bold ${typeColor}`}>{mInfo.name}</div>
                <div className="text-[10px] text-gray-400">{mInfo.desc}</div>
              </div>
              {actionSide === 'right' && (
                <span className="text-xs text-red-400 font-bold shrink-0 border border-red-900 px-2 py-1">
                  {actionLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
