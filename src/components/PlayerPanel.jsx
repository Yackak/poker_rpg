import { WEAPONS_DB, getReqLabel } from '../data/weapons';
import { MODULES_DB } from '../data/modules';
import { isWeaponActive, getSelectedCards } from '../utils/pokerHands';

export default function PlayerPanel({ player, onUseModule, gameState }) {
  const selected = getSelectedCards(player);

  return (
    <div className="w-full max-w-3xl mx-auto p-2 shrink-0 flex flex-col gap-2">
      <div className="flex justify-between items-center bg-[#222] p-2 border-2 border-gray-700">
        <div className="flex flex-col">
          <span className="text-yellow-500 text-sm mb-1">플레이어 HP</span>
          <div className="flex items-center gap-2">
            <div className="w-32 md:w-48 h-4 bg-red-900 border border-gray-600 relative">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-xs">
              {player.hp}/{player.maxHp}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {player.weapons.map((w) => {
          const wInfo = WEAPONS_DB[w.id];
          const active = isWeaponActive(w, selected, player.modules, player.combatState);
          return (
            <div
              key={w.id}
              className={`flex-1 pixel-box p-2 flex flex-col justify-center items-center text-center ${active ? 'border-yellow-400 bg-yellow-900/20' : ''}`}
            >
              <div className="text-xs md:text-sm font-bold text-blue-300 mb-1">
                {wInfo.name} <span className="text-[10px] text-yellow-500">LV.{w.level}</span>
              </div>
              <div className="text-[10px] text-gray-400">
                [{wInfo.reqCount}
                {getReqLabel(wInfo.reqType)}]
              </div>
              <div className="text-[10px] text-orange-300 mt-1">{wInfo.effectDesc(w.level)}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        {player.modules.map((modId) => {
          const mInfo = MODULES_DB[modId];
          const isActive = mInfo.type === 'active';
          return (
            <div
              key={modId}
              className={`flex-1 pixel-box p-1 text-center text-[10px] md:text-xs font-bold ${isActive ? 'text-purple-300 border-purple-900 bg-purple-900/20' : 'text-green-300 border-green-900 bg-green-900/20'}`}
            >
              {mInfo.name}
            </div>
          );
        })}
      </div>

      <ModuleActions player={player} gameState={gameState} onUseModule={onUseModule} />
    </div>
  );
}

function ModuleActions({ player, gameState, onUseModule }) {
  const actives = player.modules.filter((id) => MODULES_DB[id].type === 'active');
  if (actives.length === 0) return null;

  return (
    <div className="flex gap-2">
      {actives.map((modId) => {
        const mInfo = MODULES_DB[modId];
        let disabled = gameState !== 'PLAYER_TURN';
        let label = `${mInfo.name} 사용`;
        if (modId === 'overload_chip' && player.combatState.overloadCooldown > 0) {
          disabled = true;
          label += `(쿨${player.combatState.overloadCooldown})`;
        } else if (modId === 'combat_double_draw' && player.combatState.combatDrawUsed) {
          disabled = true;
          label += '(전투 사용됨)';
        } else if (player.combatState.activeModulesUsed[modId]) {
          disabled = true;
          label += '(완료)';
        }
        return (
          <button
            key={modId}
            type="button"
            disabled={disabled}
            className="pixel-btn py-1 px-2 text-[10px] md:text-xs text-purple-300 border-purple-700"
            onClick={() => onUseModule(modId)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
