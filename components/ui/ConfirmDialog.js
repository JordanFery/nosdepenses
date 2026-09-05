"use client";

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Confirmer",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-neutral-600">{message}</p>
    </Modal>
  );
}
