// Cordel Connect seasonal/holiday banner selection.
//
// All logic here is deterministic and runs client-side (see SeasonalBanner.astro) so the
// banner reflects the visitor's own local date, not the site's build date.
//
// Window rule (per founder instruction): a holiday banner is active starting 7 days before
// the holiday's date through the day after it, inclusive. Multi-day holidays (Hanukkah) run
// from 7 days before the first day through the day after the last day.
//
// Two holiday dates are not fixed calendar dates and have no simple formula: Hanukkah and
// Lunar New Year (Chinese New Year) both follow lunisolar calendars. Their tables below are
// populated only for years verified with reasonable confidence (2025-2027 at the time this
// was written). MAINTENANCE: extend HANUKKAH_FIRST_DAY and LUNAR_NEW_YEAR below each year -
// do not guess future dates; a year missing from the table simply falls back to the current
// season banner instead of showing a wrong date.

export interface SeasonalBanner {
  key: string;
  label: string;
  imagePath: string;
  alt: string;
}

const BANNER_DIR = '/cordel-connect/seasonal';

function banner(key: string, label: string, alt: string): SeasonalBanner {
  return { key, label, imagePath: `${BANNER_DIR}/cordel-connect-banner-${key}.webp`, alt };
}

// ---- Fixed-date holidays (month is 0-indexed, matching Date) ----
const FIXED_DATE_HOLIDAYS: { key: string; label: string; month: number; day: number }[] = [
  { key: 'valentine', label: "Valentine's Day", month: 1, day: 14 },
  { key: 'st-patricks', label: "St. Patrick's Day", month: 2, day: 17 },
  { key: 'independence-day', label: '4th of July', month: 6, day: 4 },
  { key: 'halloween', label: 'Halloween', month: 9, day: 31 },
  { key: 'christmas', label: 'Christmas', month: 11, day: 25 },
  { key: 'new-year', label: "New Year's Day", month: 0, day: 1 },
];

// ---- Nth-weekday-of-month holidays (US observance) ----
// weekday: 0=Sunday..6=Saturday. n: 1st, 2nd, 3rd, 4th occurrence in the month.
const NTH_WEEKDAY_HOLIDAYS: { key: string; label: string; month: number; weekday: number; n: number }[] = [
  { key: 'mothers-day', label: "Mother's Day", month: 4, weekday: 0, n: 2 }, // 2nd Sunday of May
  { key: 'fathers-day', label: "Father's Day", month: 5, weekday: 0, n: 3 }, // 3rd Sunday of June
  { key: 'thanksgiving', label: 'Thanksgiving', month: 10, weekday: 4, n: 4 }, // 4th Thursday of November
];

// ---- Lunisolar-calendar holidays: verified lookup only, no guessing beyond this range ----
const LUNAR_NEW_YEAR: Record<number, [number, number]> = {
  2025: [0, 29],
  2026: [1, 17],
  2027: [1, 6],
};
const HANUKKAH_FIRST_DAY: Record<number, [number, number]> = {
  2025: [11, 14],
  2026: [11, 4],
};
const HANUKKAH_DAYS = 8;

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function computeEaster(year: number): Date {
  // Meeus/Jones/Butcher Gregorian algorithm.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface Occurrence {
  key: string;
  label: string;
  start: Date;
  end: Date; // inclusive last calendar day of the holiday itself (before applying the window rule)
}

function collectOccurrences(year: number): Occurrence[] {
  const out: Occurrence[] = [];
  for (const h of FIXED_DATE_HOLIDAYS) {
    const d = new Date(year, h.month, h.day);
    out.push({ key: h.key, label: h.label, start: d, end: d });
  }
  for (const h of NTH_WEEKDAY_HOLIDAYS) {
    const d = nthWeekdayOfMonth(year, h.month, h.weekday, h.n);
    out.push({ key: h.key, label: h.label, start: d, end: d });
  }
  const easter = computeEaster(year);
  out.push({ key: 'easter', label: 'Easter', start: easter, end: easter });

  const lny = LUNAR_NEW_YEAR[year];
  if (lny) {
    const d = new Date(year, lny[0], lny[1]);
    out.push({ key: 'lunar-new-year', label: 'Lunar New Year', start: d, end: d });
  }
  const hanukkah = HANUKKAH_FIRST_DAY[year];
  if (hanukkah) {
    const start = new Date(year, hanukkah[0], hanukkah[1]);
    const end = new Date(start);
    end.setDate(end.getDate() + HANUKKAH_DAYS - 1);
    out.push({ key: 'hanukkah', label: 'Hanukkah', start, end });
  }
  return out;
}

function seasonForDate(d: Date): { key: string; label: string } {
  // Meteorological seasons (Northern Hemisphere), matching the art (snow/blossoms/beach/leaves).
  const month = d.getMonth(); // 0=Jan
  if (month === 11 || month <= 1) return { key: 'season-winter', label: 'Winter' };
  if (month <= 4) return { key: 'season-spring', label: 'Spring' };
  if (month <= 7) return { key: 'season-summer', label: 'Summer' };
  return { key: 'season-autumn', label: 'Autumn' };
}

/** Returns the active holiday/season banner for a given date (defaults to now). */
export function getActiveBanner(now: Date = new Date()): SeasonalBanner {
  const today = atMidnight(now);
  const candidateYears = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];

  // Two holiday windows can overlap in some years (e.g. Valentine's Day and Lunar New Year
  // in 2026 are 10 days apart, so their +/-week windows both cover early-to-mid February).
  // When more than one holiday is active, show whichever one's actual date is closest to
  // today rather than an arbitrary declaration-order winner.
  let best: { occ: Occurrence; distance: number } | null = null;
  for (const year of candidateYears) {
    for (const occ of collectOccurrences(year)) {
      const windowStart = new Date(occ.start);
      windowStart.setDate(windowStart.getDate() - 7);
      const windowEnd = new Date(occ.end);
      windowEnd.setDate(windowEnd.getDate() + 1);
      if (today >= atMidnight(windowStart) && today <= atMidnight(windowEnd)) {
        const distance = Math.min(
          Math.abs(today.getTime() - atMidnight(occ.start).getTime()),
          Math.abs(today.getTime() - atMidnight(occ.end).getTime())
        );
        if (!best || distance < best.distance) best = { occ, distance };
      }
    }
  }
  if (best) return banner(best.occ.key, best.occ.label, `Cordel Connect ${best.occ.label} banner`);

  const season = seasonForDate(today);
  return banner(season.key, season.label, `Cordel Connect ${season.label} banner`);
}
