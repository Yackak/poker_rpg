import { GameProvider } from './context/GameProvider';
import GameLayout from './components/GameLayout';

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
