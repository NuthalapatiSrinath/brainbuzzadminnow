import React, { useState } from "react";
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { CATEGORY_VARIANTS } from "./categoryVariants";
import styles from "./CategoryContentAccordion.module.css";

const CategoryContentAccordion = ({
  variant = "courses",
  categoryName,
  subCategories = [],
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [openCategory, setOpenCategory] = useState(false);
  const [openSub, setOpenSub] = useState(null);
  const [searchQueries, setSearchQueries] = useState({});

  // Load config based on variant (e.g., "currentAffairs")
  const config = CATEGORY_VARIANTS[variant] || CATEGORY_VARIANTS["courses"];

  // Helper to generate Grid Template based on config widths
  // If config has widths like "15%", "40%", use them. Otherwise default to 1fr.
  const getGridTemplate = () => {
    if (!config.columns) return "1fr 100px";

    // Map columns to their widths, defaulting to 1fr if not specified
    const colWidths = config.columns.map((col) => col.width || "1fr").join(" ");

    // Append Action column width (fixed)
    return `${colWidths} 80px`;
  };

  const gridTemplate = getGridTemplate();

  const handleSearchChange = (subId, value) => {
    setSearchQueries((prev) => ({ ...prev, [subId]: value }));
  };

  const getFilteredItems = (items, query) => {
    if (!query) return items;
    return items.filter((item) =>
      Object.values(item).some(
        (val) =>
          typeof val === "string" &&
          val.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* 1. MAIN CATEGORY */}
      <div
        className={styles.categoryHeader}
        onClick={() => setOpenCategory(!openCategory)}
      >
        <span className={styles.headerTitle}>{categoryName}</span>
        <div className={styles.actions}>
          {openCategory ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>

      {/* 2. SUB-CATEGORIES LIST */}
      {openCategory &&
        subCategories.map((sub) => {
          const searchQuery = searchQueries[sub.id] || "";
          const displayItems = getFilteredItems(sub.items || [], searchQuery);

          return (
            <div key={sub.id} className={styles.subBox}>
              {/* SUB-CATEGORY HEADER */}
              <div
                className={styles.subHeader}
                onClick={() => setOpenSub(openSub === sub.id ? null : sub.id)}
              >
                <span className={styles.subTitle}>
                  {sub.name}
                  <span className={styles.countBadge}>
                    ({sub.items?.length || 0})
                  </span>
                </span>
                <div className={styles.actions}>
                  {openSub === sub.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {/* CONTENT TABLE */}
              {openSub === sub.id && (
                <div className={styles.subBody}>
                  {/* Search Bar */}
                  <div className={styles.searchWrap}>
                    <input
                      className={styles.search}
                      placeholder={config.searchPlaceholder || "Search..."}
                      value={searchQuery}
                      onChange={(e) =>
                        handleSearchChange(sub.id, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      className={styles.addBtn}
                      onClick={() => onAddItem(sub)}
                    >
                      {config.addButtonText || "+ Add New"}
                    </button>
                  </div>

                  <div className={styles.tableContainer}>
                    {/* TABLE HEAD */}
                    <div
                      className={styles.tableHead}
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {config.columns.map((col) => (
                        <span key={col.key} className={styles.headCell}>
                          {col.label}
                        </span>
                      ))}
                      <span className={styles.headCellAction}>Action</span>
                    </div>

                    {/* TABLE BODY */}
                    {displayItems.length > 0 ? (
                      displayItems.map((item) => (
                        <div
                          key={item.id}
                          className={styles.tableRow}
                          style={{ gridTemplateColumns: gridTemplate }}
                        >
                          {config.columns.map((col) => (
                            <span
                              key={col.key}
                              className={styles.cell}
                              title={item[col.key]}
                            >
                              {item[col.key]}
                            </span>
                          ))}

                          <div className={styles.rowActions}>
                            <FiEdit
                              className={styles.actionIcon}
                              onClick={() => onEditItem(item)}
                              title="Edit"
                            />
                            <FiTrash2
                              className={styles.deleteIcon}
                              onClick={() => onDeleteItem(item)}
                              title="Delete"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noData}>No items found.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default CategoryContentAccordion;
