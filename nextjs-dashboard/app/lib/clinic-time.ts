const CLINIC_TIMEZONE_OFFSET_MS = 2 * 60 * 60 * 1000;

export function clinicLocalDateTimeToUtc(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const isValidDate =
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day &&
    utcDate.getUTCHours() === hours &&
    utcDate.getUTCMinutes() === minutes;

  if (!isValidDate) {
    return null;
  }

  return new Date(utcDate.getTime() - CLINIC_TIMEZONE_OFFSET_MS).toISOString();
}

export function clinicUtcDateTimeToLocal(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getTime() + CLINIC_TIMEZONE_OFFSET_MS)
    .toISOString()
    .slice(0, 16);
}
