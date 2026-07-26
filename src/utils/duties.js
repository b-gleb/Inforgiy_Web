export function convertToDutyString(hours) {
  if (!hours || hours.length === 0) return "";

  hours.sort((a, b) => a - b);
  let result = [];
  let start = hours[0]; // Start of the current group
  let end = start; // End of the current group

  for (let i = 1; i < hours.length; i++) {
    if (hours[i] === end + 1) {
      // Extend the current group
      end = hours[i];
    } else {
      // Push the current group and start a new one
      result.push(`${start.toString().padStart(2, "0")}:00-${(end + 1).toString().padStart(2, "0")}:00`);
      start = hours[i];
      end = start;
    }
  }

  // Push the last group
  result.push(`${start.toString().padStart(2, "0")}:00-${(end + 1).toString().padStart(2, "0")}:00`);
  return result.join("; ");
}
