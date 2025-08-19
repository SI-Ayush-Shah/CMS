import { useMemo } from "react";

const StatCard = ({ label, value, delta }) => {
  const deltaColor = delta >= 0 ? "text-green-400" : "text-error-400";
  const deltaPrefix = delta >= 0 ? "+" : "";
  return (
    <div className="rounded-[15px] border border-border-main-default/60 bg-core-neu-1000 p-4">
      <div className="text-text-invert-low text-sm">{label}</div>
      <div className="mt-1 text-invert-high text-2xl font-semibold">
        {value}
      </div>
      <div className={`mt-1 text-xs ${deltaColor}`}>
        {deltaPrefix}
        {delta}% vs last week
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const stats = useMemo(
    () => [
      { label: "Total Articles", value: 128, delta: 12 },
      { label: "AI Generated", value: 76, delta: 8 },
      { label: "Avg. Read Time", value: "6m 24s", delta: -3 },
      { label: "Unique Visitors", value: "12.4k", delta: 5 },
    ],
    []
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-[28px] font-semibold mb-6">Analytics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="rounded-[15px] border border-border-main-default/60 bg-core-neu-1000">
          <div className="p-4 border-b border-border-main-default/40 text-invert-high font-medium">
            Traffic Overview
          </div>
          <div className="p-4 text-text-invert-low text-sm">
            {/* Placeholder chart area */}
            <div className="h-64 w-full rounded-[10px] bg-core-neu-900/60 grid place-items-center">
              <span className="opacity-70">Charts coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
