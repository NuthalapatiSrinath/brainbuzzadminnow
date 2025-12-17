import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";
import { Save, X } from "lucide-react";
import * as subCategoryService from "../../api/services/adminSubCategoryService";
import * as categoryService from "../../api/services/adminCategoryService";
import styles from "./SubCategoryModal.module.css";

const SubCategoryModal = ({
  mode = "add",
  subData,
  parentCategory,
  onSuccess,
  section,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [parentCats, setParentCats] = useState([]);

  // 1. Force Section (Default to ONLINE_COURSE if missing, but usually passed)
  const lockedSection = section || "ONLINE_COURSE";

  const [formData, setFormData] = useState({
    name: "",
    categoryId: parentCategory?._id || "",
    description: "",
    section: lockedSection, // Lock it here
    isActive: true,
  });

  // 2. Fetch Parent Categories (Filtered by Section)
  useEffect(() => {
    const fetchParents = async () => {
      try {
        // Fetch ONLY categories for this specific section
        const res = await categoryService.getAllCategories(lockedSection);
        setParentCats(res.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchParents();
  }, [lockedSection]);

  // 3. Initialize Form Data
  useEffect(() => {
    if (mode === "edit" && subData) {
      setFormData({
        name: subData.name || "",
        categoryId: subData.category?._id || subData.category || "",
        description: subData.description || "",
        section: subData.section || lockedSection, // Keep existing or use locked
        isActive: subData.isActive !== false,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        section: lockedSection,
        categoryId: parentCategory?._id || prev.categoryId,
      }));
    }
  }, [mode, subData, parentCategory, lockedSection]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        category: formData.categoryId,
        description: formData.description,
        section: formData.section,
        isActive: formData.isActive,
      };

      // --- FIX STARTS HERE ---
      // Use 'saveSubCategory' for both. Pass ID as second arg if editing.
      if (mode === "add") {
        await subCategoryService.saveSubCategory(payload);
      } else {
        await subCategoryService.saveSubCategory(
          payload,
          subData._id || subData.id
        );
      }
      // --- FIX ENDS HERE ---

      if (onSuccess) onSuccess();
      dispatch(closeModal());
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.response?.data?.message || "Operation failed"}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper for Display Labels
  const getSectionLabel = (sec) => {
    const map = {
      DAILY_QUIZ: "Daily Quiz",
      ONLINE_COURSE: "Online Courses",
      TEST_SERIES: "Test Series",
      CURRENT_AFFAIRS: "Current Affairs",
    };
    return map[sec] || sec;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.header}>
          <h3>{mode === "add" ? "Add Sub-Category" : "Edit Sub-Category"}</h3>
          <button
            onClick={() => dispatch(closeModal())}
            className={styles.closeBtn}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* LOCKED SECTION INPUT */}
          <div className={styles.inputGroup}>
            <label>Section (Fixed)</label>
            <input
              value={getSectionLabel(formData.section)}
              disabled
              className={styles.disabledInput} // Add gray styling in CSS
            />
            <small style={{ color: "#666", fontSize: "0.8rem" }}>
              This sub-category will only be visible in{" "}
              {getSectionLabel(formData.section)}.
            </small>
          </div>

          <div className={styles.inputGroup}>
            <label>Parent Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
            >
              <option value="">-- Select Parent Category --</option>
              {parentCats.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Sub-Category Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g. Polity"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => dispatch(closeModal())}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.saveBtn}>
              <Save size={16} /> {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategoryModal;
