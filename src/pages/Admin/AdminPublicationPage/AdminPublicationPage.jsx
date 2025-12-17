import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../redux/slices/modalSlice";
import {
  Plus,
  Layers,
  BookOpen,
  Save,
  Upload,
  Trash2,
  FileText,
  User,
} from "lucide-react";

// --- API Services ---
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import * as publicationService from "../../../api/services/adminPublicationService";
import { getAllLanguages, getAllValidities } from "../../../api/apiRoutes";

// --- Components ---
import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import AdminEditor from "../../../components/AdminComponents/AdminEditor/AdminEditor";
import styles from "./AdminPublicationPage.module.css";

const AdminPublicationPage = () => {
  const dispatch = useDispatch();

  // --- UI STATE ---
  const [activeView, setActiveView] = useState("CATEGORIES");
  const [loading, setLoading] = useState(false);

  // --- DATA LISTS ---
  const [columns, setColumns] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [flatSubCategories, setFlatSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [validities, setValidities] = useState([]);

  // --- CONFIG: THIS LOCKS EVERYTHING TO "PUBLICATION" ---
  const CURRENT_SECTION = "PUBLICATION";

  // --- FORM STATE ---
  const initialFormState = {
    name: "",
    startDate: "",
    contentType: "PUBLICATION",
    availableIn: "PUBLICATION",

    // Multi-Select IDs
    categoryIds: "", // Single string for UI, converted to array on submit
    subCategoryIds: "", // Single string for UI
    languageIds: [],
    validityIds: [],

    originalPrice: "",
    discountPrice: "",
    discountPercent: "",
    pricingNote: "",

    shortDescription: "",
    detailedDescription: "", // HTML

    isActive: true,
  };

  const [pubData, setPubData] = useState(initialFormState);

  // Files
  const [thumbnail, setThumbnail] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Dynamic Lists
  const [authors, setAuthors] = useState([]);

  // --- FETCH DATA ---
  const processDataToColumns = (categories, subcategories) => {
    const groups = {};
    categories.forEach((cat) => {
      groups[cat._id] = {
        id: cat._id,
        name: cat.name,
        ...cat,
        subcategories: [],
      };
    });
    subcategories.forEach((sub) => {
      const parentId = sub.category?._id || sub.category;
      if (groups[parentId]) {
        groups[parentId].subcategories.push({ ...sub, id: sub._id });
      }
    });
    return Object.values(groups);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Pass CURRENT_SECTION to APIs to only get Publication related data
      const [catsRes, subsRes, langRes, valRes] = await Promise.all([
        categoryService.getAllCategories(CURRENT_SECTION),
        subCategoryService.getAllSubCategories(null, CURRENT_SECTION),
        getAllLanguages(),
        getAllValidities(),
      ]);

      const cats = catsRes.data || [];
      const subs = subsRes.data || [];

      setFlatCategories(cats);
      setFlatSubCategories(subs);
      setLanguages(langRes.data?.data || langRes.data || []);
      setValidities(valRes.data?.data || valRes.data || []);

      const cols = processDataToColumns(cats, subs);
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

  // --- HANDLERS (Category Structure) ---
  const handleAddCategory = () =>
    dispatch(
      openModal({
        type: "CATEGORY_MODAL",
        modalData: {
          mode: "add",
          section: CURRENT_SECTION, // <--- Locks creation to PUBLICATION
          onSuccess: fetchData,
        },
      })
    );
  const handleEditCategory = (cat) =>
    dispatch(
      openModal({
        type: "CATEGORY_MODAL",
        modalData: { mode: "edit", categoryData: cat, onSuccess: fetchData },
      })
    );
  const handleDeleteCategory = (cat) =>
    dispatch(
      openModal({
        type: "DELETE_MODAL",
        modalData: {
          title: "Delete Category",
          message: `Delete "${cat.name}"?`,
          onConfirm: async () => {
            await categoryService.deleteCategory(cat.id);
            fetchData();
          },
        },
      })
    );
  const handleAddSubCategory = (parent) =>
    dispatch(
      openModal({
        type: "SUBCATEGORY_MODAL",
        modalData: {
          mode: "add",
          parentCategory: parent,
          section: CURRENT_SECTION, // <--- Locks creation to PUBLICATION
          onSuccess: fetchData,
        },
      })
    );
  const handleEditSubCategory = (sub) =>
    dispatch(
      openModal({
        type: "SUBCATEGORY_MODAL",
        modalData: { mode: "edit", subData: sub, onSuccess: fetchData },
      })
    );
  const handleDeleteSubCategory = (sub) =>
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

  // --- FORM INPUT HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPubData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper for Multi-Select (Languages/Validities)
  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setPubData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  // Helper for Single Select (Category/SubCategory) stored as string in state
  const handleSingleSelectChange = (e) => {
    const { name, value } = e.target;
    setPubData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (htmlContent) => {
    setPubData((prev) => ({ ...prev, detailedDescription: htmlContent }));
  };

  // Filter SubCategories based on selected Category
  const filteredSubCategories = flatSubCategories.filter(
    (sub) => (sub.category?._id || sub.category) === pubData.categoryIds
  );

  // --- AUTHORS HANDLERS ---
  const addAuthorRow = () =>
    setAuthors([
      ...authors,
      { name: "", qualification: "", subject: "", photoFile: null },
    ]);
  const updateAuthorRow = (index, field, value) => {
    const n = [...authors];
    n[index][field] = value;
    setAuthors(n);
  };
  const removeAuthorRow = (index) =>
    setAuthors(authors.filter((_, i) => i !== index));

  // --- GALLERY HANDLER ---
  const handleGalleryChange = (e) => {
    if (e.target.files) {
      setGalleryFiles(Array.from(e.target.files));
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // 1. CONSTRUCT JSON PAYLOAD
      const payload = {
        name: pubData.name,
        startDate: pubData.startDate,
        contentType: "PUBLICATION",
        availableIn: pubData.availableIn,

        // IDs: Ensure they are Arrays.
        // For Category/SubCategory, we used a single select UI, so wrap it.
        categoryIds: pubData.categoryIds ? [pubData.categoryIds] : [],
        subCategoryIds: pubData.subCategoryIds ? [pubData.subCategoryIds] : [],

        // For Language/Validity, we used multi-select, so it's already an array
        languageIds: pubData.languageIds,
        validityIds: pubData.validityIds,

        originalPrice: Number(pubData.originalPrice) || 0,
        discountPrice: Number(pubData.discountPrice) || 0,

        pricingNote: pubData.pricingNote,

        shortDescription: pubData.shortDescription,
        detailedDescription: pubData.detailedDescription,

        // Authors (Data part only)
        authors: authors.map((a) => ({
          name: a.name,
          qualification: a.qualification,
          subject: a.subject,
        })),

        isActive: pubData.isActive,
      };

      console.log("Submitting Payload:", payload);

      // 2. APPEND FORM DATA
      formData.append("publication", JSON.stringify(payload));

      // 3. APPEND FILES
      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (bookFile) formData.append("bookFile", bookFile);

      // Append Author Images (Order matters to match authors array index)
      authors.forEach((a) => {
        if (a.photoFile) formData.append("authorImages", a.photoFile);
      });

      // Append Gallery Images
      galleryFiles.forEach((file) => {
        formData.append("galleryImages", file);
      });

      // 4. CALL API
      await publicationService.createPublication(formData);
      alert("Publication Created Successfully!");

      // Reset Form
      setPubData(initialFormState);
      setThumbnail(null);
      setBookFile(null);
      setGalleryFiles([]);
      setAuthors([]);
      setActiveView("CATEGORIES");
    } catch (error) {
      console.error(error);
      alert("Failed to create publication. Please check fields.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeView === "CATEGORIES" && columns.length === 0)
    return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.pageWrap}>
      {/* --- TOP BAR --- */}
      <div className={styles.toggleBar}>
        <button
          className={`${styles.toggleBtn} ${
            activeView === "CATEGORIES" ? styles.active : ""
          }`}
          onClick={() => setActiveView("CATEGORIES")}
        >
          <Layers size={18} /> Manage Structure
        </button>
        <button
          className={`${styles.toggleBtn} ${
            activeView === "ADD" ? styles.active : ""
          }`}
          onClick={() => setActiveView("ADD")}
        >
          <BookOpen size={18} /> Add Publication
        </button>
      </div>

      {/* --- VIEW 1: STRUCTURE --- */}
      {activeView === "CATEGORIES" && (
        <div className={styles.columnsContainer}>
          <div className={styles.headerRow}>
            <h1>Publications: Structure</h1>
            <button className={styles.addBtnMain} onClick={handleAddCategory}>
              <Plus size={18} /> Add Category
            </button>
          </div>
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
                No Publication categories found. Click "Add Category" to start.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- VIEW 2: ADD FORM --- */}
      {activeView === "ADD" && (
        <div className={styles.formContainer}>
          <h2>Add New Publication</h2>
          <form onSubmit={handleSubmit} className={styles.pubForm}>
            {/* 1. Basic Info */}
            <div className={styles.formSection}>
              <h3>Publication Details</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>
                    Publication Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    name="name"
                    value={pubData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. IPS GS Foundation Basics"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Available In</label>
                  <select
                    name="availableIn"
                    value={pubData.availableIn}
                    onChange={handleInputChange}
                  >
                    <option value="PUBLICATION">PUBLICATION</option>
                    <option value="EBOOK">EBOOK</option>
                    <option value="BOTH">BOTH</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={pubData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Categorization */}
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>
                    Category <span className={styles.req}>*</span>
                  </label>
                  <select
                    name="categoryIds"
                    value={pubData.categoryIds}
                    onChange={handleSingleSelectChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {flatCategories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Sub Category</label>
                  <select
                    name="subCategoryIds"
                    value={pubData.subCategoryIds}
                    onChange={handleSingleSelectChange}
                    disabled={!pubData.categoryIds}
                  >
                    <option value="">Select Sub Category</option>
                    {filteredSubCategories.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Selects */}
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Languages (Hold Ctrl to select multiple)</label>
                  <select
                    multiple
                    name="languageIds"
                    value={pubData.languageIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {languages.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <small className={styles.hint}>
                    {pubData.languageIds.length} selected
                  </small>
                </div>
                <div className={styles.inputGroup}>
                  <label>Validities (Hold Ctrl to select multiple)</label>
                  <select
                    multiple
                    name="validityIds"
                    value={pubData.validityIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {validities.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.label} ({v.durationInDays} days)
                      </option>
                    ))}
                  </select>
                  <small className={styles.hint}>
                    {pubData.validityIds.length} selected
                  </small>
                </div>
              </div>
            </div>

            {/* 2. Media */}
            <div className={styles.formSection}>
              <h3>Media & Files</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Thumbnail (Cover)</label>
                  <div className={styles.fileBox}>
                    <Upload size={16} />
                    <input
                      type="file"
                      onChange={(e) => setThumbnail(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Book File (PDF/Doc)</label>
                  <div className={styles.fileBox}>
                    <FileText size={16} />
                    <input
                      type="file"
                      onChange={(e) => setBookFile(e.target.files[0])}
                      accept=".pdf,.doc,.docx"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
                <label>Gallery Images</label>
                <div className={styles.fileBox}>
                  <Upload size={16} />
                  <input
                    type="file"
                    multiple
                    onChange={handleGalleryChange}
                    accept="image/*"
                  />
                </div>
                <small className={styles.hint}>
                  {galleryFiles.length} files selected
                </small>
              </div>
            </div>

            {/* 3. Description */}
            <div className={styles.formSection}>
              <h3>Description</h3>
              <div className={styles.inputGroup}>
                <label>Short Description</label>
                <textarea
                  name="shortDescription"
                  value={pubData.shortDescription}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Detailed Description</label>
                <AdminEditor
                  value={pubData.detailedDescription}
                  onChange={handleEditorChange}
                  placeholder="Enter detailed description here..."
                />
              </div>
            </div>

            {/* 4. Pricing */}
            <div className={styles.formSection}>
              <h3>Pricing</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Original Price</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={pubData.originalPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Discount Price</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={pubData.discountPrice}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* 5. Authors */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>Authors</h3>
                <button
                  type="button"
                  onClick={addAuthorRow}
                  className={styles.smallBtn}
                >
                  + Add Author
                </button>
              </div>
              {authors.map((a, i) => (
                <div key={i} className={styles.authorRow}>
                  <div className={styles.authorInputs}>
                    <input
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) =>
                        updateAuthorRow(i, "name", e.target.value)
                      }
                    />
                    <input
                      placeholder="Qualification"
                      value={a.qualification}
                      onChange={(e) =>
                        updateAuthorRow(i, "qualification", e.target.value)
                      }
                    />
                    <input
                      placeholder="Subject"
                      value={a.subject}
                      onChange={(e) =>
                        updateAuthorRow(i, "subject", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.authorActions}>
                    <label className={styles.uploadIconBtn}>
                      <User size={16} />
                      <input
                        type="file"
                        onChange={(e) =>
                          updateAuthorRow(i, "photoFile", e.target.files[0])
                        }
                        accept="image/*"
                        hidden
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAuthorRow(i)}
                      className={styles.removeIconBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {authors.length === 0 && (
                <p className={styles.emptyText}>No authors added yet.</p>
              )}
            </div>

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                <Save size={18} />{" "}
                {loading ? "Creating..." : "Save Publication"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPublicationPage;
