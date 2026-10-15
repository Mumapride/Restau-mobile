import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const Modal = ({
  open,
  title,
  onClose,
  size = "default",
  children,
  footer,
}) => {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Keyboard behavior: Escape closes the dialog, and focus moves into the
  // dialog (close button first) when it opens. This is intentionally NOT a
  // full focus trap — focus is simply placed sensibly on open.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    const closeBtn = dialogRef.current?.querySelector("[data-modal-close]");
    if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    default: "max-w-lg",
    xl: "max-w-3xl",
    full: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialogRef}
        className={`w-full ${sizeClasses[size]} rounded-xl border border-border bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <button
            className="rounded-md p-1 text-text-secondary hover:bg-border"
            onClick={onClose}
            aria-label="Close dialog"
            data-modal-close="true"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
