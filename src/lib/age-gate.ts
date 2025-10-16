'use client';

import { useEffect, useState } from 'react';

const COOKIE_KEY = 'erotic_allowed';

export function useEroticAccess() {
  const [allowed, setAllowed] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const match = document.cookie.split('; ').find((chunk) => chunk.startsWith(`${COOKIE_KEY}=`));
    if (match) {
      const value = match.split('=')[1];
      setAllowed(value === 'true');
    }
    setChecked(true);
  }, []);

  const permit = () => {
    document.cookie = `${COOKIE_KEY}=true; path=/; max-age=${60 * 60 * 24 * 30}`;
    setAllowed(true);
  };

  return { allowed, checked, permit };
}
