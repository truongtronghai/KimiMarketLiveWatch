import { useState } from 'react';
import type { SessionRead, SessionReadChip } from '../../data/types';
import { useTypewriter } from '../../lib/typewriter';
import { AiOrb } from './AiOrb';

interface AiReadProps {
  read?: SessionRead;
  isError?: boolean;
  isLoading?: boolean;
}

export function AiRead({ read, isError, isLoading }: AiReadProps) {
  const [activeChipId, setActiveChipId] = useState<string | undefined>(
    undefined,
  );
  const [variantIndexes, setVariantIndexes] = useState<Record<string, number>>(
    {},
  );

  const activeChip =
    read?.chips.find((chip) => chip.id === activeChipId) ?? read?.chips[0];
  const variantIndex = activeChip ? (variantIndexes[activeChip.id] ?? 0) : 0;
  const selectedVariant = activeChip
    ? activeChip.variants[variantIndex % activeChip.variants.length]
    : '';
  const typewriterRestartKey = `${activeChip?.id ?? ''}-${variantIndex}`;

  const { visibleText, isComplete } = useTypewriter(
    selectedVariant,
    true,
    typewriterRestartKey,
  );

  const handleChipSelect = (chip: SessionReadChip): void => {
    setActiveChipId(chip.id);
    const currentIndex = variantIndexes[chip.id] ?? 0;
    setVariantIndexes((current) => ({ ...current, [chip.id]: currentIndex }));
  };

  const handleRegenerate = (): void => {
    if (!activeChip) {
      return;
    }
    const currentIndex = variantIndexes[activeChip.id] ?? 0;
    setVariantIndexes((current) => ({
      ...current,
      [activeChip.id]: (currentIndex + 1) % activeChip.variants.length,
    }));
  };

  if (isLoading && !read) {
    return (
      <section className="ai" data-testid="ai-read">
        <div className="hd">
          <AiOrb state="scan" />
          <b>AI ANALYSIS</b>
          <span className="tag">DEMO · SIMULATED</span>
        </div>
        <div className="status-line" data-testid="ai-read-status">
          Preparing your session…
        </div>
      </section>
    );
  }

  if (isError || !read || read.chips.length === 0) {
    return (
      <section className="ai" data-testid="ai-read">
        <div className="hd">
          <AiOrb state="orbit" />
          <b>AI ANALYSIS</b>
          <span className="tag">DEMO · SIMULATED</span>
        </div>
        <div className="empty" data-testid="ai-read-empty">
          No session read available yet
        </div>
      </section>
    );
  }

  return (
    <section className="ai" data-testid="ai-read">
      <div className="hd">
        <AiOrb state={isComplete ? 'orbit' : 'scan'} />
        <b>AI ANALYSIS</b>
        <span className="tag">DEMO · SIMULATED</span>
      </div>
      <div className="chips">
        {read.chips.map((chip) => (
          <button
            key={chip.id}
            className={chip.id === activeChip?.id ? 'on' : undefined}
            data-chip={chip.id}
            data-testid={`ai-chip-${chip.id}`}
            onClick={() => handleChipSelect(chip)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="txt" data-testid="ai-read-text">
        {visibleText}
        {!isComplete && <span className="caret" data-testid="ai-read-caret" />}
      </div>
      <div className="ft">
        <button
          className="btn"
          data-testid="ai-regenerate"
          onClick={handleRegenerate}
        >
          ⟳ Regenerate
        </button>
        <span className="note">Not investment advice</span>
      </div>
    </section>
  );
}
