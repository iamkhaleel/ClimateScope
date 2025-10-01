import dayjs from "dayjs";

export default function DateSelector({ date, setDate }) {
  return (
    <div>
      <label className="block mb-1 font-semibold text-gray-800">
        Select Date
      </label>
      <input
        type="date"
        value={dayjs(date).format("YYYY-MM-DD")}
        onChange={(e) => setDate(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
