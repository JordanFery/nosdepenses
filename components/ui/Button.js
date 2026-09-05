"use client";

const VARIANTS = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:outline-neutral-900",
  secondary:
    "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus-visible:outline-neutral-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  ghost: "text-neutral-600 hover:bg-neutral-100 focus-visible:outline-neutral-300",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  loading,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
