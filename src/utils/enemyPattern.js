export function formatPatternStep(act, enemyStr = 0) {
  if (act.type === 'attack') {
    const bonus = enemyStr > 0 ? ` (+${enemyStr} 힘)` : '';
    return `공격 ${act.val}${bonus}`;
  }
  if (act.type === 'defend') return `방어 +${act.val}`;
  if (act.type === 'buff') return `힘 +${act.val}`;
  return '휴식';
}

export function getNextPatternIndex(enemy) {
  return enemy.turnIdx % enemy.pattern.length;
}

export function getNextIntentLabel(enemy) {
  const act = enemy.pattern[getNextPatternIndex(enemy)];
  return formatPatternStep(act, enemy.str);
}

export function buildPatternTooltipLines(enemy) {
  const nextIdx = getNextPatternIndex(enemy);
  return enemy.pattern.map((act, i) => ({
    label: formatPatternStep(act, i === nextIdx ? enemy.str : 0),
    isNext: i === nextIdx,
  }));
}
