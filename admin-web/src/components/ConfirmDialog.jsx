import React, { useEffect, useRef } from "react";
import Button from "./Button.jsx";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "danger",
  disabled,
}) => {
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  // Keyboard behavior: Escape triggers the safe action (Cancel), and focus
  // lands on Cancel when the dialog opens. No full focus trap is attempted.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancelRef.current?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    if (cancelRef.current && typeof cancelRef.current.focus === "function") {
      cancelRef.current.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-lg"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={disabled}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
