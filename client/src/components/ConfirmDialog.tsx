import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDangerous?: boolean;
}

const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirm', isDangerous = false
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex flex-col items-center text-center gap-4">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDangerous ? 'bg-red-100' : 'bg-yellow-100'}`}>
        <AlertTriangle size={24} className={isDangerous ? 'text-red-600' : 'text-yellow-600'} />
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
      <div className="flex gap-3 w-full">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`flex-1 px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors ${
            isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
