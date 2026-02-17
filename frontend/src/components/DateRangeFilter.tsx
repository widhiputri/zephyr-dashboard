interface Props {
  value: number | undefined;
  onChange: (days: number | undefined) => void;
}

const RANGES = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "All time", value: undefined },
];

export default function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {RANGES.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.label}
            onClick={() => onChange(r.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
