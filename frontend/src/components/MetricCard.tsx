import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function MetricCard({ title, children }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0 overflow-hidden">
      <h3 className="text-sm font-medium text-gray-500 mb-3 sm:mb-4">{title}</h3>
      {children}
    </div>
  );
}
