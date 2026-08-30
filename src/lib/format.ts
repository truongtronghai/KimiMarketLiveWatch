import type { DirectionValue } from '../data/types';

export function formatLocaleNumber(value: number, fractionDigits = 0): string {
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPrice(value: number, fractionDigits = 2): string {
  return Number(value).toFixed(fractionDigits);
}

export function formatCompact(value: number): string {
  const magnitude = Math.abs(value);
  if (magnitude >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (magnitude >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (magnitude >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return formatLocaleNumber(value);
}

export function formatSignedPercent(value: number, fractionDigits = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(fractionDigits)}%`;
}

export function formatSignedChange(value: number, fractionDigits = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(fractionDigits)}`;
}

export function formatCurrencyCompact(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${formatCompact(Math.abs(Math.round(value)))}`;
}

export function formatCurrencyRounded(value: number): string {
  return `$${formatLocaleNumber(Math.round(value))}`;
}

export function formatSignedCurrencyRounded(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${formatLocaleNumber(Math.abs(Math.round(value)))}`;
}

export function directionClass(value: number): DirectionValue {
  return value >= 0 ? 'up' : 'dn';
}
