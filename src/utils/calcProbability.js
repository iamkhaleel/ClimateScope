// Simple probability function
function calcProbability(values, threshold) {
  if (!values || values.length === 0) return 0;
  const exceedCount = values.filter((v) => v >= threshold).length;
  return (exceedCount / values.length) * 100;
}
