import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import styles from "./CategoryColumn.module.css";

const CategoryColumn = ({
  categories = [],
  onEditCategory,
  onDeleteCategory,
  onEditSub,
  onDeleteSub,
  onAddSub,
}) => {
  return (
    <div className={styles.wrapper}>
      {/* ===== HEADER ROW ===== */}
      <div
        className={styles.headerRow}
        style={{
          gridTemplateColumns: `repeat(${categories.length}, minmax(280px, 1fr))`,
        }}
      >
        {categories.map((cat) => (
          <div key={cat.id} className={styles.headerCell}>
            <div className={styles.headerLeft}>
              <input type="checkbox" />
              <span>{cat.name}</span>
            </div>

            <div className={styles.headerActions}>
              <FiEdit onClick={() => onEditCategory(cat)} />
              <FiTrash2 onClick={() => onDeleteCategory(cat)} />
            </div>
          </div>
        ))}
      </div>

      {/* ===== BODY ===== */}
      <div
        className={styles.bodyRow}
        style={{
          gridTemplateColumns: `repeat(${categories.length}, minmax(280px, 1fr))`,
        }}
      >
        {categories.map((cat) => (
          <div key={cat.id} className={styles.column}>
            {cat.subcategories?.length ? (
              cat.subcategories.map((sub) => (
                <div key={sub.id} className={styles.subRow}>
                  <div className={styles.subLeft}>
                    <input type="checkbox" />
                    <span>{sub.name}</span>
                  </div>

                  <div className={styles.subActions}>
                    <FiEdit onClick={() => onEditSub(sub)} />
                    <FiTrash2 onClick={() => onDeleteSub(sub)} />
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>No groups yet</div>
            )}

            <button className={styles.addSub} onClick={() => onAddSub(cat)}>
              + Add Sub Category
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryColumn;
