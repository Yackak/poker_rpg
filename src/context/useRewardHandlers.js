import { useCallback } from 'react';
import {
  buildVictoryRewards,
  applyWeaponReward,
  applyModuleReward,
  advanceTierWeightsAfterBattle,
} from '../game/rewardLogic';
import { replaceModule } from '../game/moduleLogic';
import { swapModuleToEquipped, swapModuleToInventory } from '../game/moduleLogic';
import { GAME_STATES, MAX_STAGE, ROUNDS_PER_STAGE } from '../game/constants';
import { isBossRound } from '../game/spawnEnemies';

function toModuleManageMeta(m) {
  return { ...m, modal: 'module_manage', gameState: GAME_STATES.MODULE_MANAGEMENT };
}

function toWeaponPhaseMeta(m) {
  return {
    ...m,
    rewardPhase: 'weapon',
    rewardOptions: m.weaponRewardOptions,
  };
}

function shouldOfferWeaponBonus(m) {
  return m.weaponBonusEarned && m.weaponRewardOptions?.length > 0;
}

export function useRewardHandlers(player, meta, setPlayer, setMeta, log, startRound) {
  const finishReward = useCallback(() => {
    setMeta((m) => toModuleManageMeta(m));
  }, [setMeta]);

  const advanceAfterModule = useCallback(() => {
    setMeta((m) => (shouldOfferWeaponBonus(m) ? toWeaponPhaseMeta(m) : toModuleManageMeta(m)));
  }, [setMeta]);

  const openVictory = useCallback(
    (weaponBonus) => {
      const bossVictory = isBossRound(meta.round);
      const tierUpdate = advanceTierWeightsAfterBattle(
        meta.battlesSinceTierShift,
        meta.moduleTierWeights,
        bossVictory
      );

      const { moduleOptions, weaponOptions } = buildVictoryRewards(
        player,
        meta.stage,
        weaponBonus,
        { isBossVictory: bossVictory, tierWeights: tierUpdate.moduleTierWeights }
      );

      const baseMeta = {
        gameState: GAME_STATES.REWARD,
        modal: 'reward',
        weaponBonusEarned: weaponBonus,
        moduleRewardOptions: moduleOptions,
        weaponRewardOptions: weaponOptions,
        choiceContext: null,
        pendingNewWeapon: null,
        pendingNewModule: null,
        isBossVictory: bossVictory,
        ...tierUpdate,
      };

      if (moduleOptions.length === 0 && weaponOptions.length === 0) {
        setMeta((m) => toModuleManageMeta({ ...m, ...baseMeta }));
        return;
      }

      if (moduleOptions.length === 0) {
        setMeta((m) => ({
          ...m,
          ...baseMeta,
          rewardPhase: 'weapon',
          rewardOptions: weaponOptions,
        }));
        return;
      }

      setMeta((m) => ({
        ...m,
        ...baseMeta,
        rewardPhase: 'module',
        rewardOptions: moduleOptions,
      }));
    },
    [player, meta.stage, meta.round, meta.battlesSinceTierShift, meta.moduleTierWeights, setMeta]
  );

  const backToReward = useCallback(() => {
    setMeta((m) => ({
      ...m,
      modal: 'reward',
      choiceContext: null,
      pendingNewWeapon: null,
      rewardPhase: m.weaponBonusEarned && m.weaponRewardOptions?.length ? 'weapon' : 'module',
      rewardOptions:
        m.weaponBonusEarned && m.weaponRewardOptions?.length
          ? m.weaponRewardOptions
          : m.moduleRewardOptions,
    }));
  }, [setMeta]);

  const skipReward = useCallback(() => {
    if (meta.rewardPhase === 'weapon') {
      log('무기 보너스를 건너뛰었습니다.', 'system');
      finishReward();
      return;
    }
    log('모듈 보상을 건너뛰었습니다.', 'system');
    advanceAfterModule();
  }, [meta.rewardPhase, log, finishReward, advanceAfterModule]);

  const pickReward = useCallback(
    (option) => {
      if (option.type === 'module') {
        setPlayer((p) => {
          const copy = structuredClone(p);
          const result = applyModuleReward(copy, option.id, log);
          if (result.needsReplace) {
            setMeta((m) => ({
              ...m,
              modal: 'choice',
              choiceContext: 'module',
              pendingNewModule: option.id,
            }));
            return copy;
          }
          advanceAfterModule();
          return copy;
        });
        return;
      }

      if (option.type === 'upgrade') {
        setPlayer((p) => {
          const copy = structuredClone(p);
          applyWeaponReward(copy, 'upgrade', option.weaponId, log);
          return copy;
        });
        finishReward();
        return;
      }

      if (option.type === 'new_weapon') {
        const newWeapon = { id: option.weaponId, level: option.level };
        setPlayer((p) => {
          const copy = structuredClone(p);
          const result = applyWeaponReward(copy, 'new_weapon', newWeapon, log);
          if (result.needsReplace) {
            setMeta((m) => ({
              ...m,
              modal: 'choice',
              choiceContext: 'weapon',
              pendingNewWeapon: newWeapon,
            }));
            return copy;
          }
          finishReward();
          return copy;
        });
      }
    },
    [log, finishReward, advanceAfterModule, setMeta, setPlayer]
  );

  const replaceWeapon = useCallback(
    (index) => {
      setPlayer((p) => {
        const copy = structuredClone(p);
        const newW = meta.pendingNewWeapon;
        copy.weapons.splice(index, 1);
        copy.weapons.push(newW);
        log('무기 교체 완료.', 'system');
        return copy;
      });
      setMeta((m) => ({ ...m, pendingNewWeapon: null, choiceContext: null }));
      finishReward();
    },
    [meta.pendingNewWeapon, log, finishReward, setMeta, setPlayer]
  );

  const replaceModuleChoice = useCallback(
    (item) => {
      setPlayer((p) => {
        const copy = structuredClone(p);
        replaceModule(copy, item, meta.pendingNewModule, log);
        return copy;
      });
      setMeta((m) => ({ ...m, pendingNewModule: null, choiceContext: null }));
      advanceAfterModule();
    },
    [meta.pendingNewModule, log, advanceAfterModule, setMeta, setPlayer]
  );

  const abandonModule = useCallback(() => {
    log('모듈 획득을 포기했습니다.', 'system');
    setMeta((m) => ({ ...m, pendingNewModule: null, choiceContext: null }));
    advanceAfterModule();
  }, [log, advanceAfterModule, setMeta]);

  const finishModuleManagement = useCallback(() => {
    let nextStage = meta.stage;
    let nextRound = meta.round + 1;

    if (nextRound > ROUNDS_PER_STAGE) {
      nextStage = meta.stage + 1;
      nextRound = 1;
      if (nextStage > MAX_STAGE) {
        alert('모든 스테이지 클리어!');
        window.location.reload();
        return;
      }
    }

    setMeta((m) => ({ ...m, modal: null }));
    startRound(nextStage, nextRound);
  }, [meta.stage, meta.round, startRound, setMeta]);

  const toggleModuleEquip = useCallback(
    (source, index, modId) => {
      setPlayer((p) => {
        const copy = structuredClone(p);
        if (source === 'equipped') swapModuleToInventory(copy, modId, index);
        else swapModuleToEquipped(copy, index);
        return copy;
      });
    },
    [setPlayer]
  );

  return {
    openVictory,
    skipReward,
    pickReward,
    replaceWeapon,
    replaceModuleChoice,
    abandonModule,
    backToReward,
    finishModuleManagement,
    toggleModuleEquip,
  };
}
