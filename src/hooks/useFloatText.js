import { useCallback, useState } from 'react';

export function useFloatText() {
  const [floats, setFloats] = useState([]);

  const showFloatText = useCallback((text, x, y, color) => {
    const id = crypto.randomUUID();
    setFloats((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  }, []);

  return { floats, showFloatText };
}
