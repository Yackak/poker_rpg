export const WEAPONS_DB = {
  greatsword: {
    name: '대검',
    reqType: 'straight',
    reqCount: 4,
    baseDmg: 10,
    effectDesc: (lv) => (lv === 1 ? '특수 효과 없음' : `출혈 ${lv - 1}스택 부여`),
  },
  thorn: {
    name: '가시검',
    reqType: 'flush',
    reqCount: 3,
    baseDmg: 8,
    effectDesc: (lv) => (lv === 1 ? '특수 효과 없음' : `치명타 확률 ${10 * (lv - 1)}% (피해 2배)`),
  },
  club: {
    name: '대왕 몽둥이',
    reqType: 'triple',
    reqCount: 3,
    baseDmg: 12,
    effectDesc: (lv) => (lv === 1 ? '특수 효과 없음' : `기절 확률 ${10 + (lv - 2) * 15}% (다음 턴 스킵)`),
  },
  eclipse: {
    name: '이클립스',
    reqType: 'straight',
    reqCount: 3,
    baseDmg: 9,
    effectDesc: (lv) => (lv === 1 ? '특수 효과 없음' : `화상 ${lv - 1}스택 부여`),
  },
  axe: {
    name: '광전사의 도끼',
    reqType: 'pair',
    reqCount: 1,
    baseDmg: 5,
    effectDesc: (lv) => (lv === 1 ? '특수 효과 없음' : `가한 피해의 ${15 + (lv - 2) * 5}% 체력 회복`),
  },
};

export function getReqLabel(type) {
  if (type === 'straight') return '스트레이트';
  if (type === 'flush') return '플러시';
  if (type === 'triple') return '트리플';
  return '페어';
}
