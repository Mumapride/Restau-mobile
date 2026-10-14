import React from "react";

const Input = ({
  label,
  error,
  hint,
  className = "",
  leftIcon,
  rightElement,
  ...props
}) => {
  const container = className
    ? `w-full rounded-lg border border-border bg-white px-3 py-2 text-text placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition ${className}`
    : "w-full rounded-lg border border-border bg-white px-3 py-2 text-text placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {leftIcon}
          </div>
        )}
        <input
          className={`${container} ${leftIcon ? "pl-10" : ""} ${rightElement ? "pr-10" : ""}`}
          autoComplete="off"
          {...props}
        />
        {error && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-error">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
        )}
        {rightElement}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};

export default Input;
