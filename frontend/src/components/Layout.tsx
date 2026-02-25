import React from "react";

type Page = "dashboard" | "forecast" | "ciSync";

interface Props {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "forecast", label: "Forecast" },
  { id: "ciSync", label: "CI Sync" },
];

export default function Layout({ children, activePage, onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Zephyr Scale QA Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Test case and execution metrics
          </p>
        </div>
        <nav className="w-full px-4 sm:px-6 lg:px-8 flex gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={[
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activePage === item.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">{children}</main>
    </div>
  );
}
