import { shuffle } from './shuffle';

const SUITS = ['♠', '♥', '♦', '♣'];
const NUMBERS = [1, 2, 3, 4, 5, 'K'];

export function generateDeck() {
  const deck = [];
  for (let i = 0; i < 2; i++) {
    SUITS.forEach((suit) => {
      NUMBERS.forEach((num) => {
        deck.push({ suit, num, id: crypto.randomUUID() });
      });
    });
  }
  for (let i = 0; i < 4; i++) {
    deck.push({
      suit: SUITS[Math.floor(Math.random() * SUITS.length)],
      num: NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
      id: crypto.randomUUID(),
    });
  }
  return shuffle(deck);
}

export function drawFromDeck(player) {
  if (player.deck.length === 0) {
    if (player.discard.length === 0) return { drawn: [], reshuffled: false };
    player.deck = shuffle([...player.discard]);
    player.discard = [];
    return { drawn: [], reshuffled: true };
  }
  return { drawn: [player.deck.pop()], reshuffled: false };
}

export function drawCards(player, amount) {
  const drawn = [];
  let reshuffled = false;
  for (let i = 0; i < amount; i++) {
    const result = drawFromDeck(player);
    if (result.reshuffled) reshuffled = true;
    if (result.drawn.length === 0) break;
    drawn.push(...result.drawn);
  }
  return { drawn, reshuffled };
}

export function getSuitClass(suit) {
  if (suit === '♠') return 'suit-spade';
  if (suit === '♥') return 'suit-heart';
  if (suit === '♦') return 'suit-diamond';
  return 'suit-club';
}
