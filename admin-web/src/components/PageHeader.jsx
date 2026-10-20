import React from "react";

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action && <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div>}
  </div>
);

export default PageHeader;