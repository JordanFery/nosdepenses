import { Inbox, AlertTriangle } from "lucide-react";

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <Inbox size={22} />
      </span>
      <p className="font-medium text-neutral-800">{title}</p>
      {description && <p className="max-w-sm text-sm text-neutral-500">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="shrink-0" />
        <span>{message || "Une erreur est survenue."}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline underline-offset-2 shrink-0">
          Réessayer
        </button>
      )}
    </div>
  );
}
