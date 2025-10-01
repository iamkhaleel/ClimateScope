export default function SummaryCard({ text }) {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-semibold mb-2">Summary</h2>
      <p>{text}</p>
    </div>
  );
}
