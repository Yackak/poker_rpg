export const MONSTERS = {
  fly_bug: { name: '비행 벌레', maxHp: 20, pattern: [{ type: 'rest' }, { type: 'attack', val: 10 }] },
  lizard: { name: '도마뱀', maxHp: 10, pattern: [{ type: 'rest' }, { type: 'attack', val: 4 }] },
  slime: { name: '슬라임', maxHp: 4, pattern: [{ type: 'attack', val: 2 }] },
  rock_bug: {
    name: '바위 벌레',
    maxHp: 30,
    pattern: [{ type: 'defend', val: 5 }, { type: 'attack', val: 7 }, { type: 'buff', val: 2 }],
  },
  vine_bug: {
    name: '덩굴 벌레',
    maxHp: 17,
    pattern: [
      { type: 'attack', val: 3 },
      { type: 'buff', val: 2 },
      { type: 'attack', val: 3 },
      { type: 'buff', val: 2 },
      { type: 'rest' },
    ],
  },
  orc: {
    name: '오크',
    maxHp: 42,
    pattern: [{ type: 'defend', val: 12 }, { type: 'rest' }, { type: 'attack', val: 15 }],
  },
  rat: { name: '쥐', maxHp: 15, pattern: [{ type: 'attack', val: 3 }] },
  knight: { name: '기사(보스)', maxHp: 100, pattern: [{ type: 'attack', val: 7 }] },
};

export const ENCOUNTERS = {
  1: [['fly_bug', 'lizard', 'lizard']],
  2: [['fly_bug', 'lizard', 'lizard'], ['slime', 'lizard', 'fly_bug']],
  3: [['rock_bug'], ['vine_bug', 'vine_bug'], ['orc'], ['rat', 'rat', 'rat']],
  4: [['knight']],
};
