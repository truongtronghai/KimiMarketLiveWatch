import { useEffect, useState } from 'react';

export interface MarketStatus {
  clock: string;
  isOpen: boolean;
  label: 'OPEN' | 'PRE-MKT' | 'CLOSED';
}

const SESSION_OPEN_MINUTES = 9 * 60 + 30;
const SESSION_CLOSE_MINUTES = 16 * 60;

function easternWallTime(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
  );
}

function computeStatus(): MarketStatus {
  const now = easternWallTime();
  const minutesOfDay = now.getHours() * 60 + now.getMinutes();
  const dayOfWeek = now.getDay();
  const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
  const isOpen =
    isWeekday &&
    minutesOfDay >= SESSION_OPEN_MINUTES &&
    minutesOfDay < SESSION_CLOSE_MINUTES;
  const isPreMarket = isWeekday && minutesOfDay < SESSION_OPEN_MINUTES;
  return {
    clock: now.toTimeString().slice(0, 8),
    isOpen,
    label: isOpen ? 'OPEN' : isPreMarket ? 'PRE-MKT' : 'CLOSED',
  };
}

export function useMarketStatus(): MarketStatus {
  const [status, setStatus] = useState<MarketStatus>(computeStatus);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setStatus(computeStatus()),
      1000,
    );
    return () => window.clearInterval(intervalId);
  }, []);

  return status;
}
