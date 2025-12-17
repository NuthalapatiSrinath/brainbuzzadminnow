import React from "react";
import { X } from "lucide-react";
import styles from "./UpdateModal.module.css";

const UpdateModal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Update",
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        <div className={styles.modalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
