import { useMemo, useState } from 'react';
import { AiRead } from './components/ai-read/AiRead';
import { IndexStrip } from './components/index-strip/IndexStrip';
import { IntradayChart } from './components/intraday-chart/IntradayChart';
import { NewsPanel } from './components/news-panel/NewsPanel';
import { QuoteTape } from './components/quote-tape/QuoteTape';
import { SectorFlows } from './components/sector-flows/SectorFlows';
import { useToast } from './components/toast/ToastProvider';
import { WatchlistPanel } from './components/watchlist/WatchlistPanel';
import type { IndexQuotation, Quote, RankingTabId } from './data/types';
import { addSymbolToWatchlist, getQuote } from './data/quotes';
import { useHoldings } from './hooks/useHoldings';
import { useIndexes } from './hooks/useIndexes';
import { useIntradaySeries } from './hooks/useIntradaySeries';
import { useNews } from './hooks/useNews';
import { useQuotes } from './hooks/useQuotes';
import { useSectors } from './hooks/useSectors';
import { useSessionRead } from './hooks/useSessionRead';
import { useMarketStatus } from './lib/marketStatus';
import { useTheme } from './lib/theme';

const DEFAULT_SYMBOL = 'NVDA';

function Header({
  indexes,
  selectedIndexId,
  onSelectIndex,
  onNotifyDemo,
}: {
  indexes: IndexQuotation[];
  selectedIndexId?: string;
  onSelectIndex: (index: IndexQuotation) => void;
  onNotifyDemo: (message: string) => void;
}) {
  const marketStatus = useMarketStatus();
  const { theme, toggle } = useTheme();

  return (
    <header className="htop">
      <span className="logo">TAPE▮</span>
      <span className="sub">US MARKET WATCH</span>
      <IndexStrip
        indexes={indexes}
        selectedIndexId={selectedIndexId}
        onSelectIndex={onSelectIndex}
        onNotifyDemo={onNotifyDemo}
      />
      <span className="demo-note">DEMO · SIMULATED</span>
      <span className="spacer" />
      <span
        className="mstat"
        data-testid="market-status"
        data-open={marketStatus.isOpen ? '1' : '0'}
      >
        <i />
        <span className="clock" data-testid="market-clock">
          {marketStatus.clock}
        </span>
        <span className="st" data-testid="market-open-state">
          {marketStatus.label}
        </span>
      </span>
      <button
        type="button"
        className="kit-theme"
        onClick={toggle}
        title="Toggle theme"
        data-testid="theme-toggle"
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </header>
  );
}

export default function App() {
  const { showToast } = useToast();
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOL);
  const [selectedIndexId, setSelectedIndexId] = useState<string | undefined>();
  const [activeNewsTab, setActiveNewsTab] = useState<RankingTabId>('gainers');

  const notifyDemo = (message: string): void => {
    showToast(message);
  };

  const indexesQuery = useIndexes();
  const quotesQuery = useQuotes();

  const handleSelectIndex = (index: IndexQuotation): void => {
    setSelectedIndexId(index.id);
  };

  const handleSelectQuote = (quote: Quote): void => {
    setSelectedSymbol(quote.symbol);
  };

  const handleSelectQuoteSymbol = (symbol: string): void => {
    setSelectedSymbol(symbol);
  };

  const selectedQuote = useMemo(() => {
    const quote = getQuote(selectedSymbol);
    if (quote) {
      return quote;
    }
    const part = quotesQuery.data?.quotes.find(
      (item) => item.symbol === selectedSymbol,
    );
    return part ?? quotesQuery.data?.quotes[0];
  }, [selectedSymbol, quotesQuery.data]);

  const intradayQuery = useIntradaySeries(selectedSymbol);
  const sectorsQuery = useSectors();
  const newsQuery = useNews(activeNewsTab);
  const holdingsQuery = useHoldings();
  const sessionReadQuery = useSessionRead();

  const handleAddSymbol = (symbol: string): boolean => {
    if (addSymbolToWatchlist(symbol)) {
      void quotesQuery.refetch();
      notifyDemo(`${symbol} added to watchlist (demo)`);
      setSelectedSymbol(symbol);
      return true;
    }
    return false;
  };

  return (
    <div className="wp" data-testid="app">
      <Header
        indexes={indexesQuery.data?.indexes ?? []}
        selectedIndexId={selectedIndexId}
        onSelectIndex={handleSelectIndex}
        onNotifyDemo={notifyDemo}
      />
      <QuoteTape
        quotes={quotesQuery.data?.quotes ?? []}
        onSelectQuote={handleSelectQuote}
      />
      <div className="app">
        <WatchlistPanel
          quotes={quotesQuery.data?.quotes ?? []}
          holdings={holdingsQuery.data?.holdings ?? []}
          selectedSymbol={selectedSymbol}
          isError={quotesQuery.isError}
          isLoading={quotesQuery.isLoading}
          onSelectQuote={handleSelectQuoteSymbol}
          onAddSymbol={handleAddSymbol}
        />
        <main className="center">
          <IntradayChart
            symbol={selectedQuote?.symbol ?? selectedSymbol}
            name={selectedQuote?.name ?? selectedSymbol}
            price={selectedQuote?.price ?? 0}
            change={selectedQuote?.change ?? 0}
            changePercent={selectedQuote?.changePercent ?? 0}
            previousClose={selectedQuote?.previousClose ?? 0}
            points={intradayQuery.data?.points ?? []}
            isError={intradayQuery.isError}
            isLoading={intradayQuery.isLoading}
          />
          <SectorFlows
            sectors={sectorsQuery.data?.sectors ?? []}
            isError={sectorsQuery.isError}
            isLoading={sectorsQuery.isLoading}
            onNotifyDemo={notifyDemo}
          />
        </main>
        <aside className="col r">
          <NewsPanel
            activeTab={activeNewsTab}
            items={newsQuery.data?.items ?? []}
            isError={newsQuery.isError}
            isLoading={newsQuery.isLoading}
            onSelectTab={setActiveNewsTab}
            onSelectQuote={handleSelectQuoteSymbol}
            onNotifyDemo={notifyDemo}
          />
          <AiRead
            read={sessionReadQuery.data}
            isError={sessionReadQuery.isError}
            isLoading={sessionReadQuery.isLoading}
          />
        </aside>
      </div>
      <div className="ft-note" data-testid="demo-note-footer">
        All data is simulated for demonstration · Not investment advice
      </div>
    </div>
  );
}
