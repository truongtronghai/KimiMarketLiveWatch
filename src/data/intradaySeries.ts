import type { IntradaySeries } from './types';
import { getQuote } from './quotes';

const SESSION_START_MINUTES = 9 * 60 + 30;
const SESSION_END_MINUTES = 16 * 60;

function buildSessionLabels(): string[] {
  const labels: string[] = [];
  const totalMinutes = SESSION_END_MINUTES - SESSION_START_MINUTES;
  for (let elapsed = 0; elapsed <= totalMinutes; elapsed += 1) {
    const clockMinutes = SESSION_START_MINUTES + elapsed;
    const hour = Math.floor(clockMinutes / 60);
    const minute = clockMinutes % 60;
    labels.push(
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    );
  }
  return labels;
}

export const SESSION_LABELS: string[] = buildSessionLabels();

function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 2147483647;
    return state / 2147483647;
  };
}

function currentEasternWallTime(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
  );
}

function buildSeriesStartDate(): Date {
  const start = currentEasternWallTime();
  start.setHours(9, 30, 0, 0);
  return start;
}

function sessionProgressInMinutes(): number {
  const now = currentEasternWallTime();
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < SESSION_START_MINUTES) {
    return 0;
  }
  if (minutes >= SESSION_END_MINUTES) {
    return SESSION_LABELS.length;
  }
  return minutes - SESSION_START_MINUTES;
}

function buildWalk(
  symbol: string,
): Omit<IntradaySeries, 'points'> & { points: IntradaySeries['points'] } {
  const quote = getQuote(symbol);
  const previousClose = quote?.previousClose ?? 100;
  const sessionChangePercent = quote?.changePercent ?? 0;
  const random = seededRandom(
    symbol.charCodeAt(0) * 131 + symbol.charCodeAt(symbol.length - 1) * 17,
  );
  const startDate = buildSeriesStartDate();
  const prices: number[] = [];
  const volumes: number[] = [];
  const vwaps: number[] = [];
  let price = previousClose;
  let volumeSum = 0;
  let notionalSum = 0;

  SESSION_LABELS.forEach((_label, index) => {
    price *=
      1 +
      (random() - 0.5) * 0.0021 +
      (index < 14 ? sessionChangePercent / 100 / 14 : 0);
    const volume = Math.round(900 + random() * 5200 * (index < 9 ? 2.4 : 1));
    prices.push(Number(price.toFixed(2)));
    volumes.push(volume);
    volumeSum += volume;
    notionalSum += price * volume;
    vwaps.push(Number((notionalSum / volumeSum).toFixed(2)));
  });

  return {
    symbol,
    previousClose,
    points: SESSION_LABELS.map((_label, index) => {
      const pointDate = new Date(startDate.getTime() + index * 60_000);
      return {
        timestamp: pointDate.toISOString(),
        price: prices[index],
        volume: volumes[index],
        vwap: vwaps[index],
      };
    }),
  };
}

const WALK_CACHE = new Map<
  string,
  Omit<IntradaySeries, 'points'> & { points: IntradaySeries['points'] }
>();

export function getIntradaySeries(symbol: string): IntradaySeries {
  if (!WALK_CACHE.has(symbol)) {
    WALK_CACHE.set(symbol, buildWalk(symbol));
  }
  const walk = WALK_CACHE.get(symbol)!;
  const progressed = Math.max(
    24,
    Math.min(
      SESSION_LABELS.length,
      sessionProgressInMinutes() || SESSION_LABELS.length,
    ),
  );
  return {
    symbol: walk.symbol,
    previousClose: walk.previousClose,
    points: walk.points.slice(0, progressed),
  };
}
