import type { IndexQuotation } from '../../data/types';
import {
  directionClass,
  formatLocaleNumber,
  formatSignedChange,
  formatSignedPercent,
} from '../../lib/format';

interface IndexStripProps {
  indexes: IndexQuotation[];
  selectedIndexId?: string;
  onSelectIndex?: (index: IndexQuotation) => void;
  onNotifyDemo?: (message: string) => void;
}

export function IndexStrip({
  indexes,
  selectedIndexId,
  onSelectIndex,
  onNotifyDemo,
}: IndexStripProps) {
  if (indexes.length === 0) {
    return (
      <div className="idx-strip" data-testid="index-strip">
        <span className="empty">No indexes available</span>
      </div>
    );
  }

  return (
    <div className="idx-strip" data-testid="index-strip">
      {indexes.map((index) => {
        const levelClass = directionClass(index.changePercent);
        return (
          <div
            className={`idx${selectedIndexId === index.id ? ' on' : ''}`}
            key={index.id}
            data-testid={`index-${index.symbol}`}
            title={`${index.name} · ${formatSignedChange(index.change)}`}
            onClick={() => {
              onSelectIndex?.(index);
              onNotifyDemo?.('Index detail is a demo placeholder');
            }}
          >
            <span className="nm">{index.symbol}</span>
            <span className={`pv ${levelClass}`}>
              {formatLocaleNumber(index.level, 2)}
            </span>
            <span className={`pc ${levelClass}`}>
              {formatSignedPercent(index.changePercent)}
              <small>{formatSignedChange(index.change)}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
