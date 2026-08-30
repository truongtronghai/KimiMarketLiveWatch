import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AiRead } from '../../src/components/ai-read/AiRead';
import type { SessionRead } from '../../src/data/types';

const READ: SessionRead = {
  id: 'read-1',
  title: 'AI Analysis',
  generatedAt: new Date(2026, 7, 30, 12, 0).toISOString(),
  chips: [
    {
      id: 'brief',
      label: 'Market Brief',
      variants: [
        'Market steady, NVDA leads.',
        'Rotation into financials, tech fades.',
      ],
    },
    {
      id: 'move',
      label: 'Sector Read',
      variants: ['Semis bid into the close today.'],
    },
  ],
};

function renderAiRead(read = READ) {
  return render(<AiRead read={read} />);
}

describe('AiRead', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the AI header, demo tag, chips and regenerate footer', () => {
    renderAiRead();

    expect(screen.getByTestId('ai-read').textContent).toContain('AI ANALYSIS');
    expect(screen.getByText('DEMO · SIMULATED')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chip-brief')).toHaveTextContent(
      'Market Brief',
    );
    expect(screen.getByTestId('ai-read-text')).toBeInTheDocument();
    const footer = screen.getByTestId('ai-read').textContent;
    expect(footer).toContain('Regenerate');
    expect(footer).toContain('Not investment advice');
  });

  it('types the first chip text progressively and shows the caret while typing', () => {
    renderAiRead();

    expect(screen.getByTestId('ai-read-caret')).toBeInTheDocument();
    expect(screen.getByTestId('ai-read-text').textContent).toBe('');

    act(() => {
      vi.advanceTimersByTime(900);
    });
    const partial = screen.getByTestId('ai-read-text').textContent ?? '';
    expect(partial.length).toBeGreaterThan(0);
    expect(partial).not.toBe('Market steady, NVDA leads.');

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId('ai-read-text').textContent).toBe(
      'Market steady, NVDA leads.',
    );
    expect(screen.queryByTestId('ai-read-caret')).not.toBeInTheDocument();
  });

  it('switches chips and regenerates a new variant text', () => {
    renderAiRead();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId('ai-read-text').textContent).toBe(
      'Market steady, NVDA leads.',
    );

    fireEvent.click(screen.getByTestId('ai-chip-move'));
    act(() => {
      vi.advanceTimersByTime(900 + 10_000);
    });
    expect(screen.getByTestId('ai-read-text').textContent).toBe(
      'Semis bid into the close today.',
    );

    fireEvent.click(screen.getByTestId('ai-chip-brief'));
    fireEvent.click(screen.getByTestId('ai-regenerate'));
    act(() => {
      vi.advanceTimersByTime(900 + 10_000);
    });
    expect(screen.getByTestId('ai-read-text').textContent).toBe(
      'Rotation into financials, tech fades.',
    );
  });

  it('shows a loading state while the read is being fetched', () => {
    render(<AiRead isLoading />);
    expect(screen.getByTestId('ai-read-status')).toBeInTheDocument();
  });

  it('shows an empty state when no read is available', () => {
    render(<AiRead />);
    expect(screen.getByTestId('ai-read-empty')).toBeInTheDocument();
  });
});
