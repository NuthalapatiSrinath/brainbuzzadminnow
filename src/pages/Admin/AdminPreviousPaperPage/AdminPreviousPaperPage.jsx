import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../redux/slices/modalSlice";
import { Plus, Trash2 } from "lucide-react";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";

import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import styles from "./AdminPreviousPaperPage.module.css";

const AdminPreviousPaperPage = () => {
  const dispatch = useDispatch();

  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // --- CONFIG ---
  // Must match Backend Enum ('PREVIOUS_PAPER')
  const CURRENT_SECTION = "PREVIOUS_PAPER";

  // --- Helper: Organize Data ---
  const processDataToColumns = (categories, subcategories) => {
    const groups = {};
    // 1. Create Columns for Categories
    categories.forEach((cat) => {
      groups[cat._id] = {
        id: cat._id,
        name: cat.name,
        ...cat,
        subcategories: [],
      };
    });

    // 2. Put SubCategories into Columns
    subcategories.forEach((sub) => {
      const parentId = sub.category?._id || sub.category;
      if (groups[parentId]) {
        groups[parentId].subcategories.push({ ...sub, id: sub._id });
      }
    });

    return Object.values(groups);
  };

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, subsRes] = await Promise.all([
        categoryService.getAllCategories(CURRENT_SECTION),
        subCategoryService.getAllSubCategories(null, CURRENT_SECTION),
      ]);

      const cols = processDataToColumns(catsRes.data || [], subsRes.data || []);
      setColumns(cols);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---

  const handleAddCategory = () => {
    dispatch(
      openModal({
        type: "CATEGORY_MODAL",
        modalData: {
          mode: "add",
          section: CURRENT_SECTION,
          onSuccess: fetchData,
        },
      })
    );
  };

  const handleEditCategory = (category) => {
    dispatch(
      openModal({
        type: "CATEGORY_MODAL",
        modalData: {
          mode: "edit",
          categoryData: category,
          onSuccess: fetchData,
        },
      })
    );
  };

  const handleDeleteCategory = (category) => {
    dispatch(
      openModal({
        type: "DELETE_MODAL",
        modalData: {
          title: "Delete Category",
          message: `Delete "${category.name}"? SubCategories inside will be lost.`,
          onConfirm: async () => {
            await categoryService.deleteCategory(category.id);
            fetchData();
          },
        },
      })
    );
  };

  const handleAddSubCategory = (parentCategory) => {
    dispatch(
      openModal({
        type: "SUBCATEGORY_MODAL",
        modalData: {
          mode: "add",
          parentCategory: parentCategory,
          section: CURRENT_SECTION,
          onSuccess: fetchData,
        },
      })
    );
  };

  const handleEditSubCategory = (sub) => {
    dispatch(
      openModal({
        type: "SUBCATEGORY_MODAL",
        modalData: { mode: "edit", subData: sub, onSuccess: fetchData },
      })
    );
  };

  const handleDeleteSubCategory = (sub) => {
    dispatch(
      openModal({
        type: "DELETE_MODAL",
        modalData: {
          title: "Delete SubCategory",
          message: `Delete "${sub.name}"?`,
          onConfirm: async () => {
            await subCategoryService.deleteSubCategory(sub.id);
            fetchData();
          },
        },
      })
    );
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedCategories);
    if (!ids.length) return;
    if (window.confirm(`Delete ${ids.length} categories?`)) {
      await categoryService.bulkDeleteCategories(ids);
      fetchData();
      setSelectedCategories(new Set());
    }
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <h1>Previous Papers: Structure</h1>
        <div className={styles.headerActions}>
          {selectedCategories.size > 0 && (
            <button className={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
              <Trash2 size={16} /> Delete Selected ({selectedCategories.size})
            </button>
          )}
          <button className={styles.addBtnMain} onClick={handleAddCategory}>
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className={styles.columnsContainer}>
        {columns.length > 0 ? (
          <CategoryColumn
            categories={columns}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onEditSub={handleEditSubCategory}
            onDeleteSub={handleDeleteSubCategory}
            onAddSub={handleAddSubCategory}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>
              No Previous Paper categories found. Click "Add Category" to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPreviousPaperPage;
