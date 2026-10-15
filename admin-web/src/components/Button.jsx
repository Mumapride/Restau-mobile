import React from "react";

const Spinner = ({ className = "h-4 w-4" }) => (
  <svg
    className={` animate-spin ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="32 16"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled,
  loading = false,
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary-dark",
    secondary: "bg-white text-text border border-border hover:bg-surfaceAlt focus:ring-primary focus:ring-offset-white",
    ghost: "text-text hover:bg-surfaceAlt focus:ring-primary focus:ring-offset-white",
    danger: "bg-error text-white hover:bg-red-700 focus:ring-error",
    success: "bg-success text-white hover:bg-success-dark focus:ring-success",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-5 py-2.5 text-base rounded-lg",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;
