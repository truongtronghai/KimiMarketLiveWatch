import type { Quote } from '../../data/types';
import {
  directionClass,
  formatPrice,
  formatSignedPercent,
} from '../../lib/format';

interface QuoteTapeProps {
  quotes: Quote[];
  onSelectQuote?: (quote: Quote) => void;
}

export function QuoteTape({ quotes, onSelectQuote }: QuoteTapeProps) {
  if (quotes.length === 0) {
    return (
      <div className="tape" data-testid="quote-tape">
        <span className="empty">Waiting for quote feed…</span>
      </div>
    );
  }

  const laneItems = [0, 1].flatMap((copyIndex) =>
    quotes.map((quote) => (
      <span
        className="tk"
        key={`${quote.symbol}-${copyIndex}`}
        data-testid="quote-tape-item"
        onClick={() => onSelectQuote?.(quote)}
      >
        <span className="nm">{quote.symbol}</span>
        <span className={directionClass(quote.change)}>
          {formatPrice(quote.price)}
        </span>
        <span className={directionClass(quote.change)}>
          {formatSignedPercent(quote.changePercent)}
        </span>
      </span>
    )),
  );

  return (
    <div className="tape" data-testid="quote-tape">
      <div className="lane" data-testid="quote-tape-lane">
        {laneItems}
      </div>
    </div>
  );
}
