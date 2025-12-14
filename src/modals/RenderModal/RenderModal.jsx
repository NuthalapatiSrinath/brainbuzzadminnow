import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { closeModal } from "../../redux/slices/modalSlice"; // Import closeModal
import styles from "./RenderModal.module.css";

// Components
import MainModal from "../MainModal/MainModal";
import AdminLoginModal from "../AdminLoginModal/AdminLoginModal";

function RenderModal() {
  const dispatch = useDispatch();

  // 1. FIX: Access 'modalData' from the slice, not 'props'
  const activeModal = useSelector((state) => state.modal.type);
  const modalData = useSelector((state) => state.modal.modalData) || {};

  // 2. Define the Mapping
  // Ensure the keys here match exactly what you dispatch (e.g., 'login')
  const allModals = {
    login: <AdminLoginModal {...modalData} />,
    ADMIN_LOGIN: <AdminLoginModal {...modalData} />,
  };

  // Helper to handle closing
  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    // Pass onClose to MainModal if it supports it (for overlay click)
    <MainModal onClose={handleClose}>
      <AnimatePresence mode="wait">
        {activeModal && allModals[activeModal] && (
          <motion.div
            key={activeModal}
            className={styles.RenderModal}
            // Ensure styles.RenderModal is defined in your CSS, otherwise this div might be invisible
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
            style={{ width: "100%", height: "100%" }} // Inline fallback style
          >
            {allModals[activeModal]}
          </motion.div>
        )}
      </AnimatePresence>
    </MainModal>
  );
}

export default RenderModal;
