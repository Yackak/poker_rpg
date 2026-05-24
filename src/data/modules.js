export const MODULES_DB = {
  spade_loader: {
    id: 'spade_loader',
    name: '지정 칩',
    type: 'passive',
    desc: '턴 시작 시, 덱에서 스페이드 1장 확정 드로우',
  },
  holo_clone: {
    id: 'holo_clone',
    name: '홀로그램 복제기',
    type: 'passive',
    desc: '턴 시작 시, 손패의 무작위 카드 1장 복제 (턴 종료 시 소멸)',
  },
  emergency_exit: {
    id: 'emergency_exit',
    name: '비상 탈출구',
    type: 'passive',
    desc: '턴 중 손패가 0장이 되면 즉시 3장 드로우 (전투당 1회)',
  },
  joker_chip: {
    id: 'joker_chip',
    name: '조커 칩',
    type: 'active',
    desc: '매 턴 1회, 손패 1장의 문양 변환',
  },
  tuning: {
    id: 'tuning',
    name: '위상 조율기',
    type: 'active',
    desc: '매 턴 1회, 손패 1장의 숫자 +1/-1 조율',
  },
  kings_decree: {
    id: 'kings_decree',
    name: '왕의 칙령',
    type: 'passive',
    desc: '매 턴 처음으로 내는 5는 K로 취급됨 (효과/엔진 모두 적용)',
  },
  reroll_battery: {
    id: 'reroll_battery',
    name: '리롤 배터리',
    type: 'passive',
    desc: '리롤 사용 시 50% 확률로 리롤권 +1 획득',
  },
  keep_slot: {
    id: 'keep_slot',
    name: '킵 슬롯',
    type: 'passive',
    desc: '손패 외 카드 1장 영구 보관 슬롯 제공',
  },
  overload_chip: {
    id: 'overload_chip',
    name: '과부하 칩',
    type: 'active',
    desc: '리롤권 1회 획득 (다음 턴 시작 드로우 5장 제한, 쿨 2턴)',
  },
  minimalist: {
    id: 'minimalist',
    name: '미니멀리스트',
    type: 'passive',
    desc: '턴 종료 시 손패가 3장 미만이면 다음 턴에 하트 3 확정 획득',
  },
  one_way: {
    id: 'one_way',
    name: '외길 인생',
    type: 'passive',
    desc: '리롤 최대 1장 제한, 대신 모든 무기 족보 필요수 -1',
  },
};
