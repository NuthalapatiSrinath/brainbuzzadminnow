import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../redux/slices/modalSlice";
import { Plus, Trash2, Layers, BookOpen, X, Save } from "lucide-react";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import * as courseService from "../../../api/services/adminCourseService";

import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import styles from "./AdminOnlineCoursesPage.module.css";

const AdminOnlineCoursesPage = () => {
  const dispatch = useDispatch();

  // --- UI STATE ---
  const [activeView, setActiveView] = useState("CATEGORIES");

  // --- CATEGORY DATA ---
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const CURRENT_SECTION = "ONLINE_COURSE";

  // --- COURSE FORM STATE ---
  const initialCourseState = {
    name: "",
    contentType: "ONLINE_COURSE",
    courseType: "Recorded",
    startDate: "",
    originalPrice: "",
    discountPrice: "",
    discountPercent: "",
    pricingNote: "",
    // Initialize as empty strings for Select inputs (React requirement)
    validityIds: "",
    languageIds: "",
    categoryIds: "",
    subCategoryIds: "",
    shortDescription: "",
    detailedDescription: "",
    isActive: true,
  };

  const [courseData, setCourseData] = useState(initialCourseState);
  const [thumbnail, setThumbnail] = useState(null);

  // Dynamic Arrays
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);

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
      const [catsRes, subsRes] = await Promise.all([
        categoryService.getAllCategories(CURRENT_SECTION),
        subCategoryService.getAllSubCategories(null, CURRENT_SECTION),
      ]);
      const cols = processDataToColumns(catsRes.data || [], subsRes.data || []);
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

  // --- HANDLERS ---
  // (Keep your existing Category Handlers: handleAddCategory, handleEditCategory etc...)
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

  const handleBulkDelete = async () => {
    /* ... */
  };

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  // Classes
  const addClassRow = () =>
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
  const updateClassRow = (index, field, value) => {
    const n = [...classes];
    n[index][field] = value;
    setClasses(n);
  };
  const removeClassRow = (index) =>
    setClasses(classes.filter((_, i) => i !== index));

  // Tutors
  const addTutorRow = () =>
    setTutors([
      ...tutors,
      { name: "", qualification: "", subject: "", photoFile: null },
    ]);
  const updateTutorRow = (index, field, value) => {
    const n = [...tutors];
    n[index][field] = value;
    setTutors(n);
  };
  const removeTutorRow = (index) =>
    setTutors(tutors.filter((_, i) => i !== index));

  // Materials
  const addStudyMaterialRow = () =>
    setStudyMaterials([
      ...studyMaterials,
      { title: "", description: "", file: null },
    ]);
  const updateStudyMaterialRow = (index, field, value) => {
    const n = [...studyMaterials];
    n[index][field] = value;
    setStudyMaterials(n);
  };
  const removeStudyMaterialRow = (index) =>
    setStudyMaterials(studyMaterials.filter((_, i) => i !== index));

  // --- SUBMIT ---
  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // ✅ CRITICAL FIX: Ensure all ID fields are Arrays (even if 1 selected)
      // This matches the Postman payload structure exactly.
      const coursePayload = {
        ...courseData,
        originalPrice: Number(courseData.originalPrice) || 0,
        discountPrice: Number(courseData.discountPrice) || 0,
        discountPercent: Number(courseData.discountPercent) || 0,

        // Convert single strings to Arrays
        categoryIds: courseData.categoryIds ? [courseData.categoryIds] : [],
        subCategoryIds: courseData.subCategoryIds
          ? [courseData.subCategoryIds]
          : [],
        languageIds: courseData.languageIds ? [courseData.languageIds] : [],
        validityIds: courseData.validityIds ? [courseData.validityIds] : [],

        // Clean arrays (backend expects these structures)
        classes: classes.map((c) => ({
          title: c.title,
          topic: c.topic,
          order: Number(c.order),
        })),
        tutors: tutors.map((t) => ({
          name: t.name,
          qualification: t.qualification,
          subject: t.subject,
        })),
        studyMaterials: studyMaterials.map((s) => ({
          title: s.title,
          description: s.description,
        })),
      };

      // Append JSON string
      formData.append("course", JSON.stringify(coursePayload));

      // Append Files
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

      // Call API
      await courseService.createCourse(formData);
      alert("Course Created Successfully!");

      // Reset
      setCourseData(initialCourseState);
      setThumbnail(null);
      setClasses([]);
      setTutors([]);
      setStudyMaterials([]);
      setActiveView("CATEGORIES");
    } catch (error) {
      console.error(error);
      alert("Failed to create course. Please check fields.");
    } finally {
      setLoading(false);
    }
  };

  // ... (Rest of JSX Render is same as previous, using handleBulkDelete etc.)
  // I will provide the Render part below for completeness

  if (loading && activeView === "CATEGORIES" && columns.length === 0)
    return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.pageWrap}>
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
            activeView === "ADD_COURSE" ? styles.active : ""
          }`}
          onClick={() => setActiveView("ADD_COURSE")}
        >
          <BookOpen size={18} /> Add New Course
        </button>
      </div>

      {activeView === "CATEGORIES" && (
        <div className={styles.columnsContainer}>
          <div className={styles.headerRow}>
            <h1>Online Courses: Structure</h1>
            <div className={styles.headerActions}>
              <button className={styles.addBtnMain} onClick={handleAddCategory}>
                <Plus size={18} /> Add Category
              </button>
            </div>
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

      {activeView === "ADD_COURSE" && (
        <div className={styles.formContainer}>
          <h2>Create New Online Course</h2>
          <form onSubmit={handleSubmitCourse} className={styles.courseForm}>
            {/* 1. Basic */}
            <div className={styles.formSection}>
              <h3>Basic Information</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Course Name</label>
                  <input
                    name="name"
                    value={courseData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. UPSC Prelims 2025"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <select
                    name="categoryIds"
                    value={courseData.categoryIds}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {columns.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Thumbnail</label>
                  <input
                    type="file"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={courseData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* 2. Pricing */}
            <div className={styles.formSection}>
              <h3>Pricing</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Original Price</label>
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
                  <label>Note</label>
                  <input
                    type="text"
                    name="pricingNote"
                    value={courseData.pricingNote}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* 3. Tutors */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>Tutors</h3>
                <button
                  type="button"
                  onClick={addTutorRow}
                  className={styles.smallBtn}
                >
                  + Add
                </button>
              </div>
              {tutors.map((t, i) => (
                <div key={i} className={styles.dynamicRow}>
                  <input
                    placeholder="Name"
                    value={t.name}
                    onChange={(e) => updateTutorRow(i, "name", e.target.value)}
                  />
                  <input
                    placeholder="Subject"
                    value={t.subject}
                    onChange={(e) =>
                      updateTutorRow(i, "subject", e.target.value)
                    }
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      updateTutorRow(i, "photoFile", e.target.files[0])
                    }
                  />
                  <button type="button" onClick={() => removeTutorRow(i)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* 4. Classes */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>Classes</h3>
                <button
                  type="button"
                  onClick={addClassRow}
                  className={styles.smallBtn}
                >
                  + Add
                </button>
              </div>
              {classes.map((c, i) => (
                <div key={i} className={styles.classCard}>
                  <div className={styles.gridRow}>
                    <input
                      placeholder="Title"
                      value={c.title}
                      onChange={(e) =>
                        updateClassRow(i, "title", e.target.value)
                      }
                    />
                    <input
                      placeholder="Topic"
                      value={c.topic}
                      onChange={(e) =>
                        updateClassRow(i, "topic", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Order"
                      value={c.order}
                      onChange={(e) =>
                        updateClassRow(i, "order", e.target.value)
                      }
                      style={{ maxWidth: "80px" }}
                    />
                  </div>
                  <div className={styles.fileRow}>
                    <label>
                      Thumb{" "}
                      <input
                        type="file"
                        onChange={(e) =>
                          updateClassRow(i, "thumbnailFile", e.target.files[0])
                        }
                      />
                    </label>
                    <label>
                      Lecture{" "}
                      <input
                        type="file"
                        onChange={(e) =>
                          updateClassRow(i, "lectureFile", e.target.files[0])
                        }
                      />
                    </label>
                    <label>
                      Video{" "}
                      <input
                        type="file"
                        onChange={(e) =>
                          updateClassRow(i, "videoFile", e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeClassRow(i)}
                    className={styles.removeBtn}
                  >
                    Remove
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
