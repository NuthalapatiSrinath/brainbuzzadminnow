import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../redux/slices/modalSlice";
import { Plus, Layers, BookOpen, Upload, Save, FileText } from "lucide-react";

// --- API Services ---
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import * as ebookService from "../../../api/services/adminEBookService"; // Created above
import { getAllLanguages } from "../../../api/apiRoutes";

// --- Components ---
import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import AdminEditor from "../../../components/AdminComponents/AdminEditor/AdminEditor";
import styles from "./AdminEBooksPage.module.css";

const AdminEBooksPage = () => {
  const dispatch = useDispatch();

  // --- UI STATE ---
  const [activeView, setActiveView] = useState("CATEGORIES");
  const [loading, setLoading] = useState(false);

  // --- DATA LISTS ---
  const [columns, setColumns] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [flatSubCategories, setFlatSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // --- CONFIG ---
  const CURRENT_SECTION = "E_BOOK";

  // --- FORM STATE ---
  const initialFormState = {
    name: "",
    contentType: "E_BOOK",
    startDate: "",

    // IDs (Backend expects arrays, UI uses single/multi select)
    categoryId: "",
    subCategoryId: "",
    languageIds: [], // Multi-select support for consistency

    description: "", // HTML from AdminEditor
    isActive: true,
  };

  const [ebookData, setEbookData] = useState(initialFormState);

  // Files
  const [thumbnail, setThumbnail] = useState(null);
  const [bookFile, setBookFile] = useState(null);

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
      const [catsRes, subsRes, langRes] = await Promise.all([
        categoryService.getAllCategories(CURRENT_SECTION),
        subCategoryService.getAllSubCategories(null, CURRENT_SECTION),
        getAllLanguages(),
      ]);

      const cats = catsRes.data || [];
      const subs = subsRes.data || [];

      setFlatCategories(cats);
      setFlatSubCategories(subs);
      setLanguages(langRes.data?.data || langRes.data || []);

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

  // --- HANDLERS (Categories) ---
  const handleAddCategory = () =>
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
          section: CURRENT_SECTION,
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

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEbookData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (htmlContent) => {
    setEbookData((prev) => ({ ...prev, description: htmlContent }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setEbookData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  const filteredSubCategories = flatSubCategories.filter(
    (sub) => (sub.category?._id || sub.category) === ebookData.categoryId
  );

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // 1. JSON PAYLOAD
      const payload = {
        contentType: "E_BOOK",
        name: ebookData.name,
        startDate: ebookData.startDate,

        // IDs must be arrays
        categoryIds: ebookData.categoryId ? [ebookData.categoryId] : [],
        subCategoryIds: ebookData.subCategoryId
          ? [ebookData.subCategoryId]
          : [],
        languageIds: ebookData.languageIds,

        description: ebookData.description,
        isActive: ebookData.isActive,
      };

      console.log("Submitting Payload:", payload);

      // 2. APPEND DATA
      formData.append("ebook", JSON.stringify(payload));

      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (bookFile) formData.append("bookFile", bookFile);

      // 3. CALL API
      await ebookService.createEBook(formData);
      alert("E-Book Created Successfully!");

      // Reset
      setEbookData(initialFormState);
      setThumbnail(null);
      setBookFile(null);
      setActiveView("CATEGORIES");
    } catch (error) {
      console.error(error);
      alert("Failed to create E-Book.");
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
          <BookOpen size={18} /> Add E-Book
        </button>
      </div>

      {/* --- VIEW 1: STRUCTURE --- */}
      {activeView === "CATEGORIES" && (
        <div className={styles.columnsContainer}>
          <div className={styles.headerRow}>
            <h1>E-Books: Structure</h1>
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
              <p>No E-Book categories found. Click "Add Category" to start.</p>
            </div>
          )}
        </div>
      )}

      {/* --- VIEW 2: ADD FORM --- */}
      {activeView === "ADD" && (
        <div className={styles.formContainer}>
          <h2>Add New E-Book</h2>
          <form onSubmit={handleSubmit} className={styles.ebookForm}>
            {/* 1. Basic Info */}
            <div className={styles.formSection}>
              <h3>E-Book Details</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>
                    E-Book Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    name="name"
                    value={ebookData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Police GS Foundation E-Book"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={ebookData.startDate}
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
                    name="categoryId"
                    value={ebookData.categoryId}
                    onChange={handleInputChange}
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
                    name="subCategoryId"
                    value={ebookData.subCategoryId}
                    onChange={handleInputChange}
                    disabled={!ebookData.categoryId}
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

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Language (Hold Ctrl to select multiple)</label>
                  <select
                    multiple
                    name="languageIds"
                    value={ebookData.languageIds}
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
                    {ebookData.languageIds.length} selected
                  </small>
                </div>
              </div>
            </div>

            {/* 2. Files */}
            <div className={styles.formSection}>
              <h3>Files</h3>
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
                  <label>E-Book File (PDF)</label>
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
            </div>

            {/* 3. Description */}
            <div className={styles.formSection}>
              <h3>Description</h3>
              <div className={styles.inputGroup}>
                <label>Full Description</label>
                <AdminEditor
                  value={ebookData.description}
                  onChange={handleEditorChange}
                  placeholder="Enter full description of the e-book..."
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                <Save size={18} /> {loading ? "Creating..." : "Save E-Book"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminEBooksPage;
