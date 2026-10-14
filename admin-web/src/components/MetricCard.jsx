import React from "react";
import { User, Banknote, CreditCard, Receipt } from "lucide-react";

const metricConfig = {
  students: { label: "Registered Students", icon: User, color: "text-primary" },
  subscriptions: {
    label: "Active Subscriptions",
    icon: CreditCard,
    color: "text-success",
  },
  revenue: { label: "Verified Revenue", icon: Banknote, color: "text-success" },
  claims: { label: "Meal Claims", icon: Receipt, color: "text-error" },
};

const MetricCard = ({ label, value, subtitle, accent }) => {
  const Config = metricConfig[accent]?.icon || User;
  const accentClass =
    metricConfig[accent]?.color || "text-primary";
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accentClass} bg-primary-muted`}>
        <Config className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-semibold text-text">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
      </div>
    </div>
  );
};

export { MetricCard, metricConfig };
