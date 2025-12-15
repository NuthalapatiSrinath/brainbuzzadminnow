import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";
import styles from "./DeleteModal.module.css";

const DeleteModal = ({ title, message, onConfirm }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      dispatch(closeModal());
    } catch (error) {
      console.error("Delete error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>{title || "Confirm Delete"}</h3>
      <p>
        {message ||
          "Are you sure you want to delete this item? This action cannot be undone."}
      </p>
      <div className={styles.actions}>
        <button
          onClick={() => dispatch(closeModal())}
          className={styles.cancel}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={styles.confirm}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default DeleteModal;
