import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";
import * as publicationService from "../../../api/services/adminPublicationService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import { getAllLanguages } from "../../../api/apiRoutes";
import AdminEditor from "../AdminEditor/AdminEditor";
import styles from "./EditPublicationModal.module.css";

const CONTENT_TYPE = "PUBLICATION"; // ✅ MUST be singular

const EditPublicationModal = ({ isOpen, data, onClose }) => {
  const [loading, setLoading] = useState(false);

  const [lists, setLists] = useState({
    cats: [],
    subs: [],
    langs: [],
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountPrice: "",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
    isActive: true,
    thumbnailUrl: "",
    bookFileUrl: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [bookFile, setBookFile] = useState(null);

  /* ---------------------------------------------
     INIT
  --------------------------------------------- */
  useEffect(() => {
    if (!isOpen || !data) return;

    Promise.all([
      categoryService.getAllCategories(CONTENT_TYPE),
      subCategoryService.getAllSubCategories(null, CONTENT_TYPE),
      getAllLanguages(),
    ]).then(([c, s, l]) => {
      setLists({
        cats: c.data || [],
        subs: s.data || [],
        langs: l.data?.data || [],
      });
    });

    setFormData({
      name: data.name || "",
      description: data.detailedDescription || data.description || "",
      originalPrice: data.originalPrice || "",
      discountPrice: data.discountPrice || "",
      categoryIds: data.categories?.map((c) => c._id) || [],
      subCategoryIds: data.subCategories?.map((s) => s._id) || [],
      languageIds: data.languages?.map((l) => l._id) || [],
      isActive: data.isActive ?? true,
      thumbnailUrl: data.thumbnailUrl || "",
      bookFileUrl: data.bookFileUrl || "",
    });

    setThumbnail(null);
    setBookFile(null);
  }, [isOpen, data]);

  /* ---------------------------------------------
     HANDLERS
  --------------------------------------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData({ ...formData, [e.target.name]: values });
  };

  /* ---------------------------------------------
     SUBMIT
  --------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();

      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("originalPrice", formData.originalPrice);
      formPayload.append("discountPrice", formData.discountPrice);
      formPayload.append("isActive", String(formData.isActive));

      formData.categoryIds.forEach((id) =>
        formPayload.append("categories", id)
      );
      formData.subCategoryIds.forEach((id) =>
        formPayload.append("subCategories", id)
      );
      formData.languageIds.forEach((id) => formPayload.append("languages", id));

      // ✅ Files only if replaced
      if (thumbnail) formPayload.append("thumbnail", thumbnail);
      if (bookFile) formPayload.append("bookFile", bookFile);

      await publicationService.updatePublication(data._id, formPayload);

      alert("Publication updated successfully");
      onClose(true);
    } catch (err) {
      console.error("❌ Update Error:", err);
      alert("Update Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ---------------------------------------------
     UI
  --------------------------------------------- */
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Edit Publication</h2>
          <button className={styles.closeBtn} onClick={() => onClose(false)}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {/* BASIC INFO */}
          <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
              <label>Title</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Price (₹)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* FILES */}
          <div className={styles.filesSection}>
            <div className={styles.fileItem}>
              <label>
                <ImageIcon size={14} /> Cover Image
              </label>

              {formData.thumbnailUrl && (
                <img
                  src={formData.thumbnailUrl}
                  alt="Cover"
                  className={styles.previewImg}
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />

              {thumbnail && (
                <span className={styles.badge}>New image selected</span>
              )}
            </div>

            <div className={styles.fileItem}>
              <label>
                <FileText size={14} /> PDF File
              </label>

              {formData.bookFileUrl && (
                <a
                  href={`https://docs.google.com/gview?url=${encodeURIComponent(
                    formData.bookFileUrl
                  )}&embedded=true`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.link}
                >
                  <ExternalLink size={14} /> View PDF
                </a>
              )}

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setBookFile(e.target.files[0])}
              />

              {bookFile && (
                <span className={styles.badge}>New PDF selected</span>
              )}
            </div>
          </div>

          {/* DROPDOWNS */}
          <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
              <label>Categories</label>
              <select
                multiple
                name="categoryIds"
                value={formData.categoryIds}
                onChange={handleMultiSelect}
                className={styles.multiSelect}
              >
                {lists.cats.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Languages</label>
              <select
                multiple
                name="languageIds"
                value={formData.languageIds}
                onChange={handleMultiSelect}
                className={styles.multiSelect}
              >
                {lists.langs.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className={styles.inputGroup}>
            <label>Description</label>
            <AdminEditor
              value={formData.description}
              onChange={(v) => setFormData({ ...formData, description: v })}
            />
          </div>

          {/* FOOTER */}
          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => onClose(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.saveBtn}>
              <Save size={18} />
              {loading ? " Updating..." : " Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPublicationModal;
