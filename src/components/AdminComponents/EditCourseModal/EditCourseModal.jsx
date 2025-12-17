import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Video,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import * as courseService from "../../../api/services/adminCourseService";
import { getAllLanguages, getAllValidities } from "../../../api/apiRoutes";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import AdminEditor from "../AdminEditor/AdminEditor"; // Ensure correct path
import styles from "./EditCourseModal.module.css";

const EditCourseModal = ({ isOpen, course, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState({
    cats: [],
    subs: [],
    langs: [],
    vals: [],
  });

  // --- FORM STATE ---
  const [courseData, setCourseData] = useState({});
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);

  // New Files State
  const [thumbnail, setThumbnail] = useState(null);

  // --- 1. INITIALIZE DATA ---
  useEffect(() => {
    if (!isOpen) return;

    // A. Fetch Dropdowns
    const fetchDropdowns = async () => {
      try {
        const [c, s, l, v] = await Promise.all([
          categoryService.getAllCategories("ONLINE_COURSE"),
          subCategoryService.getAllSubCategories(null, "ONLINE_COURSE"),
          getAllLanguages(),
          getAllValidities(),
        ]);
        setLists({
          cats: c.data || [],
          subs: s.data || [],
          langs: l.data?.data || [],
          vals: v.data?.data || [],
        });
      } catch (err) {
        console.error("Error loading lists", err);
      }
    };
    fetchDropdowns();

    // B. Populate Form with Existing Course Data
    if (course) {
      setCourseData({
        name: course.name || "",
        startDate: course.startDate ? course.startDate.split("T")[0] : "",
        originalPrice: course.originalPrice || "",
        discountPrice: course.discountPrice || "",
        pricingNote: course.pricingNote || "",
        shortDescription: course.shortDescription || "",
        detailedDescription: course.detailedDescription || "",
        thumbnailUrl: course.thumbnailUrl || "",

        // IDs for Multi-Selects (Safe Mapping)
        categoryIds: Array.isArray(course.categories)
          ? course.categories.map((c) => c._id || c)
          : [],
        subCategoryIds: Array.isArray(course.subCategories)
          ? course.subCategories.map((s) => s._id || s)
          : [],
        languageIds: Array.isArray(course.languages)
          ? course.languages.map((l) => l._id || l)
          : [],
        validityIds: Array.isArray(course.validities)
          ? course.validities.map((v) => v._id || v)
          : [],
        isActive: course.isActive ?? true,
      });

      // Populate Nested Arrays
      setClasses(
        Array.isArray(course.classes)
          ? course.classes.map((c) => ({
              ...c,
              thumbnailFile: null,
              videoFile: null,
              lectureFile: null,
            }))
          : []
      );

      setTutors(
        Array.isArray(course.tutors)
          ? course.tutors.map((t) => ({
              ...t,
              photoFile: null,
            }))
          : []
      );

      setStudyMaterials(
        Array.isArray(course.studyMaterials)
          ? course.studyMaterials.map((s) => ({
              ...s,
              file: null,
            }))
          : []
      );
    }
  }, [isOpen, course]);

  // --- 2. HANDLERS ---
  const handleInputChange = (e) =>
    setCourseData({ ...courseData, [e.target.name]: e.target.value });

  const handleEditorChange = (html) =>
    setCourseData({ ...courseData, detailedDescription: html });

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, (o) => o.value);
    setCourseData({ ...courseData, [e.target.name]: values });
  };

  // Nested Updaters
  const updateClass = (i, field, value) => {
    const newClasses = [...classes];
    newClasses[i][field] = value;
    setClasses(newClasses);
  };
  const updateTutor = (i, field, value) => {
    const newTutors = [...tutors];
    newTutors[i][field] = value;
    setTutors(newTutors);
  };
  const updateMaterial = (i, field, value) => {
    const newMaterials = [...studyMaterials];
    newMaterials[i][field] = value;
    setStudyMaterials(newMaterials);
  };

  // --- 3. SUBMIT ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      const payload = {
        ...courseData,
        originalPrice: Number(courseData.originalPrice),
        discountPrice: Number(courseData.discountPrice) || 0,

        // Map Nested Items (Send _id to update existing)
        classes: classes.map((c) => ({
          _id: c._id,
          title: c.title,
          topic: c.topic,
          order: c.order,
        })),
        tutors: tutors.map((t) => ({
          _id: t._id,
          name: t.name,
          qualification: t.qualification,
          subject: t.subject,
        })),
        studyMaterials: studyMaterials.map((s) => ({
          _id: s._id,
          title: s.title,
          description: s.description,
        })),
      };

      formData.append("course", JSON.stringify(payload));
      if (thumbnail) formData.append("thumbnail", thumbnail);

      // Append Nested Files
      classes.forEach((c) => {
        if (c.thumbnailFile)
          formData.append("classThumbnails", c.thumbnailFile);
        if (c.lectureFile) formData.append("classLecturePics", c.lectureFile);
        if (c.videoFile) formData.append("classVideos", c.videoFile);
      });
      tutors.forEach((t) => {
        if (t.photoFile) formData.append("tutorImages", t.photoFile);
      });
      studyMaterials.forEach((s) => {
        if (s.file) formData.append("studyMaterialFiles", s.file);
      });

      await courseService.updateCourse(course._id, formData);
      alert("Updated Successfully!");
      onClose(true); // Close & Refresh
    } catch (err) {
      console.error(err);
      alert("Update Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Edit Course: {course?.name}</h2>
          <button onClick={() => onClose(false)} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className={styles.body}>
          {/* --- SECTION 1: BASIC INFO --- */}
          <div className={styles.section}>
            <h3>Basic Details</h3>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Course Name</label>
                <input
                  name="name"
                  value={courseData.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Price</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={courseData.originalPrice || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className={styles.inputGroup} style={{ marginTop: 10 }}>
              <label>Thumbnail</label>
              <div className={styles.fileRowWithPreview}>
                {courseData.thumbnailUrl && (
                  <div className={styles.previewBox}>
                    <img src={courseData.thumbnailUrl} alt="Current" />
                    <span>Current</span>
                  </div>
                )}
                <div className={styles.fileInputWrapper}>
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                  />
                  {thumbnail && (
                    <span className={styles.newBadge}>New Selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION 2: CONFIGURATION (LANGUAGES / VALIDITIES) --- */}
          <div className={styles.section}>
            <h3>Configuration</h3>
            <div className={styles.row}>
              {/* LANGUAGES */}
              <div className={styles.inputGroup}>
                <label>Languages Available (Ctrl+Click)</label>
                <select
                  multiple
                  name="languageIds"
                  value={courseData.languageIds}
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

              {/* VALIDITIES */}
              <div className={styles.inputGroup}>
                <label>Validities Available (Ctrl+Click)</label>
                <select
                  multiple
                  name="validityIds"
                  value={courseData.validityIds}
                  onChange={handleMultiSelect}
                  className={styles.multiSelect}
                >
                  {lists.vals.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.label} ({v.durationInDays} days)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* --- SECTION 3: DESCRIPTIONS --- */}
          <div className={styles.section}>
            <h3>Description</h3>

            {/* Short Description */}
            <div className={styles.inputGroup} style={{ marginBottom: "1rem" }}>
              <label>Short Description</label>
              <textarea
                name="shortDescription"
                rows={3}
                value={courseData.shortDescription || ""}
                onChange={handleInputChange}
                className={styles.textArea}
              />
            </div>

            {/* Detailed Description (Rich Text) */}
            <div className={styles.inputGroup}>
              <label>Detailed Description</label>
              <AdminEditor
                value={courseData.detailedDescription || ""}
                onChange={handleEditorChange}
              />
            </div>
          </div>

          {/* --- SECTION 4: CLASSES --- */}
          <div className={styles.section}>
            <h3>Classes</h3>
            {classes.map((c, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h4>Class {i + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const n = [...classes];
                      n.splice(i, 1);
                      setClasses(n);
                    }}
                    className={styles.delBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.row}>
                  <input
                    value={c.title || ""}
                    onChange={(e) => updateClass(i, "title", e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    value={c.topic || ""}
                    onChange={(e) => updateClass(i, "topic", e.target.value)}
                    placeholder="Topic"
                  />
                </div>

                {/* Class Files with Previews */}
                <div className={styles.filesGrid}>
                  {/* Thumbnail */}
                  <div className={styles.fileItem}>
                    <label>
                      <ImageIcon size={14} /> Thumbnail
                    </label>
                    {c.thumbnailUrl && (
                      <a
                        href={c.thumbnailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        View Current
                      </a>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateClass(i, "thumbnailFile", e.target.files[0])
                      }
                    />
                  </div>

                  {/* Lecture Pic */}
                  <div className={styles.fileItem}>
                    <label>
                      <ImageIcon size={14} /> Lecture Pic
                    </label>
                    {c.lecturePhotoUrl && (
                      <a
                        href={c.lecturePhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        View Current
                      </a>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateClass(i, "lectureFile", e.target.files[0])
                      }
                    />
                  </div>

                  {/* Video */}
                  <div className={styles.fileItem}>
                    <label>
                      <Video size={14} /> Video
                    </label>
                    {c.videoUrl && (
                      <a
                        href={c.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        Play Current
                      </a>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        updateClass(i, "videoFile", e.target.files[0])
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setClasses([...classes, {}])}
              className={styles.addBtn}
            >
              <Plus size={14} /> Add Class
            </button>
          </div>

          {/* --- SECTION 5: TUTORS --- */}
          <div className={styles.section}>
            <h3>Tutors</h3>
            {tutors.map((t, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h4>Tutor {i + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const n = [...tutors];
                      n.splice(i, 1);
                      setTutors(n);
                    }}
                    className={styles.delBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className={styles.row}>
                  <input
                    value={t.name || ""}
                    onChange={(e) => updateTutor(i, "name", e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    value={t.subject || ""}
                    onChange={(e) => updateTutor(i, "subject", e.target.value)}
                    placeholder="Subject"
                  />
                </div>

                {/* Tutor Photo Preview */}
                <div className={styles.fileRowWithPreview}>
                  {t.photoUrl && (
                    <img
                      src={t.photoUrl}
                      alt="Tutor"
                      className={styles.smallAvatar}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      updateTutor(i, "photoFile", e.target.files[0])
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTutors([...tutors, {}])}
              className={styles.addBtn}
            >
              <Plus size={14} /> Add Tutor
            </button>
          </div>

          {/* --- SECTION 6: MATERIALS --- */}
          <div className={styles.section}>
            <h3>Study Materials</h3>
            {studyMaterials.map((s, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h4>Material {i + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const n = [...studyMaterials];
                      n.splice(i, 1);
                      setStudyMaterials(n);
                    }}
                    className={styles.delBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  value={s.title || ""}
                  onChange={(e) => updateMaterial(i, "title", e.target.value)}
                  placeholder="Title"
                />

                <div className={styles.fileItem} style={{ marginTop: 10 }}>
                  <label>
                    <FileText size={14} /> PDF/Doc
                  </label>
                  {s.fileUrl && (
                    <a
                      href={s.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.link}
                    >
                      Open Current File
                    </a>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      updateMaterial(i, "file", e.target.files[0])
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setStudyMaterials([...studyMaterials, {}])}
              className={styles.addBtn}
            >
              <Plus size={14} /> Add Material
            </button>
          </div>

          {/* --- FOOTER --- */}
          <div className={styles.footer}>
            <button type="submit" disabled={loading} className={styles.saveBtn}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
