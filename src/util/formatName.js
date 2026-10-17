/**
 * Utilities to clean up and format member names across the application.
 * Strips erroneous backticks (``), orphan quotes, and normalizes spacing
 * often caused by legacy core banking extracts or CSV imports.
 */

/**
 * Cleans an individual name part (first, middle, or last name).
 * Returns empty string if the part consists only of backticks, quotes, or whitespace.
 */
export const cleanNamePart = (part) => {
  if (!part || typeof part !== "string") return "";

  // If part only contains backticks, quotes, or whitespace (e.g. "``", "''", '""', "`")
  if (!part.replace(/[`'"\s]/g, "").trim()) {
    return "";
  }

  // Remove any backticks
  let cleaned = part.replace(/`/g, "");

  // Remove surrounding quotes
  cleaned = cleaned.replace(/^['"]+|['"]+$/g, "");

  return cleaned.trim();
};

/**
 * Formats a clean full name from (firstName, middleName, lastName)
 * or from a single full-name string.
 *
 * Examples:
 *   formatFullName("Suliman", "``", "Khan") -> "Suliman Khan"
 *   formatFullName("Suliman `` Khan") -> "Suliman Khan"
 *   formatFullName("John", "A.", "Doe") -> "John A. Doe"
 */
export const formatFullName = (firstOrFull, middle, last) => {
  if (middle !== undefined || last !== undefined) {
    const cleanFirst = cleanNamePart(firstOrFull);
    const cleanMiddle = cleanNamePart(middle);
    const cleanLast = cleanNamePart(last);

    return [cleanFirst, cleanMiddle, cleanLast]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (!firstOrFull || typeof firstOrFull !== "string") return "";

  // Remove all backticks
  let cleaned = firstOrFull.replace(/`/g, "");

  // Remove standalone double/single quotes surrounded by whitespace
  cleaned = cleaned.replace(/(^|\s)['"]+(\s|$)/g, " ");

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
};

/**
 * Extracts clean uppercase initials for avatar badges.
 *
 * Examples:
 *   getInitials("Suliman", "Khan") -> "SK"
 *   getInitials("Suliman Khan") -> "SK"
 */
export const getInitials = (firstOrFull, last, fallback = "MB") => {
  if (last !== undefined) {
    const cleanFirst = cleanNamePart(firstOrFull);
    const cleanLast = cleanNamePart(last);
    const initials = [cleanFirst?.[0], cleanLast?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase();
    return initials || fallback;
  }

  const full = formatFullName(firstOrFull);
  if (!full) return fallback;

  const parts = full.split(" ").filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || fallback;

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() || fallback;
};
