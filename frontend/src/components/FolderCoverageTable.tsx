import { useState, useMemo, useEffect } from "react";
import { FolderCoverageRow } from "../api/dashboardApi";

interface Props {
  rows: FolderCoverageRow[];
  isLoading: boolean;
}

function coverageColor(rate: number): string {
  if (rate >= 80) return "text-green-600";
  if (rate >= 50) return "text-amber-500";
  return "text-red-500";
}

function coverageBarColor(rate: number): string {
  if (rate >= 80) return "bg-green-500";
  if (rate >= 50) return "bg-amber-400";
  return "bg-red-400";
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FolderCoverageTable({ rows, isLoading }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    setExpanded(new Set(rows.filter((r) => r.depth === 0).map((r) => r.folderId)));
    setSearch("");
  }, [rows]);

  const parentIds = useMemo(
    () => new Set(rows.map((r) => r.parentId).filter((id): id is number => id !== null)),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    const matchIds = new Set(rows.filter((r) => r.folderName.toLowerCase().includes(q)).map((r) => r.folderId));
    const toShow = new Set<number>(matchIds);
    const idToRow = new Map(rows.map((r) => [r.folderId, r]));
    for (const id of matchIds) {
      let cur = idToRow.get(id);
      while (cur && cur.parentId !== null) {
        toShow.add(cur.parentId);
        cur = idToRow.get(cur.parentId);
      }
    }
    return rows.filter((r) => toShow.has(r.folderId));
  }, [rows, search]);

  const visibleRows = useMemo(() => {
    if (search.trim()) return filteredRows;
    const visibleIds = new Set<number>();
    for (const row of filteredRows) {
      if (row.depth === 0) {
        visibleIds.add(row.folderId);
      } else if (row.parentId !== null && visibleIds.has(row.parentId) && expanded.has(row.parentId)) {
        visibleIds.add(row.folderId);
      }
    }
    return filteredRows.filter((row) => visibleIds.has(row.folderId));
  }, [filteredRows, expanded, search]);

  const expandableIds = useMemo(
    () => new Set(filteredRows.filter((r) => parentIds.has(r.folderId)).map((r) => r.folderId)),
    [filteredRows, parentIds]
  );
  const allExpanded = expandableIds.size > 0 && [...expandableIds].every((id) => expanded.has(id));

  const toggleAll = () => {
    setExpanded(allExpanded ? new Set() : new Set(expandableIds));
  };

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Loading feature coverage...</div>;
  }

  if (rows.length === 0) {
    return <div className="flex items-center justify-center py-10 text-gray-400 text-sm">No automation test cases found in any folder.</div>;
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search folders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 py-1.5 text-sm border border-gray-300 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={toggleAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th className="pb-3 font-medium text-left">Feature / Folder</th>
            <th className="pb-3 font-medium text-center w-32">Automation TCs</th>
            <th className="pb-3 font-medium text-center w-48">Ready for Automation</th>
            <th className="pb-3 font-medium text-center w-44">Automation In Progress</th>
            <th className="pb-3 font-medium text-center w-32">Automated</th>
            <th className="pb-3 font-medium text-center w-80">
              <div className="flex items-center justify-center gap-1">
                <span>Automation Coverage</span>
                <div className="relative group">
                  <button className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors text-xs font-bold cursor-default">
                    i
                  </button>
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg normal-case tracking-normal leading-relaxed font-normal">
                    <p className="mb-1">% of automation TCs with status <span className="font-semibold">Automated</span>. Click the column title to sort.</p>
                    <p className="flex items-center gap-1.5 mt-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></span> ≥ 80%</p>
                    <p className="flex items-center gap-1.5 mt-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0"></span> 50% – 79%</p>
                    <p className="flex items-center gap-1.5 mt-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0"></span> &lt; 50%</p>
                    <div className="absolute right-3 top-full w-2 h-2 bg-gray-800 rotate-45 -mt-1" />
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No folders match your search.</td>
            </tr>
          ) : (
            visibleRows.map((row) => {
              const hasChildren = parentIds.has(row.folderId);
              const isExpanded = expanded.has(row.folderId);
              return (
                <tr key={row.folderId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1" style={{ paddingLeft: `${row.depth * 20}px` }}>
                      {hasChildren ? (
                        <button
                          onClick={() => toggle(row.folderId)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0 flex items-center justify-center w-4 h-4"
                        >
                          {isExpanded ? <ChevronDown /> : <ChevronRight />}
                        </button>
                      ) : (
                        <span className="w-4 flex-shrink-0" />
                      )}
                      <span className={row.depth === 0 ? "font-medium text-gray-900" : "text-gray-700"}>
                        {row.folderName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-gray-600">{row.total}</td>
                  <td className="py-3 text-center text-gray-600">{row.readyForAutomation}</td>
                  <td className="py-3 text-center text-gray-600">{row.inProgress}</td>
                  <td className="py-3 text-center text-gray-600">{row.completed}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${coverageBarColor(row.coverageRate)}`}
                          style={{ width: `${row.coverageRate}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium w-9 text-right ${coverageColor(row.coverageRate)}`}>
                        {row.coverageRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
