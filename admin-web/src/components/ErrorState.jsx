import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorState = ({ title, message, action }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-error/30 bg-error/5 px-6 py-12 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/15">
      <AlertCircle className="h-7 w-7 text-error" />
    </div>
    <h3 className="mt-5 text-base font-semibold text-text">{title}</h3>
    {message && <p className="mt-1 max-w-sm text-sm text-text-secondary">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default ErrorState;
