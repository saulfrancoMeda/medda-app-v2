import { useCallback, useEffect, useRef, useState } from 'react';

// Countdown used to rate-limit SMS resends: after start(), the action stays disabled for `seconds`.
export function useResendCooldown(seconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setSecondsLeft(seconds);
    timer.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          stop();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [seconds, stop]);

  useEffect(() => stop, [stop]);

  return { secondsLeft, isCoolingDown: secondsLeft > 0, start };
}
