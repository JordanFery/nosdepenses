"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        aria-label="Fermer"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-xl animate-[slideUp_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-end gap-2 sticky bottom-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
