/** Effective weapon level with module modifiers (e.g. 웨폰 오버클럭). */
export function getEffectiveWeaponLevel(weapon, player) {
  if (!weapon) return 1;
  const base = weapon.level ?? 1;
  if (!player?.modules?.includes('weapon_overclock')) return base;
  return Math.min(6, base + 2);
}
