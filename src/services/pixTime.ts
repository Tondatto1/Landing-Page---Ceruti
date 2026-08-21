/** Formats the real remaining Pix validity without turning long durations into huge minute counts. */
export function formatPixRemainingTime(remainingMs: number): string {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 'Pix expirado';

  const totalSeconds = Math.floor(remainingMs / 1_000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const totalHours = Math.floor(totalMinutes / 60);

  if (totalHours < 1) {
    return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  const days = Math.floor(totalHours / 24);
  if (days > 0) {
    const hoursAfterDays = totalHours % 24;
    return hoursAfterDays > 0 ? `${days}d ${hoursAfterDays}h` : `${days}d`;
  }

  const minutesAfterHours = totalMinutes % 60;
  return minutesAfterHours > 0
    ? `${totalHours}h ${String(minutesAfterHours).padStart(2, '0')}min`
    : `${totalHours}h`;
}
