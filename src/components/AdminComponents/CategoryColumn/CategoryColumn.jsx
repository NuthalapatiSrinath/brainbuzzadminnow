import React from "react";
import { useDispatch } from "react-redux";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import styles from "./CategoryColumn.module.css";

export default function CategoryColumn({
  category,
  onOpen = () => {},
  onAddSub = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const dispatch = useDispatch();

  const handleOpen = (item) => {
    dispatch({ type: "OPEN_MODAL", payload: { ...item, parent: category } });
    onOpen(item);
  };

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <label className={styles.checkboxWrap}>
            <input type="checkbox" className={styles.checkbox} />
            <span className={styles.fakeBox} />
          </label>
          <span className={styles.categoryName}>{category.name}</span>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            title="Edit Category"
            onClick={() => {
              dispatch({ type: "EDIT_CATEGORY", payload: category });
              onEdit(category);
            }}
          >
            <FiEdit />
          </button>

          <button
            className={styles.iconBtn}
            title="Delete Category"
            onClick={() => {
              dispatch({ type: "DELETE_CATEGORY", payload: category });
              onDelete(category);
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      <div className={styles.subList}>
        {category.subcategories && category.subcategories.length ? (
          category.subcategories.map((sub) => (
            <div key={sub.id} className={styles.subItem}>
              <div className={styles.subLeft}>
                <label className={styles.checkboxWrapSmall}>
                  <input type="checkbox" className={styles.checkboxSmall} />
                  <span className={styles.fakeBoxSmall} />
                </label>

                <button
                  className={styles.subTextBtn}
                  onClick={() => handleOpen(sub)}
                  title={`Open ${sub.name}`}
                >
                  {sub.name}
                </button>
              </div>

              <div className={styles.subActions}>
                <button
                  className={styles.iconBtnSmall}
                  title="Edit Sub"
                  onClick={() => {
                    dispatch({ type: "EDIT_SUB", payload: { category, sub } });
                    onEdit(sub);
                  }}
                >
                  <FiEdit />
                </button>

                <button
                  className={styles.iconBtnSmall}
                  title="Delete Sub"
                  onClick={() => {
                    dispatch({
                      type: "DELETE_SUB",
                      payload: { category, sub },
                    });
                    onDelete(sub);
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyNote}>No groups yet</div>
        )}
      </div>

      <div className={styles.addRow}>
        <button
          className={styles.addLink}
          onClick={() => {
            dispatch({ type: "ADD_SUB_PROMPT", payload: category });
            onAddSub(category);
          }}
        >
          + Add Sub Category
        </button>
      </div>
    </div>
  );
}
