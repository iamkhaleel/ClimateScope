export default function VariableSelector({ variables, setVariables }) {
  const options = [
    "Temperature",
    "Rainfall",
    "Wind Speed",
    "Humidity",
    // "Dust Concentration",
  ];

  return (
    <div>
      <label className="block mb-2 font-semibold text-gray-800">
        Select Variables
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((v) => {
          const checked = variables.includes(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() =>
                setVariables((prev) =>
                  prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
                )
              }
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                checked
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={checked}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}
