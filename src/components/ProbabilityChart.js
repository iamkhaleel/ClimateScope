import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

/** compute simple histogram (bins) */
function computeHistogram(values = [], bins = 10) {
  if (!values || values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ bin: `${min}`, count: values.length, range: [min, max] }];
  }

  const width = (max - min) / bins;
  const buckets = Array.from({ length: bins }, (_, i) => {
    const start = min + i * width;
    const end = min + (i + 1) * width;

    return {
      bin: `${start.toFixed(1)} - ${end.toFixed(1)}`, // ✅ fewer decimals
      count: 0,
      range: [start, end],
    };
  });

  values.forEach((v) => {
    let idx = Math.floor((v - min) / width);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    buckets[idx].count += 1;
  });

  return buckets;
}

export default function ProbabilityChart({ data = [] }) {
  // Ensure hooks are always called in the same order
  const safeData = Array.isArray(data) ? data : [];
  const firstIdx = safeData.findIndex((d) => d.values && d.values.length > 0);
  const initialVar =
    firstIdx >= 0 ? safeData[firstIdx].variable : safeData[0]?.variable ?? null;
  const [selectedVar, setSelectedVar] = useState(initialVar);

  // Keep selection in sync if incoming data changes
  useEffect(() => {
    const idx = safeData.findIndex((d) => d.values && d.values.length > 0);
    const next =
      idx >= 0 ? safeData[idx].variable : safeData[0]?.variable ?? null;
    setSelectedVar(next);
  }, [safeData]);

  if (!safeData || safeData.length === 0) return null;

  const barData = safeData.map((d) => ({
    variable: d.variable,
    probability: d.probability,
    average: d.average ?? null,
    count: d.count,
  }));

  const selectedObj =
    safeData.find((d) => d.variable === selectedVar) || safeData[0];
  const histogram = computeHistogram(selectedObj.values, 12);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Probabilities (historical)</h2>

      {/* Probability Overview */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="variable" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar
            dataKey="probability"
            name="Probability (%)"
            fill="#3b82f6"
            onClick={(payload) => {
              if (payload && payload.variable) setSelectedVar(payload.variable);
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-sm text-gray-600 mt-2">
        Click a bar to view the value distribution (histogram) for that
        variable.
      </p>

      {/* Histogram for selected variable */}
      <div className="mt-4">
        <h3 className="font-medium">
          {selectedObj.variable} — distribution (based on {selectedObj.count}{" "}
          samples)
        </h3>

        {histogram.length === 0 ? (
          <p className="text-sm text-gray-500">
            No historical values available to build a histogram.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="bin"
                interval={0}
                angle={-35} // ✅ Rotate labels for clarity
                textAnchor="end"
                tick={{ fontSize: 7 }}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value} samples`}
                labelFormatter={(label) => `Range: ${label}`} // ✅ Show full bin on hover
              />
              <Bar dataKey="count" name="Count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
