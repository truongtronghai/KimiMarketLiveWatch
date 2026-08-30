import type { CSSProperties } from 'react';
import type { Sector } from '../../data/types';
import { formatSignedPercent } from '../../lib/format';

interface SectorFlowsProps {
  sectors: Sector[];
  isError?: boolean;
  isLoading?: boolean;
  onNotifyDemo?: (message: string) => void;
}

export function SectorFlows({
  sectors,
  isError,
  isLoading,
  onNotifyDemo,
}: SectorFlowsProps) {
  return (
    <section data-testid="sector-heat-panel">
      <div className="ph">
        <h2>Sector Heat</h2>
        <span className="tail">GICS · 1D %</span>
      </div>
      {isLoading && sectors.length === 0 ? (
        <div className="status-line" data-testid="sector-heat-status">
          Loading sectors…
        </div>
      ) : isError && sectors.length === 0 ? (
        <div className="empty" data-testid="sector-heat-empty">
          Unable to load sector data
        </div>
      ) : sectors.length === 0 ? (
        <div className="empty" data-testid="sector-heat-empty">
          No sector data available
        </div>
      ) : (
        <div className="heat" data-testid="sector-heat-grid">
          {sectors.map((sector) => {
            const isGaining = sector.direction === 'gaining';
            const intensity = Math.min(
              28,
              Math.abs(sector.changePercent) * 9,
            ).toFixed(0);
            return (
              <div
                className={`hcell ${isGaining ? 'pos' : 'neg'}`}
                key={sector.id}
                data-testid="sector-heat-cell"
                style={{ '--k': intensity } as CSSProperties}
                onClick={() =>
                  onNotifyDemo?.(
                    `${sector.name} sector ${formatSignedPercent(sector.changePercent)} (demo)`,
                  )
                }
              >
                <span className="s">
                  {sector.symbol} · {sector.name}
                </span>
                <span className="v">
                  {formatSignedPercent(sector.changePercent)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
