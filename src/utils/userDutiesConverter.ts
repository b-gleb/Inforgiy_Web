/**
 * Converts an array of hour numbers into a compact duty string
 * by merging consecutive hours into ranges.
 *
 * Example: [1, 2, 3, 5, 8, 9] -> "01:00-04:00; 05:00-06:00; 08:00-10:00"
 */
export function convertToDutyString(hours: number[]): string {
  if (!hours?.length) return "";

  const sorted = [...new Set(hours)].sort((a, b) => a - b);

  const ranges: [start: number, end: number][] = [];
  for (const hour of sorted) {
    const current = ranges.at(-1);
    if (current && hour === current[1] + 1) {
      current[1] = hour; // extend the open range
    } else {
      ranges.push([hour, hour]); // start a new range
    }
  }

  return ranges
    .map(([start, end]) => `${pad(start)}:00-${pad(end + 1)}:00`)
    .join("; ");
}

const pad = (n: number): string => n.toString().padStart(2, "0");