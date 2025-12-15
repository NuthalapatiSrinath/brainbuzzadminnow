import { useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./MainModal.module.css";

function MainModal({ children, onClose }) {
  // ✅ Accept onClose
  const activeModal = useSelector((state) => state.modal.type);

  // List of modals that should appear as a Side Drawer (Right side)
  const isDrawer = ["studentSection", "staffSection"].includes(activeModal);

  // Lock background scroll
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeModal]);

  if (!activeModal) return null;

  return (
    <div
      className={`${styles.MainModal} ${
        isDrawer ? styles.fullscreen : styles.centered
      }`}
      onClick={onClose} // ✅ Close when clicking the overlay
    >
      {/* This inner div wraps the content. 
        e.stopPropagation() prevents the click from bubbling to the overlay 
        so clicking the form doesn't close the modal.
      */}
      <div
        className={isDrawer ? styles.drawerContent : styles.centerContent}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default MainModal;
