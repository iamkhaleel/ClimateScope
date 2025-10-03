// Simple probability function
function calcProbability(values, threshold) {
  const clean = values.filter((v) => v !== null && !isNaN(v));
  if (!clean.length) return 0;

  if (threshold.type === "percentile") {
    clean.sort((a, b) => a - b);
    const idx = Math.floor((threshold.value / 100) * clean.length);
    const safeIdx = Math.min(Math.max(idx, 0), clean.length - 1);
    const cutoff = clean[safeIdx];
    const exceed = clean.filter((v) => v > cutoff).length;
    return (exceed / clean.length) * 100;
  } else {
    const exceed = clean.filter((v) => v > threshold.value).length;
    return (exceed / clean.length) * 100;
  }
}
