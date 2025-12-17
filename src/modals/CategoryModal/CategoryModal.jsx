import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";
import { Save, X, Image as ImageIcon } from "lucide-react";
import * as categoryService from "../../api/services/adminCategoryService";
import styles from "./CategoryModal.module.css";

const CategoryModal = ({ mode = "add", categoryData, onSuccess, section }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // If a specific section is passed (e.g., "ONLINE_COURSE"), force it.
  // Otherwise default to the first available specific section.
  const defaultSection = section || "ONLINE_COURSE";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    section: defaultSection,
    isActive: true,
    thumbnail: null,
    previewUrl: "",
  });

  useEffect(() => {
    if (mode === "edit" && categoryData) {
      setFormData({
        name: categoryData.name || "",
        description: categoryData.description || "",
        // Preserve existing section, or fallback to the current context
        section: categoryData.section || defaultSection,
        isActive: categoryData.isActive !== false,
        thumbnail: null,
        previewUrl: categoryData.thumbnailUrl || "",
      });
    } else {
      // In Add Mode, ensure we lock to the passed section
      setFormData((prev) => ({ ...prev, section: defaultSection }));
    }
  }, [mode, categoryData, defaultSection]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        previewUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("section", formData.section); // This will now always be specific
    data.append("isActive", formData.isActive);
    if (formData.thumbnail) {
      data.append("thumbnail", formData.thumbnail);
    }

    try {
      if (mode === "add") {
        await categoryService.saveCategory(data);
      } else {
        await categoryService.saveCategory(
          data,
          categoryData.id || categoryData._id
        );
      }
      if (onSuccess) onSuccess();
      dispatch(closeModal());
    } catch (error) {
      console.error(error);
      // Display backend error message clearly
      const errMsg =
        error.response?.data?.message || "Failed to save category.";
      alert(`Error: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Map section codes to readable labels
  const getSectionLabel = (sec) => {
    switch (sec) {
      case "ONLINE_COURSE":
        return "Online Courses";
      case "DAILY_QUIZ":
        return "Daily Quiz";
      case "TEST_SERIES":
        return "Test Series";
      case "CURRENT_AFFAIRS":
        return "Current Affairs";
      case "E_BOOK":
        return "E-Books";
      case "PUBLICATIONS":
        return "Publications";
      case "PREVIOUS_PAPERS":
        return "Previous Papers";
      default:
        return sec;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.header}>
          <h3>{mode === "add" ? "Add Category" : "Edit Category"}</h3>
          <button
            onClick={() => dispatch(closeModal())}
            className={styles.closeBtn}
            type="button" // Prevent form submission
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Section (Read-Only to enforce strict separation) */}
          <div className={styles.inputGroup}>
            <label>Section (Locked)</label>
            <input
              value={getSectionLabel(formData.section)}
              disabled
              className={styles.disabledInput}
            />
            <p className={styles.helperText}>
              Categories are specific to this section.
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label>Category Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g. UPSC"
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

          <div className={styles.inputGroup}>
            <label>Thumbnail Image</label>
            <div className={styles.imageUploadBox}>
              <input
                type="file"
                onChange={handleFile}
                accept="image/*"
                id="cat-file"
                style={{ display: "none" }}
              />
              <label htmlFor="cat-file" className={styles.uploadLabel}>
                {formData.previewUrl ? (
                  <div className={styles.previewContainer}>
                    <img
                      src={formData.previewUrl}
                      alt="Preview"
                      className={styles.preview}
                    />
                    <span className={styles.changeText}>Click to Change</span>
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <ImageIcon size={24} />
                    <span>Click to Upload</span>
                  </div>
                )}
              </label>
            </div>
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
              <Save size={16} /> {loading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
