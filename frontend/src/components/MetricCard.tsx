import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export default function MetricCard({ title, children, headerAction }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
        {headerAction}
      </div>
      {children}
    </div>
  );
}
