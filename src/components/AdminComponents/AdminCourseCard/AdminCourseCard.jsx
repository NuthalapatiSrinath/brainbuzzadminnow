import React from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Edit2, Trash2, Plus } from "lucide-react";
import { openModal } from "../../../redux/slices/modalSlice";
import styles from "./AdminCourseCard.module.css";

const AdminCourseCard = ({
  data,
  variant = "display", // 'display' for existing course, 'add' for add new button card
}) => {
  const dispatch = useDispatch();

  // --- Handlers ---

  const handleEdit = (e) => {
    e.stopPropagation();
    // Dispatch generic 'EDIT' modal with data
    dispatch(
      openModal({
        modalType: "EDIT_COURSE",
        modalProps: { courseId: data.id, courseData: data },
      })
    );
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // Dispatch generic 'DELETE' confirmation modal
    dispatch(
      openModal({
        modalType: "DELETE_CONFIRMATION",
        modalProps: { id: data.id, type: "online-course", title: data.title },
      })
    );
  };

  const handleAdd = () => {
    // Dispatch generic 'ADD' modal
    dispatch(
      openModal({
        modalType: "ADD_COURSE",
        modalProps: {},
      })
    );
  };

  // --- Render: Add New Card Variant ---
  if (variant === "add") {
    return (
      <div className={`${styles.card} ${styles.addCard}`} onClick={handleAdd}>
        <div className={styles.addIconWrapper}>
          <Plus size={40} className={styles.addIcon} />
        </div>
        <h3 className={styles.addText}>Add New Course</h3>
      </div>
    );
  }

  // --- Render: Display Course Card ---
  const { title, category, price, discount, image } = data || {};

  // Calculate discounted price if applicable
  const finalPrice = discount
    ? Math.round(price - (price * discount) / 100)
    : price;

  return (
    <div className={styles.card}>
      {/* Thumbnail */}
      <div className={styles.imageWrapper}>
        <img
          src={image || "https://placehold.co/600x400?text=Course"}
          alt={title}
          className={styles.image}
        />
        <div className={styles.badge}>{category}</div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>

        <div className={styles.pricing}>
          <span className={styles.finalPrice}>₹{finalPrice}</span>
          {discount > 0 && (
            <>
              <span className={styles.originalPrice}>₹{price}</span>
              <span className={styles.discount}>({discount}% Off)</span>
            </>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.editBtn}`}
          onClick={handleEdit}
          title="Edit Course"
        >
          <Edit2 size={16} />
          <span>Edit</span>
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={handleDelete}
          title="Delete Course"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

AdminCourseCard.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.number,
    discount: PropTypes.number,
    image: PropTypes.string,
  }),
  variant: PropTypes.oneOf(["display", "add"]),
};

export default AdminCourseCard;
