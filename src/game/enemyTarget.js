export function normalizeSelectedEnemyIndex(enemies, index = 0) {
  if (!enemies?.length) return 0;

  if (index >= 0 && index < enemies.length && enemies[index].hp > 0) {
    return index;
  }

  const firstAlive = enemies.findIndex((e) => e.hp > 0);
  return firstAlive >= 0 ? firstAlive : 0;
}
