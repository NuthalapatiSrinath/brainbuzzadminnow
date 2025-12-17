import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";
import * as eBookService from "../../../api/services/adminEBookService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import { getAllLanguages } from "../../../api/apiRoutes";
import AdminEditor from "../AdminEditor/AdminEditor";
import styles from "./EditEBookModal.module.css";

const EditEBookModal = ({ isOpen, eBook, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState({ cats: [], subs: [], langs: [] });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
    isActive: true,
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [bookFile, setBookFile] = useState(null);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!isOpen || !eBook) return;

    Promise.all([
      categoryService.getAllCategories("E_BOOK"),
      subCategoryService.getAllSubCategories(null, "E_BOOK"),
      getAllLanguages(),
    ]).then(([c, s, l]) => {
      setLists({
        cats: c.data || [],
        subs: s.data || [],
        langs: l.data?.data || [],
      });
    });

    setFormData({
      name: eBook.name || "",
      description: eBook.description || "",
      categoryIds: eBook.categories?.map((c) => c._id) || [],
      subCategoryIds: eBook.subCategories?.map((s) => s._id) || [],
      languageIds: eBook.languages?.map((l) => l._id) || [],
      isActive: eBook.isActive ?? true,
    });

    setThumbnail(null);
    setBookFile(null);
  }, [isOpen, eBook]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        categories: formData.categoryIds,
        subCategories: formData.subCategoryIds,
        languages: formData.languageIds,
        isActive: formData.isActive,
      };

      const formPayload = new FormData();

      // ✅ VERY IMPORTANT
      formPayload.append("ebook", JSON.stringify(payload));

      if (thumbnail) {
        formPayload.append("thumbnail", thumbnail);
      }

      if (bookFile) {
        formPayload.append("bookFile", bookFile); // ✅ CORRECT KEY
      }

      console.log("📤 UPDATE EBOOK PAYLOAD");
      for (let pair of formPayload.entries()) {
        console.log(pair[0], pair[1]);
      }

      await eBookService.updateEBook(eBook._id, formPayload);

      alert("E-Book Updated Successfully");
      onClose(true);
    } catch (err) {
      console.error("❌ UPDATE FAILED:", err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Edit E-Book</h2>
          <button onClick={() => onClose(false)} className={styles.closeBtn}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <label>Book Name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <label>Description</label>
          <AdminEditor
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
          />

          {/* EXISTING FILES */}
          <div className={styles.previewSection}>
            {eBook.thumbnailUrl && (
              <img
                src={eBook.thumbnailUrl}
                alt="Thumbnail"
                className={styles.previewImg}
              />
            )}

            {eBook.bookFileUrl && (
              <a
                href={`https://docs.google.com/gview?url=${encodeURIComponent(
                  eBook.bookFileUrl
                )}&embedded=true`}
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                <ExternalLink size={14} /> View PDF
              </a>
            )}
          </div>

          {/* FILE UPLOAD */}
          <label>Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
          />

          <label>PDF File</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setBookFile(e.target.files[0])}
          />

          <button type="submit" disabled={loading}>
            <Save size={16} /> {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEBookModal;
