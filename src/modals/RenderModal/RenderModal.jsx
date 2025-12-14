import React from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./RenderModal.module.css";

// Redux
// import { closeModal } from "../../redux/slices/modalSlice";

// Components
import MainModal from "../MainModal/MainModal";

function RenderModal() {
  const activeModal = useSelector((state) => state.modal.type);
  // const dispatch = useDispatch();
  // const [formValue, setFormValue] = useState("");
  // const modalData = useSelector((state) => state.modal.modalData);

  const allModals = {};

  return (
    <MainModal>
      <AnimatePresence mode="wait">
        {activeModal && (
          <motion.div
            key={activeModal}
            className={styles.RenderModal}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
          >
            {allModals[activeModal]}
          </motion.div>
        )}
      </AnimatePresence>
    </MainModal>
  );
}

export default RenderModal;
