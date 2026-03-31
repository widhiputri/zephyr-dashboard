import { TeamFolder } from "../api/dashboardApi";

interface Props {
  teams: TeamFolder[];
  value: number | undefined;
  onChange: (id: number | undefined) => void;
}

export default function TeamFilter({ teams, value, onChange }: Props) {
  if (teams.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Team:</span>
      {teams.map((team) => (
        <button
          key={team.id}
          onClick={() => onChange(team.id)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            value === team.id
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {team.name}
        </button>
      ))}
      {value !== undefined && (
        <button
          onClick={() => onChange(undefined)}
          className="px-2 py-1 rounded-full text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Show all test cases"
        >
          ✕ Reset
        </button>
      )}
    </div>
  );
}
