export const MAX_STAGE = 10;

export const GAME_STATES = {
  START: 'START',
  PLAYER_TURN: 'PLAYER_TURN',
  ENEMY_TURN: 'ENEMY_TURN',
  REWARD: 'REWARD',
  MODULE_MANAGEMENT: 'MODULE_MANAGEMENT',
  GAMEOVER: 'GAMEOVER',
};

export const START_WEAPONS = ['club', 'thorn', 'eclipse'];

export const START_MODULES = ['minimalist', 'emergency_exit'];

export function createCombatState() {
  return {
    emergencyUsed: false,
    overloadCooldown: 0,
    drawPenalty: 0,
    minimalistHeart: false,
    firstFiveUsedThisTurn: false,
    activeModulesUsed: {},
    turnCounter: 0,
    attackedLastTurn: false,
    attackedThisTurn: false,
    rerollUsedThisTurn: false,
    saveProtocolBonus: 0,
    firstRerollFreeUsed: false,
    rerollDiscardCount: 0,
    handsCompletedThisTurn: 0,
    emptyHandPanicUsedThisTurn: false,
    flushDamageBonus: 0,
    pendingDelayDraw: 0,
    combatDrawUsed: false,
    cardsUsedThisTurn: [],
  };
}

export function createPlayer(overrides = {}) {
  return {
    hp: 60,
    maxHp: 60,
    weapons: [],
    modules: [],
    inventoryModules: [],
    deck: [],
    discard: [],
    hand: [],
    keepSlot: null,
    selectedCardIndices: [],
    rerolls: 0,
    baseRerolls: 1,
    status: { bleed: 0 },
    shield: 0,
    combatState: createCombatState(),
    ...overrides,
  };
}
