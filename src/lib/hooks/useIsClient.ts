import { useEffect, useState } from 'react';

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Verifica se estamos no navegador
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  return isClient;
} 