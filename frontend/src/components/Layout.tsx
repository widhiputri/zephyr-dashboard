import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
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
      </header>
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">{children}</main>
    </div>
  );
}
