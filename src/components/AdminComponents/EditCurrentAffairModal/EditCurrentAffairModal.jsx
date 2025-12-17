import React, { useState, useEffect } from "react";
import { X, Save, Upload, ExternalLink } from "lucide-react";
import * as currentAffairService from "../../../api/services/adminCurrentAffairsService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import { getAllLanguages } from "../../../api/apiRoutes";
import AdminEditor from "../AdminEditor/AdminEditor";
import styles from "./EditCurrentAffairModal.module.css";

const EditCurrentAffairModal = ({ isOpen, data, onClose }) => {
  const [loading, setLoading] = useState(false);

  const [lists, setLists] = useState({
    cats: [],
    subs: [],
    langs: [],
  });

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
    description: "",
    isActive: true,
  });

  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState("");

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!isOpen || !data) return;

    console.log("📝 EDIT CURRENT AFFAIR DATA:", data);

    Promise.all([
      categoryService.getAllCategories("CURRENT_AFFAIRS"),
      subCategoryService.getAllSubCategories(null, "CURRENT_AFFAIRS"),
      getAllLanguages(),
    ]).then(([c, s, l]) => {
      setLists({
        cats: c.data || [],
        subs: s.data || [],
        langs: l.data?.data || l.data || [],
      });
    });

    setFormData({
      title: data.name || data.title || "",
      date: data.date ? data.date.split("T")[0] : "",
      description: data.description || "",
      isActive: data.isActive ?? true,

      categoryIds: Array.isArray(data.categories)
        ? data.categories.map((c) => c._id || c)
        : [],

      subCategoryIds: Array.isArray(data.subCategories)
        ? data.subCategories.map((s) => s._id || s)
        : [],

      languageIds: Array.isArray(data.languages)
        ? data.languages.map((l) => l._id || l)
        : [],
    });

    setExistingFile(data.thumbnailUrl || data.fileUrl || "");
    setFile(null);
  }, [isOpen, data]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData({ ...formData, [e.target.name]: values });
  };

  const handleEditorChange = (html) =>
    setFormData({ ...formData, description: html });

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!data.affairType) {
        throw new Error("affairType missing");
      }

      const formPayload = new FormData();

      // -------- BASE PAYLOAD (SAME AS CREATE) --------
      let payload = {
        date: formData.date,
        categories: formData.categoryIds,
        subCategories: formData.subCategoryIds,
        languages: formData.languageIds,
        description: formData.description,
        isActive: formData.isActive,
      };

      // -------- TYPE SPECIFIC --------
      switch (data.affairType) {
        case "LatestCurrentAffair":
          payload.name = formData.title;
          payload.heading = formData.title;
          break;

        case "MonthlyCurrentAffair":
          payload.name = formData.title;
          payload.month = data.month; // required
          break;

        case "SportsCurrentAffair":
          payload.event = formData.title;
          payload.sport = data.sport;
          break;

        case "StateCurrentAffair":
          payload.name = formData.title;
          payload.state = data.state;
          break;

        case "InternationalCurrentAffair":
          payload.name = formData.title;
          payload.region = data.region;
          break;

        case "PoliticsCurrentAffair":
          payload.name = formData.title;
          payload.politicalParty = data.politicalParty;
          break;

        case "LocalCurrentAffair":
          payload.name = formData.title;
          payload.location = data.location;
          break;

        default:
          payload.name = formData.title;
      }

      console.log("📤 UPDATE AFFAIR PAYLOAD:", payload);

      // SAME AS CREATE
      formPayload.append("affair", JSON.stringify(payload));

      if (file) {
        console.log("🖼️ New Thumbnail:", file.name);
        formPayload.append("thumbnail", file);
      }

      await currentAffairService.updateCurrentAffair(
        data.affairType,
        data._id,
        formPayload
      );

      alert("Current Affair updated successfully");
      onClose(true);
    } catch (err) {
      console.error("❌ UPDATE ERROR:", err);
      alert(`Update Failed: ${err.response?.data?.message || err.message}`);
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
          <h2>Edit Current Affair</h2>
          <button onClick={() => onClose(false)} className={styles.closeBtn}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {/* Title & Date */}
          <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
              <label>Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Categories */}
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
              <label>Sub Categories</label>
              <select
                multiple
                name="subCategoryIds"
                value={formData.subCategoryIds}
                onChange={handleMultiSelect}
                className={styles.multiSelect}
              >
                {lists.subs.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
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

          {/* File */}
          <div className={styles.inputGroup}>
            <label>Thumbnail</label>
            <div className={styles.fileRow}>
              {existingFile && (
                <a
                  href={existingFile}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.viewLink}
                >
                  <ExternalLink size={14} /> View Current
                </a>
              )}
              <div className={styles.uploadBox}>
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file && <span className={styles.fileBadge}>New Selected</span>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={styles.inputGroup}>
            <label>Description</label>
            <AdminEditor
              value={formData.description}
              onChange={handleEditorChange}
            />
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="submit" disabled={loading} className={styles.saveBtn}>
              <Save size={18} />
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCurrentAffairModal;
