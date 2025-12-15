import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";
import { Save, X, Image as ImageIcon } from "lucide-react";
import * as categoryService from "../../api/services/adminCategoryService";
import styles from "./CategoryModal.module.css";

const CategoryModal = ({ mode = "add", categoryData, onSuccess, section }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    section: section || "ALL",
    isActive: true,
    thumbnail: null,
    previewUrl: "",
  });

  useEffect(() => {
    if (mode === "edit" && categoryData) {
      setFormData({
        name: categoryData.name || "",
        description: categoryData.description || "",
        section: categoryData.section || "ALL",
        isActive: categoryData.isActive !== false,
        thumbnail: null,
        previewUrl: categoryData.thumbnailUrl || "",
      });
    } else {
      setFormData((prev) => ({ ...prev, section: section || "ALL" }));
    }
  }, [mode, categoryData, section]);

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

    // Use FormData to send File + Text
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("section", formData.section);
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
      alert("Failed to save category. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.header}>
        <h3>{mode === "add" ? "Add Category" : "Edit Category"}</h3>
        <button
          onClick={() => dispatch(closeModal())}
          className={styles.closeBtn}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Category Name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <label>Visibility Scope</label>
          <select
            value={formData.section}
            onChange={(e) =>
              setFormData({ ...formData, section: e.target.value })
            }
          >
            <option value="ALL">Global (Visible Everywhere)</option>
            <option value="ONLINE_COURSE">Online Courses</option>
            <option value="DAILY_QUIZ">Daily Quiz</option>
            <option value="TEST_SERIES">Test Series</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Thumbnail Image</label>
          <div className={styles.imageUploadBox}>
            <input
              type="file"
              onChange={handleFile}
              accept="image/*"
              id="cat-file"
            />
            <label htmlFor="cat-file" className={styles.uploadLabel}>
              {formData.previewUrl ? (
                <img
                  src={formData.previewUrl}
                  alt="Preview"
                  className={styles.preview}
                />
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
  );
};

export default CategoryModal;
