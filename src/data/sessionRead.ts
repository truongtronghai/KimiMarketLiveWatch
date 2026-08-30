import type { SessionRead } from './types';
import { getQuote } from './quotes';

function relativeVolumeFactor(): number {
  return 1 + ((1 + Math.sin(20260816)) % 1) * 1.8;
}

function buildMarketBriefs(
  symbol: string,
  price: number,
  changePercent: number,
): string[] {
  const directionLabel = changePercent >= 0 ? 'up' : 'down';
  const magnitude = Math.abs(changePercent).toFixed(2);
  const participationLabel = changePercent >= 0 ? 'participating' : 'lagging';
  const directionWord = changePercent >= 0 ? 'higher' : 'lower';
  return [
    `MARKET BRIEF — ${symbol} last ${price.toFixed(2)}, ${directionLabel} ${magnitude}% on the session. Index futures pointed to a flat open, but semis dragged the tape higher in the first hour: SOXX +3.1%, with NVDA accounting for a third of the move. Breadth is decent — advancers lead decliners roughly 7:4 on the NYSE. The dollar is softer, yields steady at 4.21%. Into the close, watch whether XLK can hold the 2% level; failure there has been the fade signal three sessions running.`,
    `MARKET BRIEF — A two-sided tape. Mega-cap tech is doing the heavy lifting while equal-weight SPX lags cap-weight by 60bp, a sign the rally is narrowing. ${symbol} is ${participationLabel} at ${magnitude}% ${directionWord}. Vol is bid: VIX up 4% to 14.8 despite green indices, which usually means hedging into the weekend rather than genuine fear. Energy is the only sector meaningfully lower, tracking crude below $74.`,
  ];
}

function buildSectorReads(): string[] {
  return [
    `SECTOR READ — Semiconductors are the tape today. SOXX +3.1% on 1.9x relative volume, led by NVDA and AVGO after the hyperscaler capex guide. Options flow shows heavy Aug 30 135-strike call buying in NVDA — roughly 48k contracts by midday, mostly opening. If you're long, the crowd is with you; if you're chasing, note the last three times daily call volume exceeded 500k, the stock marked a local top within five sessions.`,
    `SECTOR READ — Rotation, not risk-on. Tech +2.1% while staples, REITs and energy bleed — that's duration trade, not breadth expansion. Financials quietly making new 52-week highs (JPM, V) is the under-told story; rate curve steepening helps NII into Q4 prints. Watch XLF 52.40 — a close above confirms the rotation has legs.`,
  ];
}

function buildRiskNotes(symbol: string): string[] {
  const impliedMove = (5 + relativeVolumeFactor() * 3).toFixed(1);
  return [
    `RISK NOTES — 1) Positioning: CTA models are estimated 92% long US equities; systematic de-risking triggers sit ~3% below spot. 2) Concentration: top-10 names are 34% of SPX market cap, an all-time high — idiosyncratic risk in a single name is now index risk. 3) ${symbol} earnings implied move is ±${impliedMove}%; realized vol has exceeded implied in 3 of the last 4 prints. This is a simulated analysis for demo purposes — not investment advice.`,
    `RISK NOTES — 1) VIX term structure is flattening fast; front-month premium over second-month has halved in a week, historically a complacency tell. 2) HY spreads at 290bp price near-zero default risk into a refinancing wall. 3) Into FOMC, dealer gamma flips negative below SPX 5,580 — expect amplified moves in both directions around the print. Simulated analysis; not investment advice.`,
  ];
}

function defaultReadSymbol(): string {
  return getQuote('NVDA')?.symbol ?? 'NVDA';
}

export function buildSessionRead(
  symbol: string = defaultReadSymbol(),
): SessionRead {
  const quote =
    getQuote(symbol) ??
    ({ symbol, price: 131.8, changePercent: 0.91 } as const);

  return {
    id: 'read-1',
    title: 'AI Analysis',
    generatedAt: new Date().toISOString(),
    chips: [
      {
        id: 'brief',
        label: 'Market Brief',
        variants: buildMarketBriefs(
          quote.symbol,
          quote.price,
          quote.changePercent,
        ),
      },
      { id: 'move', label: 'Sector Read', variants: buildSectorReads() },
      {
        id: 'risk',
        label: 'Risk Notes',
        variants: buildRiskNotes(quote.symbol),
      },
    ],
  };
}
