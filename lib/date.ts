const INDIA_TIME_ZONE = "Asia/Kolkata";

/**
 * Returns a calendar date in the academy's local time zone as YYYY-MM-DD.
 *
 * Date#toISOString() is always UTC, which can show the prior date in India
 * from midnight until 05:29.
 */
export function getIndiaDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function getIndiaDateParts(date: Date = new Date()) {
  const [year, month, day] = getIndiaDate(date).split("-").map(Number);
  return { year, month, day };
}
