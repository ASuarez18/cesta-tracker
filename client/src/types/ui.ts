export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  isDanger: boolean;
  onConfirm: () => Promise<void>;
}
