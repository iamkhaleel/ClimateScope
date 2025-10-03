import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const colors = [
  "#ff7300", // orange
  "#007bff", // blue
  "#28a745", // green
  "#6610f2", // purple
  "#dc3545", // red
  "#17a2b8", // cyan
];

export default function ProbabilityTrendChart({ trendData }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-xl shadow">
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  const variables = Object.keys(trendData[0]).filter((k) => k !== "year");

  return (
    <div className="w-full h-96 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Probability Trends</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            domain={[0, 100]}
            label={{
              value: "Probability (%)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          {variables.map((v, idx) => (
            <Line
              key={v}
              type="monotone"
              dataKey={v}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
