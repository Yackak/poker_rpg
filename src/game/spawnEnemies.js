import { MONSTERS, ENCOUNTERS } from '../data/monsters';
import { BOSS_ROUND } from './constants';

export function getStageDifficulty(stage) {
  if (stage <= 3) return 1;
  if (stage <= 7) return 2;
  if (stage <= 10) return 3;
  return 4;
}

function buildEnemy(mId, index, spawnList, hasModuleEnemy, hasHealEnemy) {
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
    isBoss: false,
  };

  if (hasHealEnemy && index === spawnList.length - 1) {
    enemy.isHeal = true;
    enemy.name = `축복받은 ${enemy.name}`;
  } else if (hasModuleEnemy && index === spawnList.length - 1) {
    enemy.isModule = true;
    enemy.name = `코어를 품은 ${enemy.name}`;
  }

  return enemy;
}

function spawnBoss(stage) {
  const bossId = 'knight';
  const base = MONSTERS[bossId];
  const hpScale = 1 + (stage - 1) * 0.15;
  const bossHp = Math.floor(base.maxHp * hpScale);

  return [
    {
      id: bossId,
      name: `스테이지 ${stage} · ${base.name}`,
      hp: bossHp,
      maxHp: bossHp,
      pattern: base.pattern,
      turnIdx: 0,
      status: { burn: 0, stun: false, bleed: 0 },
      armor: 0,
      str: 0,
      isHeal: false,
      isModule: false,
      isBoss: true,
    },
  ];
}

export function spawnEnemies(stage, round) {
  if (round >= BOSS_ROUND) {
    return spawnBoss(stage);
  }

  const diff = getStageDifficulty(stage);
  const table = ENCOUNTERS[diff];
  const spawnList = table[Math.floor(Math.random() * table.length)];

  const hasModuleEnemy = Math.random() < 0.3;
  const hasHealEnemy = Math.random() < 0.1 && !hasModuleEnemy;

  return spawnList.map((mId, index) =>
    buildEnemy(mId, index, spawnList, hasModuleEnemy, hasHealEnemy)
  );
}

export function isBossRound(round) {
  return round >= BOSS_ROUND;
}
