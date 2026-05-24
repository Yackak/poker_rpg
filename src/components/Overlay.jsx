import { useGame } from '../context/GameContext';
import StartChoiceModal from './modals/StartChoiceModal';
import RewardModal from './modals/RewardModal';
import ChoiceModal from './modals/ChoiceModal';
import ModuleManageModal from './modals/ModuleManageModal';
import GameOverModal from './modals/GameOverModal';

export default function Overlay() {
  const { meta } = useGame();
  const show = Boolean(meta.modal);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
      <StartChoiceModal />
      <RewardModal />
      <ChoiceModal />
      <ModuleManageModal />
      <GameOverModal />
    </div>
  );
}
