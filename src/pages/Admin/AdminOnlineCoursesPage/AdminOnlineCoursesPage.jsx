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
  Video,
} from "lucide-react";

// --- API Services ---
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import * as courseService from "../../../api/services/adminCourseService";
import { getAllLanguages, getAllValidities } from "../../../api/apiRoutes";

// --- Components ---
import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import AdminEditor from "../../../components/AdminComponents/AdminEditor/AdminEditor";
import styles from "./AdminOnlineCoursesPage.module.css";

const AdminOnlineCoursesPage = () => {
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

  const CURRENT_SECTION = "ONLINE_COURSE";

  // --- FORM STATE ---
  const initialFormState = {
    contentType: "ONLINE_COURSE",
    name: "",
    startDate: "",

    // IDs (Arrays)
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
    validityIds: [],

    originalPrice: "",
    discountPrice: "",
    pricingNote: "",

    shortDescription: "",
    detailedDescription: "",
    isActive: true,
  };

  const [courseData, setCourseData] = useState(initialFormState);
  const [thumbnail, setThumbnail] = useState(null);

  // --- NESTED DATA ---
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
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

      const groups = {};
      cats.forEach((cat) => {
        groups[cat._id] = {
          id: cat._id,
          name: cat.name,
          ...cat,
          subcategories: [],
        };
      });
      subs.forEach((sub) => {
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

  // --- HANDLERS (Structure) ---
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

  // --- FORM INPUTS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (html) => {
    setCourseData((prev) => ({ ...prev, detailedDescription: html }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setCourseData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  // --- NESTED BUILDERS ---
  const addClass = () =>
    setClasses([
      ...classes,
      {
        title: "",
        topic: "",
        order: classes.length + 1,
        thumbnailFile: null,
        lectureFile: null,
        videoFile: null,
      },
    ]);
  const updateClass = (index, field, value) => {
    const n = [...classes];
    n[index][field] = value;
    setClasses(n);
  };
  const removeClass = (index) =>
    setClasses(classes.filter((_, i) => i !== index));

  const addTutor = () =>
    setTutors([
      ...tutors,
      { name: "", qualification: "", subject: "", photoFile: null },
    ]);
  const updateTutor = (index, field, value) => {
    const n = [...tutors];
    n[index][field] = value;
    setTutors(n);
  };
  const removeTutor = (index) =>
    setTutors(tutors.filter((_, i) => i !== index));

  const addMaterial = () =>
    setStudyMaterials([
      ...studyMaterials,
      { title: "", description: "", file: null },
    ]);
  const updateMaterial = (index, field, value) => {
    const n = [...studyMaterials];
    n[index][field] = value;
    setStudyMaterials(n);
  };
  const removeMaterial = (index) =>
    setStudyMaterials(studyMaterials.filter((_, i) => i !== index));

  // --- VALIDATION ---
  const validateForm = () => {
    const errors = [];
    if (!courseData.name) errors.push("Course Name is required");
    if (!courseData.startDate) errors.push("Start Date is required");
    if (courseData.categoryIds.length === 0)
      errors.push("At least one Category is required");
    if (courseData.languageIds.length === 0)
      errors.push("At least one Language is required");
    if (courseData.validityIds.length === 0)
      errors.push("At least one Validity is required");
    if (!courseData.originalPrice) errors.push("Original Price is required");
    return errors;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert("Missing Required Fields:\n- " + errors.join("\n- "));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // 1. JSON PAYLOAD
      const payload = {
        contentType: "ONLINE_COURSE",
        name: courseData.name,
        startDate: courseData.startDate,
        categoryIds: courseData.categoryIds,
        subCategoryIds: courseData.subCategoryIds,
        languageIds: courseData.languageIds,
        validityIds: courseData.validityIds,
        originalPrice: Number(courseData.originalPrice),
        discountPrice: Number(courseData.discountPrice) || 0,
        pricingNote: courseData.pricingNote,
        shortDescription: courseData.shortDescription,
        detailedDescription: courseData.detailedDescription,

        classes: classes.map((c) => ({
          title: c.title,
          topic: c.topic,
          order: Number(c.order),
        })),
        studyMaterials: studyMaterials.map((s) => ({
          title: s.title,
          description: s.description,
        })),
        tutors: tutors.map((t) => ({
          name: t.name,
          qualification: t.qualification,
          subject: t.subject,
        })),
        isActive: courseData.isActive,
      };

      console.log("Submitting Payload:", payload);
      formData.append("course", JSON.stringify(payload));

      // 2. FILES
      if (thumbnail) formData.append("thumbnail", thumbnail);

      tutors.forEach((t) => {
        if (t.photoFile) formData.append("tutorImages", t.photoFile);
      });
      classes.forEach((c) => {
        if (c.thumbnailFile)
          formData.append("classThumbnails", c.thumbnailFile);
        if (c.lectureFile) formData.append("classLecturePics", c.lectureFile);
        if (c.videoFile) formData.append("classVideos", c.videoFile);
      });
      studyMaterials.forEach((s) => {
        if (s.file) formData.append("studyMaterialFiles", s.file);
      });

      await courseService.createCourse(formData);
      alert("Online Course Created Successfully!");

      // Reset
      setCourseData(initialFormState);
      setThumbnail(null);
      setClasses([]);
      setTutors([]);
      setStudyMaterials([]);
      setActiveView("CATEGORIES");
    } catch (error) {
      console.error("Submission Error:", error);
      alert(`Failed: ${error.response?.data?.message || "Check console"}`);
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
          <BookOpen size={18} /> Add Course
        </button>
      </div>

      {/* Structure View */}
      {activeView === "CATEGORIES" && (
        <div className={styles.columnsContainer}>
          <div className={styles.headerRow}>
            <h1>Online Courses: Structure</h1>
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

      {/* Add Form */}
      {activeView === "ADD" && (
        <div className={styles.formContainer}>
          <h2>Create Online Course</h2>
          <form onSubmit={handleSubmit} className={styles.courseForm}>
            {/* 1. Basic Details */}
            <div className={styles.formSection}>
              <h3>Basic Details</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>
                    Course Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    name="name"
                    value={courseData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. UPSC Prelims Foundation Batch"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>
                    Start Date <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={courseData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Multi-Selects */}
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>
                    Categories (Hold Ctrl/Cmd){" "}
                    <span className={styles.req}>*</span>
                  </label>
                  <select
                    multiple
                    name="categoryIds"
                    value={courseData.categoryIds}
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
                    value={courseData.subCategoryIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {flatSubCategories
                      .filter((s) =>
                        courseData.categoryIds.includes(
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
              </div>

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>
                    Languages <span className={styles.req}>*</span>
                  </label>
                  <select
                    multiple
                    name="languageIds"
                    value={courseData.languageIds}
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
                <div className={styles.inputGroup}>
                  <label>
                    Validities <span className={styles.req}>*</span>
                  </label>
                  <select
                    multiple
                    name="validityIds"
                    value={courseData.validityIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {validities.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.label} ({v.durationInDays} days)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* THUMBNAIL (Images Only) */}
              <div className={styles.inputGroup}>
                <label>Course Thumbnail (Image)</label>
                <div className={styles.fileBox}>
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            {/* 2. Pricing */}
            <div className={styles.formSection}>
              <h3>Pricing & Description</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>
                    Original Price <span className={styles.req}>*</span>
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={courseData.originalPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Discount Price</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={courseData.discountPrice}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Pricing Note</label>
                  <input
                    name="pricingNote"
                    value={courseData.pricingNote}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Short Description</label>
                <textarea
                  name="shortDescription"
                  rows={2}
                  value={courseData.shortDescription}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
                <label>Detailed Description</label>
                <AdminEditor
                  value={courseData.detailedDescription}
                  onChange={handleEditorChange}
                  placeholder="Enter course details..."
                />
              </div>
            </div>

            {/* 3. Tutors */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>Tutors</h3>
                <button
                  type="button"
                  onClick={addTutor}
                  className={styles.addBtnMain}
                >
                  <Plus size={16} /> Add Tutor
                </button>
              </div>
              {tutors.map((t, i) => (
                <div key={i} className={styles.dynamicRow}>
                  <input
                    placeholder="Name"
                    value={t.name}
                    onChange={(e) => updateTutor(i, "name", e.target.value)}
                  />
                  <input
                    placeholder="Qualification"
                    value={t.qualification}
                    onChange={(e) =>
                      updateTutor(i, "qualification", e.target.value)
                    }
                  />
                  <input
                    placeholder="Subject"
                    value={t.subject}
                    onChange={(e) => updateTutor(i, "subject", e.target.value)}
                  />
                  <div className={styles.fileBoxSmall}>
                    <User size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateTutor(i, "photoFile", e.target.files[0])
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTutor(i)}
                    className={styles.delBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* 4. Classes */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>Classes (Curriculum)</h3>
                <button
                  type="button"
                  onClick={addClass}
                  className={styles.addBtnMain}
                >
                  <Plus size={16} /> Add Class
                </button>
              </div>
              {classes.map((c, i) => (
                <div key={i} className={styles.classCard}>
                  <div className={styles.gridRow}>
                    <input
                      placeholder="Class Title"
                      value={c.title}
                      onChange={(e) => updateClass(i, "title", e.target.value)}
                    />
                    <input
                      placeholder="Topic"
                      value={c.topic}
                      onChange={(e) => updateClass(i, "topic", e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Order"
                      value={c.order}
                      onChange={(e) => updateClass(i, "order", e.target.value)}
                      style={{ maxWidth: "80px" }}
                    />
                  </div>
                  <div className={styles.filesRow}>
                    <label>
                      Thumbnail (Img):
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateClass(i, "thumbnailFile", e.target.files[0])
                        }
                      />
                    </label>
                    <label>
                      Lecture (Img):
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateClass(i, "lectureFile", e.target.files[0])
                        }
                      />
                    </label>
                    <label>
                      Video (Mp4/Mov):
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          updateClass(i, "videoFile", e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeClass(i)}
                    className={styles.delBtn}
                    style={{ marginTop: "0.5rem" }}
                  >
                    Remove Class
                  </button>
                </div>
              ))}
            </div>

            {/* 5. Study Materials (PDF/Docs) */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>Study Materials</h3>
                <button
                  type="button"
                  onClick={addMaterial}
                  className={styles.addBtnMain}
                >
                  <Plus size={16} /> Add Material
                </button>
              </div>
              {studyMaterials.map((s, i) => (
                <div key={i} className={styles.dynamicRow}>
                  <input
                    placeholder="Title (e.g. PDF Notes)"
                    value={s.title}
                    onChange={(e) => updateMaterial(i, "title", e.target.value)}
                  />
                  <input
                    placeholder="Description"
                    value={s.description}
                    onChange={(e) =>
                      updateMaterial(i, "description", e.target.value)
                    }
                  />
                  <div className={styles.fileBoxSmall}>
                    <FileText size={14} />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        updateMaterial(i, "file", e.target.files[0])
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className={styles.delBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                <Save size={18} /> {loading ? "Creating..." : "Save Course"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminOnlineCoursesPage;
