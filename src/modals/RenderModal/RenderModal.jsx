import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { closeModal } from "../../redux/slices/modalSlice";
import styles from "./RenderModal.module.css";

// Components
import MainModal from "../MainModal/MainModal";
import AdminLoginModal from "../AdminLoginModal/AdminLoginModal";
import CategoryModal from "../CategoryModal/CategoryModal";
import SubCategoryModal from "../SubCategoryModal/SubCategoryModal"; // Import
import DeleteModal from "../DeleteModal/DeleteModal";

// Services (for deletion logic inside DeleteModal if preferred, or keep logic in Page)

function RenderModal() {
  const dispatch = useDispatch();
  const activeModal = useSelector((state) => state.modal.type);
  const modalData = useSelector((state) => state.modal.modalData) || {};

  const handleClose = () => dispatch(closeModal());

  const allModals = {
    login: <AdminLoginModal {...modalData} />,
    ADMIN_LOGIN: <AdminLoginModal {...modalData} />,

    // Category Management
    CATEGORY_MODAL: <CategoryModal {...modalData} />,

    // SubCategory Management
    SUBCATEGORY_MODAL: <SubCategoryModal {...modalData} />,

    // Generic Delete
    DELETE_MODAL: <DeleteModal {...modalData} />,
  };

  return (
    <MainModal onClose={handleClose}>
      <AnimatePresence mode="wait">
        {activeModal && allModals[activeModal] && (
          <motion.div
            key={activeModal}
            className={styles.RenderModal}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            {allModals[activeModal]}
          </motion.div>
        )}
      </AnimatePresence>
    </MainModal>
  );
}

export default RenderModal;
