import { useEffect, useRef, useState } from 'react';

export interface TypewriterResult {
  visibleText: string;
  isComplete: boolean;
  isTyping: boolean;
}

const INITIAL_DELAY_MS = 900;
const MIN_STEP_CHARS = 2;
const CHARACTER_DRIFT_RANGE = 3;
const MIN_STEP_DELAY_MS = 16;
const STEP_DELAY_SPREAD_MS = 26;

interface TypingProgress {
  version: string;
  typedText: string;
  isDone: boolean;
}

export function useTypewriter(
  text: string,
  enabled = true,
  restartKey?: unknown,
): TypewriterResult {
  const version = `${String(restartKey)}:${text.length}`;
  const [progress, setProgress] = useState<TypingProgress>({
    version,
    typedText: '',
    isDone: false,
  });
  const [committedVersion, setCommittedVersion] = useState(version);

  // Reset the typed output immediately whenever the source text or restart key
  // changes (documented "adjusting state when a prop changes" pattern).
  if (committedVersion !== version) {
    setCommittedVersion(version);
    setProgress({ version, typedText: '', isDone: false });
  }

  const timeoutsRef = useRef<number[]>([]);

  const isEffectivelyEnabled = enabled && text.length > 0;
  const isCommitted = progress.version === version;
  const visibleText = isEffectivelyEnabled
    ? isCommitted
      ? progress.typedText
      : ''
    : text;
  const isComplete = isEffectivelyEnabled ? progress.isDone : true;

  useEffect(() => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    if (!isEffectivelyEnabled) {
      return;
    }

    const scheduleStep = (callback: () => void, delayMs: number): void => {
      const timeoutId = window.setTimeout(callback, delayMs);
      timeoutsRef.current.push(timeoutId);
    };

    scheduleStep(() => {
      let revealedCharacters = 0;
      const advance = (): void => {
        revealedCharacters +=
          MIN_STEP_CHARS + Math.floor(Math.random() * CHARACTER_DRIFT_RANGE);
        if (revealedCharacters >= text.length) {
          setProgress({ version, typedText: text, isDone: true });
          return;
        }
        setProgress({
          version,
          typedText: text.slice(0, revealedCharacters),
          isDone: false,
        });
        scheduleStep(
          advance,
          MIN_STEP_DELAY_MS + Math.random() * STEP_DELAY_SPREAD_MS,
        );
      };
      advance();
    }, INITIAL_DELAY_MS);

    return () => {
      timeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      timeoutsRef.current = [];
    };
  }, [version, text, enabled, isEffectivelyEnabled]);

  return {
    visibleText,
    isComplete,
    isTyping: isEffectivelyEnabled && !isComplete,
  };
}
