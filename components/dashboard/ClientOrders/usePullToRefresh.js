"use client";
import { useEffect, useRef, useState } from "react";

// Pull-to-refresh върху window scroll. Активира се само когато потребителят
// е в самия връх на страницата (window.scrollY === 0). Достига заданен
// threshold → onRefresh се вика и се чакаме да приключи преди да върнем
// индикатора. preventDefault на touchmove спира iOS rubberband.
export function usePullToRefresh(onRefresh, { threshold = 70, maxPull = 120 } = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pullRef = useRef(0);
  const setPull = (n) => {
    pullRef.current = n;
    setPullDistance(n);
  };

  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  const refreshingRef = useRef(false);

  useEffect(() => {
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e) => {
      if (refreshingRef.current) return;
      if (window.scrollY > 0) {
        tracking = false;
        return;
      }
      tracking = true;
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!tracking) return;
      if (window.scrollY > 0) {
        tracking = false;
        setPull(0);
        return;
      }
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) {
        if (pullRef.current !== 0) setPull(0);
        return;
      }
      const damped = Math.min(maxPull, Math.pow(dy, 0.85));
      setPull(damped);
      // Спираме нативното rubberband-ване след малко toleration на жеста
      if (dy > 6) e.preventDefault();
    };

    const onTouchEnd = async () => {
      if (!tracking) return;
      tracking = false;
      const final = pullRef.current;
      if (final >= threshold) {
        refreshingRef.current = true;
        setIsRefreshing(true);
        setPull(threshold);
        try {
          await onRefreshRef.current?.();
        } finally {
          refreshingRef.current = false;
          setIsRefreshing(false);
          setPull(0);
        }
      } else if (final > 0) {
        setPull(0);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [threshold, maxPull]);

  return { pullDistance, isRefreshing, threshold };
}
