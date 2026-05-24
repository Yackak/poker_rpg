import { MONSTERS, ENCOUNTERS } from '../data/monsters';

export function getStageDifficulty(stage) {
  if (stage <= 3) return 1;
  if (stage <= 7) return 2;
  if (stage <= 10) return 3;
  return 4;
}

export function spawnEnemies(stage) {
  const diff = getStageDifficulty(stage);
  const table = ENCOUNTERS[diff];
  const spawnList = table[Math.floor(Math.random() * table.length)];

  const hasModuleEnemy = Math.random() < 0.3;
  const hasHealEnemy = Math.random() < 0.1 && !hasModuleEnemy;

  return spawnList.map((mId, index) => {
    const base = MONSTERS[mId];
    const enemy = {
      id: mId,
      name: base.name,
      hp: base.maxHp,
      maxHp: base.maxHp,
      pattern: base.pattern,
      turnIdx: 0,
      status: { burn: 0, stun: false, bleed: 0 },
      armor: 0,
      str: 0,
      isHeal: false,
      isModule: false,
    };

    if (hasHealEnemy && index === spawnList.length - 1) {
      enemy.isHeal = true;
      enemy.name = `축복받은 ${enemy.name}`;
    } else if (hasModuleEnemy && index === spawnList.length - 1) {
      enemy.isModule = true;
      enemy.name = `코어를 품은 ${enemy.name}`;
    }

    return enemy;
  });
}
