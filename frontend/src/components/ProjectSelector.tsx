import { useProjects, ZephyrProject } from "../api/dashboardApi";

interface Props {
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

export default function ProjectSelector({ selectedKey, onSelect }: Props) {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return (
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading projects...
    </div>
  );
  if (error) return <div className="text-red-500">Failed to load projects</div>;

  const enabledProjects = projects?.filter((p: ZephyrProject) => p.enabled) || [];

  return (
    <div className="relative w-full sm:w-64">
      <select
        value={selectedKey || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-8 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
      >
        <option value="" disabled>
          Select a project
        </option>
        {enabledProjects.map((p: ZephyrProject) => (
          <option key={p.key} value={p.key}>
            {p.key}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
