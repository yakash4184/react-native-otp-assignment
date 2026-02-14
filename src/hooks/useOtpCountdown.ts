import { useEffect, useMemo, useState } from "react";

function getRemainingSeconds(expiresAt: number | null): number {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

export function useOtpCountdown(expiresAt: number | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    getRemainingSeconds(expiresAt)
  );

  useEffect(() => {
    setRemainingSeconds(getRemainingSeconds(expiresAt));

    if (!expiresAt) {
      return undefined;
    }

    const interval = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(expiresAt));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [expiresAt]);

  const isExpired = useMemo(() => remainingSeconds <= 0, [remainingSeconds]);

  return {
    remainingSeconds,
    isExpired
  };
}
