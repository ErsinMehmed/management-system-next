const attempts = new Map();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 минути

export function checkRateLimit(key) {
  const now = Date.now();
  const record = attempts.get(key);

  if (record) {
    if (now < record.resetAt) {
      if (record.count >= MAX_ATTEMPTS) {
        const minutesLeft = Math.ceil((record.resetAt - now) / 60000);
        return { blocked: true, minutesLeft };
      }
      record.count++;
    } else {
      attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    }
  } else {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  }

  return { blocked: false };
}

export function resetRateLimit(key) {
  attempts.delete(key);
}
