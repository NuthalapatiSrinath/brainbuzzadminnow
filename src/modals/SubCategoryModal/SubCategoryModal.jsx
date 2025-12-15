import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/modalSlice";
import { Save, X, Image as ImageIcon } from "lucide-react";
import * as subCategoryService from "../../api/services/adminSubCategoryService";
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    section: section || "ALL",
    isActive: true,
    thumbnail: null,
    previewUrl: "",
  });

  useEffect(() => {
    if (mode === "edit" && subData) {
      setFormData({
        name: subData.name || "",
        description: subData.description || "",
        section: subData.section || "ALL",
        isActive: subData.isActive !== false,
        thumbnail: null,
        previewUrl: subData.thumbnailUrl || "",
      });
    } else {
      setFormData((prev) => ({ ...prev, section: section || "ALL" }));
    }
  }, [mode, subData, section]);

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
    data.append("section", formData.section);
    data.append("isActive", formData.isActive);

    // If adding, link to parent category
    if (mode === "add" && parentCategory) {
      data.append("category", parentCategory.id || parentCategory._id);
    }

    if (formData.thumbnail) {
      data.append("thumbnail", formData.thumbnail);
    }

    try {
      if (mode === "add") {
        await subCategoryService.saveSubCategory(data);
      } else {
        await subCategoryService.saveSubCategory(
          data,
          subData.id || subData._id
        );
      }
      if (onSuccess) onSuccess();
      dispatch(closeModal());
    } catch (error) {
      console.error(error);
      alert("Failed to save subcategory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.header}>
        <h3>
          {mode === "add"
            ? `Add to ${parentCategory?.name}`
            : "Edit SubCategory"}
        </h3>
        <button
          onClick={() => dispatch(closeModal())}
          className={styles.closeBtn}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>SubCategory Name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g. Prelims, Mains"
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
              id="sub-file"
            />
            <label htmlFor="sub-file" className={styles.uploadLabel}>
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
          <button type="submit" disabled={loading} className={styles.saveBtn}>
            <Save size={16} /> {loading ? "Saving..." : "Save SubCategory"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubCategoryModal;
