import React, { useEffect } from "react";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isLoading = false,
}) => {

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation(); 
      onClose();
    }
  };

  if (isOpen) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);
  }

  return () => {
    document.body.style.overflow = "unset";
    window.removeEventListener("keydown", handleKeyDown, true);
  };
}, [isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <p className="text-sm text-carbon-black-700 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center  justify-end gap-3 pt-3 border-t border-carbon-black-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm  font-medium text-carbon-black-700 cursor-pointer disabled:cursor-not-allowed hover:bg-carbon-black-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-dusty-olive-700 hover:bg-dusty-olive-800"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};