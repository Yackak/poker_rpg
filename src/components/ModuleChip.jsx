import { MODULES_DB } from '../data/modules';

export default function ModuleChip({ modId }) {
  const mInfo = MODULES_DB[modId];
  if (!mInfo) return null;

  const isActive = mInfo.type === 'active';
  const chipColor = isActive
    ? 'text-purple-300 border-purple-900 bg-purple-900/20'
    : 'text-green-300 border-green-900 bg-green-900/20';
  const nameColor = isActive ? 'text-purple-300' : 'text-green-300';

  return (
    <div className="relative group flex-1 min-w-0">
      <div
        className={`pixel-box p-1 text-center text-[10px] md:text-xs font-bold cursor-help truncate ${chipColor}`}
        title={mInfo.desc}
      >
        {mInfo.name}
      </div>
      <div
        role="tooltip"
        className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-44 md:w-56 p-2 pixel-box bg-[#111] border-yellow-600 text-[10px] md:text-xs text-gray-300 leading-snug opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none z-[100] shadow-lg"
      >
        <div className={`font-bold mb-1 ${nameColor}`}>{mInfo.name}</div>
        <div className="text-gray-400 break-keep">{mInfo.desc}</div>
      </div>
    </div>
  );
}
