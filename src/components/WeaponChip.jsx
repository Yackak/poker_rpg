import { WEAPONS_DB, getReqLabel } from '../data/weapons';
import { isWeaponActive, getSelectedCards } from '../utils/pokerHands';
import { getEffectiveWeaponLevel } from '../utils/weaponLevel';

export default function WeaponChip({ weapon, player }) {
  const wInfo = WEAPONS_DB[weapon.id];
  if (!wInfo) return null;

  const selected = getSelectedCards(player);
  const effLv = getEffectiveWeaponLevel(weapon, player);
  const active = isWeaponActive(weapon, selected, player.modules, player.combatState);
  const baseDmg = wInfo.baseDmg + (effLv - 1) * 2;
  const reqLabel = `${wInfo.reqCount}${getReqLabel(wInfo.reqType)}`;
  const effect = wInfo.effectDesc(effLv);

  return (
    <div className="relative group flex-1 min-w-0">
      <div
        className={`pixel-box p-2 flex flex-col justify-center items-center text-center cursor-help truncate ${active ? 'border-yellow-400 bg-yellow-900/20' : ''}`}
        title={`${wInfo.name} — ${reqLabel}, 기본 ${baseDmg} 피해`}
      >
        <div className="text-xs md:text-sm font-bold text-blue-300 mb-1 truncate w-full">
          {wInfo.name}{' '}
          <span className="text-[10px] text-yellow-500">LV.{effLv}</span>
          {effLv !== weapon.level && (
            <span className="text-[9px] text-gray-500"> (실제 {weapon.level})</span>
          )}
        </div>
        <div className="text-[10px] text-gray-400 truncate w-full">
          [{reqLabel}]
        </div>
      </div>
      <div
        role="tooltip"
        className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-44 md:w-56 p-2 pixel-box bg-[#111] border-blue-600 text-[10px] md:text-xs text-gray-300 leading-snug opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none z-[100] shadow-lg"
      >
        <div className="font-bold mb-1 text-blue-300">
          {wInfo.name}{' '}
          <span className="text-yellow-500">LV.{effLv}</span>
        </div>
        <div className="text-gray-400 mb-1 break-keep">
          [{reqLabel}] · 기본 피해 {baseDmg}
        </div>
        <div className="text-orange-300 break-keep">{effect}</div>
        {active && (
          <div className="text-yellow-400 mt-1 font-bold">조건 충족 — 사용 가능</div>
        )}
      </div>
    </div>
  );
}
