import { useEffect, useMemo, useState } from "react";

function getElapsedSeconds(startedAt: number): number {
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

function formatMmSs(totalSeconds: number): string {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function useSessionTimer(startedAt: number, isRunning: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() =>
    getElapsedSeconds(startedAt)
  );

  useEffect(() => {
    setElapsedSeconds(getElapsedSeconds(startedAt));
  }, [startedAt]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(startedAt));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, startedAt]);

  const formatted = useMemo(() => formatMmSs(elapsedSeconds), [elapsedSeconds]);

  return {
    elapsedSeconds,
    formatted
  };
}
