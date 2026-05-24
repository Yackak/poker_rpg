export default function EnemyArea({ enemies }) {
  return (
    <div className="h-32 md:h-40 w-full flex items-center justify-center gap-2 p-2 shrink-0 bg-[#111]">
      {enemies.map((enemy, index) => {
        const targetClass = index === 0 ? 'enemy-target' : 'opacity-80 scale-90';
        const nameColor = enemy.isHeal
          ? 'text-green-400'
          : enemy.isModule
            ? 'text-purple-400'
            : 'text-red-400';
        const specialIcon = enemy.isHeal ? (
          <span className="absolute top-1 left-1 text-green-400 text-xs animate-pulse">✚</span>
        ) : enemy.isModule ? (
          <span className="absolute top-1 right-1 text-purple-400 text-xs animate-pulse">⚙️</span>
        ) : null;

        const stats = [];
        if (enemy.armor > 0) stats.push(<span key="a" className="text-blue-300">방어 {enemy.armor}</span>);
        if (enemy.str > 0) stats.push(<span key="s" className="text-red-300">힘 {enemy.str}</span>);
        if (enemy.status.burn > 0) stats.push(<span key="b" className="text-orange-500">🔥{enemy.status.burn}</span>);
        if (enemy.status.stun) stats.push(<span key="st" className="text-yellow-400">💫기절</span>);

        return (
          <div
            key={`${enemy.id}-${index}`}
            className={`enemy-card pixel-box flex-1 max-w-[150px] p-2 flex flex-col items-center justify-center relative ${targetClass}`}
          >
            {specialIcon}
            <div className={`text-xs md:text-sm font-bold ${nameColor} text-center leading-tight mb-1`}>
              {enemy.name}
            </div>
            <div className="w-full bg-gray-800 h-2 md:h-3 border border-gray-600 relative mt-1">
              <div
                className="h-full bg-red-600 transition-all"
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-300 mt-1">
              {enemy.hp}/{enemy.maxHp}
            </div>
            {stats.length > 0 && (
              <div className="text-[10px] mt-1 flex gap-1 flex-wrap justify-center">{stats}</div>
            )}
            <div className="absolute -bottom-3 bg-[#333] border border-gray-500 px-2 py-0.5 text-xs text-yellow-300 rounded shadow-md">
              ?
            </div>
          </div>
        );
      })}
    </div>
  );
}
