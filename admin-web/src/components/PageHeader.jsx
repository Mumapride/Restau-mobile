import React from "react";

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-text">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
    </div>
    {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
  </div>
);

export default PageHeader;
