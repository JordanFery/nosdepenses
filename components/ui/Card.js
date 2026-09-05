export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
