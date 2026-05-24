export function processSingleEnemyTurn(enemy, player, log) {
  const events = [];

  if (enemy.status.burn > 0) {
    enemy.hp -= enemy.status.burn;
    events.push({
      type: 'burn',
      enemy,
      damage: enemy.status.burn,
    });
    log(`${enemy.name} 화상 데미지 ${enemy.status.burn}`, 'damage');
    enemy.status.burn--;
    if (enemy.hp <= 0) return { events, died: true, skipped: false };
  }

  if (enemy.status.stun) {
    log(`${enemy.name}은(는) 기절해 있습니다. 턴 스킵.`, 'system');
    enemy.status.stun = false;
    return { events, died: false, skipped: true };
  }

  const act = enemy.pattern[enemy.turnIdx % enemy.pattern.length];
  enemy.turnIdx++;

  if (act.type === 'attack') {
    let finalDmg = act.val + enemy.str;
    if (enemy.status.bleed > 0) {
      finalDmg += enemy.status.bleed;
      log(`${enemy.name}의 출혈로 추가 데미지 발생.`, 'system');
    }
    player.hp -= finalDmg;
    events.push({ type: 'attack', enemy, damage: finalDmg });
    log(`${enemy.name}의 공격! 플레이어에게 ${finalDmg} 피해.`, 'enemy');
  } else if (act.type === 'defend') {
    enemy.armor += act.val;
    log(`${enemy.name}이(가) 방어도를 ${act.val} 얻었습니다.`, 'enemy');
  } else if (act.type === 'buff') {
    enemy.str += act.val;
    log(`${enemy.name}이(가) 힘을 ${act.val} 얻었습니다.`, 'enemy');
  } else {
    log(`${enemy.name}은(는) 쉬고 있습니다.`, 'enemy');
  }

  return { events, died: false, skipped: false };
}

export function handleEnemyDeath(dead, player, log) {
  const result = { moduleDrop: false, healAmount: 0 };
  log(`${dead.name} 처치!`, 'system');

  if (dead.isHeal) {
    result.healAmount = Math.floor(player.maxHp * 0.2);
    player.hp = Math.min(player.maxHp, player.hp + result.healAmount);
    log(`[회복 몬스터 처치] 체력을 ${result.healAmount} 회복했습니다!`, 'heal');
  }
  if (dead.isModule) {
    result.moduleDrop = true;
    log('[모듈 몬스터 처치] 전투 종료 시 모듈을 획득합니다!', 'system');
  }

  return result;
}
