import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/index';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  itemName?: string;
}

const DeleteModal = ({ open, onClose, onConfirm, title = 'Delete Item', message = 'Are you sure you want to delete this item?', itemName }: Props) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-calm-surface shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-calm-text">{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="cursor-pointer rounded p-1 text-slate-500 transition hover:bg-calm-background hover:text-calm-accent">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
            <AlertTriangle size={30} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-calm-text">{message}</p>
            {itemName && <p className="font-semibold text-calm-text">"{itemName}"</p>}
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 p-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
