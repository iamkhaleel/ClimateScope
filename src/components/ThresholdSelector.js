export default function ThresholdSelector({ thresholds, setThresholds }) {
  const handleChange = (variable, value) => {
    setThresholds((prev) => ({
      ...prev,
      [variable]: isNaN(parseFloat(value)) ? 0 : parseFloat(value),
    }));
  };

  return (
    <div className="space-y-3">
      {Object.keys(thresholds).map((v) => (
        <div key={v} className="flex items-center gap-2">
          <label className="w-36 font-medium text-gray-700">
            {v} threshold
          </label>
          <input
            type="number"
            step="any"
            value={thresholds[v]}
            onChange={(e) => handleChange(v, e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      ))}
      <p className="text-sm text-gray-500">
        Enter the value you consider "extreme" for each variable. e.g.
        Temperature &gt; 35
      </p>
    </div>
  );
}
