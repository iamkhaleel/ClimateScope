// Generate YYYYMMDD dates for the same day over the past N years
export function getHistoricalDates(selectedDate, years = 20) {
  const date = new Date(selectedDate);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate(); // 1-31
  const currentYear = date.getFullYear();

  const historicalDates = [];
  for (let y = currentYear - years; y < currentYear; y++) {
    const yyyy = y;
    const mm = month.toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    historicalDates.push(`${yyyy}${mm}${dd}`);
  }

  return historicalDates;
}
