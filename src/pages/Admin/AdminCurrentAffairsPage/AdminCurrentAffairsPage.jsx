import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../redux/slices/modalSlice";
import { Plus, Layers, BookOpen, Save, Upload } from "lucide-react";

// --- API Services ---
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import * as caService from "../../../api/services/adminCurrentAffairsService";
import { getAllLanguages } from "../../../api/apiRoutes";

// --- Components ---
import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import AdminEditor from "../../../components/AdminComponents/AdminEditor/AdminEditor";
import styles from "./AdminCurrentAffairsPage.module.css";

const AdminCurrentAffairsPage = () => {
  const dispatch = useDispatch();

  // --- UI STATE ---
  const [activeView, setActiveView] = useState("CATEGORIES");
  const [currentTab, setCurrentTab] = useState("LATEST");
  const [loading, setLoading] = useState(false);

  // --- DATA LISTS ---
  const [columns, setColumns] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [flatSubCategories, setFlatSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  const CURRENT_SECTION = "CURRENT_AFFAIRS";
  const MONTHS = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const AFFAIR_TYPES = [
    { label: "Latest", value: "LATEST" },
    { label: "Monthly", value: "MONTHLY" },
    { label: "Sports", value: "SPORTS" },
    { label: "State", value: "STATE" },
    { label: "International", value: "INTERNATIONAL" },
    { label: "Politics", value: "POLITICS" },
    { label: "Local", value: "LOCAL" },
  ];

  // --- FORM STATE ---
  const initialFormState = {
    name: "", // Used as Title / Event Name / Headline
    date: "",

    // Specific Fields
    month: "", // Monthly
    sport: "", // Sports
    state: "", // State
    region: "", // International
    politicalParty: "", // Politics
    place: "", // Local (District/City)

    // Multi-Select IDs
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],

    description: "", // Short
    fullContent: "", // Rich Text
    isActive: true,
  };

  const [formDataState, setFormDataState] = useState(initialFormState);
  const [thumbnail, setThumbnail] = useState(null);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, subsRes, langRes] = await Promise.all([
        categoryService.getAllCategories(CURRENT_SECTION),
        subCategoryService.getAllSubCategories(null, CURRENT_SECTION),
        getAllLanguages(),
      ]);

      setFlatCategories(catsRes.data || []);
      setFlatSubCategories(subsRes.data || []);
      setLanguages(langRes.data?.data || langRes.data || []);

      const groups = {};
      (catsRes.data || []).forEach((cat) => {
        groups[cat._id] = {
          id: cat._id,
          name: cat.name,
          ...cat,
          subcategories: [],
        };
      });
      (subsRes.data || []).forEach((sub) => {
        const parentId = sub.category?._id || sub.category;
        if (groups[parentId]) {
          groups[parentId].subcategories.push({ ...sub, id: sub._id });
        }
      });
      setColumns(Object.values(groups));
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

  // --- INPUT HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (html) => {
    setFormDataState((prev) => ({ ...prev, fullContent: html }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormDataState((prev) => ({ ...prev, [name]: selectedValues }));
  };

  // --- VALIDATION ---
  const validateForm = () => {
    const errors = [];
    if (!formDataState.name.trim())
      errors.push("Main Title/Event Name is required.");
    if (!formDataState.date) errors.push("Date is required.");

    // Type Specific Validations
    if (currentTab === "MONTHLY" && !formDataState.month)
      errors.push("Month is required.");
    if (currentTab === "SPORTS" && !formDataState.sport)
      errors.push("Sport Name is required.");
    if (currentTab === "STATE" && !formDataState.state)
      errors.push("State Name is required.");
    if (currentTab === "INTERNATIONAL" && !formDataState.region)
      errors.push("Region is required.");
    if (currentTab === "POLITICS" && !formDataState.politicalParty)
      errors.push("Political Party is required.");
    if (currentTab === "LOCAL" && !formDataState.place)
      errors.push("Place/District is required.");

    if (formDataState.categoryIds.length === 0)
      errors.push("Select at least one Category.");
    if (formDataState.languageIds.length === 0)
      errors.push("Select at least one Language.");
    if (!formDataState.description.trim())
      errors.push("Short description is required.");

    // Editor check
    const stripped = formDataState.fullContent.replace(/<[^>]*>?/gm, "").trim();
    if (!stripped && !formDataState.fullContent.includes("<img")) {
      errors.push("Full Content (Editor) is required.");
    }

    return errors;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(`Validation Failed:\n\n- ${errors.join("\n- ")}`);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Base Payload (Common fields)
      let payload = {
        date: formDataState.date,
        // Using aliases based on your postman (categories vs categoryIds)
        // We send BOTH to be safe, backend handles precedence
        categoryIds: formDataState.categoryIds,
        categories: formDataState.categoryIds,

        subCategoryIds: formDataState.subCategoryIds,
        subCategories: formDataState.subCategoryIds,

        languageIds: formDataState.languageIds,
        languages: formDataState.languageIds,

        description: formDataState.description,
        fullContent: formDataState.fullContent,
        isActive: formDataState.isActive,
      };

      // Type-Specific Fields
      switch (currentTab) {
        case "LATEST":
          payload.heading = formDataState.name; // Latest often uses 'heading'
          payload.name = formDataState.name;
          break;
        case "MONTHLY":
          payload.name = formDataState.name;
          payload.month = formDataState.month;
          break;
        case "SPORTS":
          payload.event = formDataState.name; // UI 'name' -> Payload 'event'
          payload.sport = formDataState.sport;
          break;
        case "STATE":
          payload.name = formDataState.name; // ✅ REQUIRED by backend
          payload.state = formDataState.state;
          break;

        case "INTERNATIONAL":
          payload.name = formDataState.name;
          payload.region = formDataState.region;
          break;
        case "POLITICS":
          payload.name = formDataState.name;
          payload.politicalParty = formDataState.politicalParty;
          break;
        case "LOCAL":
          payload.name = formDataState.name;
          payload.location = formDataState.place; // ✅ REQUIRED by schema
          break;

        default:
          payload.name = formDataState.name;
      }

      console.log(`Submitting [${currentTab}] Payload:`, payload);

      // Append as 'affair'
      formData.append("affair", JSON.stringify(payload));

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await caService.createCurrentAffair(currentTab, formData);

      alert(`${currentTab} Current Affair Created!`);

      // Reset
      setFormDataState(initialFormState);
      setThumbnail(null);
      setActiveView("CATEGORIES");
    } catch (error) {
      console.error("Submission Error:", error);
      const serverMsg = error.response?.data?.message || "Unknown error";
      alert(`Failed: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeView === "CATEGORIES" && columns.length === 0)
    return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.pageWrap}>
      {/* Top Bar */}
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
          <BookOpen size={18} /> Add Current Affair
        </button>
      </div>

      {/* Structure View */}
      {activeView === "CATEGORIES" && (
        <div className={styles.columnsContainer}>
          <div className={styles.headerRow}>
            <h1>Current Affairs: Structure</h1>
            <button className={styles.addBtnMain} onClick={handleAddCategory}>
              <Plus size={18} /> Add Category
            </button>
          </div>
          <CategoryColumn
            categories={columns}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onEditSub={handleEditSubCategory}
            onDeleteSub={handleDeleteSubCategory}
            onAddSub={handleAddSubCategory}
          />
        </div>
      )}

      {/* Add Form View */}
      {activeView === "ADD" && (
        <div className={styles.formContainer}>
          <h2>
            Add {AFFAIR_TYPES.find((t) => t.value === currentTab)?.label}{" "}
            Current Affair
          </h2>

          {/* TABS */}
          <div className={styles.typeTabs}>
            {AFFAIR_TYPES.map((type) => (
              <button
                key={type.value}
                className={`${styles.typeTab} ${
                  currentTab === type.value ? styles.activeTab : ""
                }`}
                onClick={() => {
                  setCurrentTab(type.value);
                  setFormDataState(initialFormState);
                }} // Reset state on tab change
                type="button"
              >
                {type.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.caForm}>
            <div className={styles.formSection}>
              <h3>Details</h3>
              <div className={styles.gridRow}>
                {/* DYNAMIC FIELD 1 (Based on Type) */}
                {currentTab === "MONTHLY" && (
                  <div className={styles.inputGroup}>
                    <label>
                      Month <span className={styles.req}>*</span>
                    </label>
                    <select
                      name="month"
                      value={formDataState.month}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {currentTab === "SPORTS" && (
                  <div className={styles.inputGroup}>
                    <label>
                      Sport Name <span className={styles.req}>*</span>
                    </label>
                    <input
                      name="sport"
                      value={formDataState.sport}
                      onChange={handleInputChange}
                      placeholder="e.g. Cricket"
                    />
                  </div>
                )}
                {currentTab === "STATE" && (
                  <div className={styles.inputGroup}>
                    <label>
                      State Name <span className={styles.req}>*</span>
                    </label>
                    <input
                      name="state"
                      value={formDataState.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                )}
                {currentTab === "INTERNATIONAL" && (
                  <div className={styles.inputGroup}>
                    <label>
                      Region <span className={styles.req}>*</span>
                    </label>
                    <input
                      name="region"
                      value={formDataState.region}
                      onChange={handleInputChange}
                      placeholder="e.g. Asia, Europe"
                    />
                  </div>
                )}
                {currentTab === "POLITICS" && (
                  <div className={styles.inputGroup}>
                    <label>
                      Political Party <span className={styles.req}>*</span>
                    </label>
                    <input
                      name="politicalParty"
                      value={formDataState.politicalParty}
                      onChange={handleInputChange}
                      placeholder="e.g. Party Name"
                    />
                  </div>
                )}
                {currentTab === "LOCAL" && (
                  <div className={styles.inputGroup}>
                    <label>
                      Place / District <span className={styles.req}>*</span>
                    </label>
                    <input
                      name="place"
                      value={formDataState.place}
                      onChange={handleInputChange}
                      placeholder="e.g. Hyderabad"
                    />
                  </div>
                )}

                {/* DYNAMIC MAIN TITLE */}
                <div className={styles.inputGroup}>
                  <label>
                    {["SPORTS", "STATE"].includes(currentTab)
                      ? "Event Name"
                      : "Title / Headline"}{" "}
                    <span className={styles.req}>*</span>
                  </label>
                  <input
                    name="name"
                    value={formDataState.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    Date <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formDataState.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Multi-Selects */}
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Categories (Multi-Select)</label>
                  <select
                    multiple
                    name="categoryIds"
                    value={formDataState.categoryIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {flatCategories.map((c) => (
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
                    value={formDataState.subCategoryIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {flatSubCategories
                      .filter((s) =>
                        formDataState.categoryIds.includes(
                          s.category?._id || s.category
                        )
                      )
                      .map((s) => (
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
                    value={formDataState.languageIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {languages.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Thumbnail</label>
                <div className={styles.fileBox}>
                  <Upload size={16} />
                  <input
                    type="file"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
              </div>

              <div
                className={styles.inputGroup}
                style={{ marginTop: "1.5rem" }}
              >
                <label>Short Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formDataState.description}
                  onChange={handleInputChange}
                />
              </div>

              <div
                className={styles.inputGroup}
                style={{ marginTop: "1.5rem" }}
              >
                <label>Full Content</label>
                <AdminEditor
                  value={formDataState.fullContent}
                  onChange={handleEditorChange}
                  placeholder="Write article here..."
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                <Save size={18} /> {loading ? "Saving..." : "Publish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminCurrentAffairsPage;
