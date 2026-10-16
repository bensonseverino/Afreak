import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

// Destructive actions are always behind this dialog (spec §10).
export default function ConfirmDialog({
  open,
  onClose,
  title = 'Are you sure?',
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  destructive = true,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="text-[14px] text-graphite leading-relaxed">{children}</div>
      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1 h-12 text-[12px]" type="button">
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 h-12 text-[12px] ${destructive ? 'bg-danger border-danger hover:bg-danger/90 hover:border-danger/90' : ''}`}
          type="button"
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
