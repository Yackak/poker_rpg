import { useCallback } from 'react';
import {
  generateModuleRewards,
  generateWeaponRewards,
  applyWeaponReward,
  applyModuleReward,
} from '../game/rewardLogic';
import { replaceModule } from '../game/moduleLogic';
import { swapModuleToEquipped, swapModuleToInventory } from '../game/moduleLogic';
import { GAME_STATES, MAX_STAGE } from '../game/constants';

export function useRewardHandlers(player, meta, setPlayer, setMeta, log, startStage) {
  const openVictory = useCallback(
    (moduleDrop) => {
      const options = moduleDrop
        ? generateModuleRewards(player).map((m) => ({ type: 'module', id: m.id, data: m }))
        : generateWeaponRewards(player, meta.stage).map((o) => ({ ...o }));
      setMeta((m) => ({
        ...m,
        gameState: GAME_STATES.REWARD,
        modal: 'reward',
        rewardOptions: options,
      }));
    },
    [player, meta.stage, setMeta]
  );

  const finishReward = useCallback(() => {
    setMeta((m) => ({ ...m, modal: 'module_manage', gameState: GAME_STATES.MODULE_MANAGEMENT }));
  }, [setMeta]);

  const backToReward = useCallback(() => {
    setMeta((m) => ({
      ...m,
      modal: 'reward',
      choiceContext: null,
      pendingNewWeapon: null,
    }));
  }, [setMeta]);

  const skipReward = useCallback(() => {
    log('보상을 건너뛰었습니다.', 'system');
    finishReward();
  }, [log, finishReward]);

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
          finishReward();
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
    [log, finishReward, setMeta, setPlayer]
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
      finishReward();
    },
    [meta.pendingNewModule, log, finishReward, setMeta, setPlayer]
  );

  const abandonModule = useCallback(() => {
    log('모듈 획득을 포기했습니다.', 'system');
    setMeta((m) => ({ ...m, pendingNewModule: null, choiceContext: null }));
    finishReward();
  }, [log, finishReward, setMeta]);

  const finishModuleManagement = useCallback(() => {
    const nextStage = meta.stage + 1;
    if (nextStage > MAX_STAGE) {
      alert('모든 스테이지 클리어!');
      window.location.reload();
      return;
    }
    setMeta((m) => ({ ...m, modal: null }));
    startStage(nextStage);
  }, [meta.stage, startStage, setMeta]);

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
