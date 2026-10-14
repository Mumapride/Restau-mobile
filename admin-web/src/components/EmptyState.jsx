import React from "react";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

const iconMap = {
  success: { icon: CheckCircle, className: "text-success" },
  info: { icon: Info, className: "text-primary" },
  warning: { icon: AlertTriangle, className: "text-warning" },
  error: { icon: XCircle, className: "text-error" },
};

const EmptyState = ({ icon = "info", title, message, action }) => {
  const { icon: Icon, className } = iconMap[icon] || iconMap.info;
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-12 text-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${className} bg-white/80`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-text">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-text-secondary">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
