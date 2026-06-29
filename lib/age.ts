/**
 * Age computation helpers.
 *
 * `ageAt(dob, onDate)` computes age in whole years as of a reference date.
 * Used wherever a child's age is displayed: the trip cover, sticky header,
 * and member roster prefer DOB-derived age over the stored `age` field.
 */

/**
 * Compute age in whole years of a person born on `dob` as of `onDate`.
 * Both arguments are ISO date strings (`YYYY-MM-DD`). Returns `null` when
 * either argument is falsy or cannot be parsed as a valid date.
 */
export function ageAt(dob: string | null | undefined, onDate: string | null | undefined): number | null {
  if (!dob || !onDate) return null;
  // Anchor at noon to avoid tz-slip when the browser's locale differs.
  const birth = new Date(`${dob}T12:00:00`);
  const ref = new Date(`${onDate}T12:00:00`);
  if (isNaN(birth.getTime()) || isNaN(ref.getTime())) return null;

  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

/**
 * Resolve a displayable age for a profile on a trip.
 * Prefers `date_of_birth` computed against `tripStartDate`;
 * falls back to the stored numeric `age` field; returns `null` if neither.
 */
export function resolvedAge(
  dob: string | null | undefined,
  storedAge: number | null | undefined,
  tripStartDate: string | null | undefined,
): number | null {
  const fromDob = ageAt(dob, tripStartDate);
  if (fromDob !== null) return fromDob;
  return storedAge ?? null;
}
