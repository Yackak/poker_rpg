import { useCallback, useRef, useState } from 'react';

const MAX_LOG = 15;

export function useCombatLog() {
  const [logs, setLogs] = useState([]);
  const idRef = useRef(0);

  const log = useCallback((msg, type = 'normal') => {
    idRef.current += 1;
    setLogs((prev) => {
      const next = [...prev, { id: idRef.current, msg, type }];
      return next.length > MAX_LOG ? next.slice(-MAX_LOG) : next;
    });
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, log, clearLogs };
}

export function getLogClass(type) {
  if (type === 'system') return 'text-yellow-400';
  if (type === 'damage') return 'text-red-400 font-bold';
  if (type === 'heal') return 'text-green-400';
  if (type === 'enemy') return 'text-purple-300';
  return 'text-gray-300';
}
