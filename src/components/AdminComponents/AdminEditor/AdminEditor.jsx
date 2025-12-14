import React, { useState, useEffect } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import styles from "./AdminEditor.module.css"; // Ensure you create this CSS file

const AdminEditor = ({ title, initialData, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState("basic");

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    originalPrice: "",
    discountPercent: "",
    description: "",
    category: "", // Store ID
    language: "", // Store ID
    validity: "", // Store ID
    thumbnail: null, // File object
    thumbnailPreview: "", // URL for preview
  });

  const [tutors, setTutors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);

  // --- Initialize Data on Edit ---
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        originalPrice: initialData.originalPrice || "",
        discountPercent: initialData.discountPercent || "",
        description: initialData.detailedDescription || "",
        category: initialData.categories?.[0]?._id || "",
        language: initialData.languages?.[0]?._id || "",
        validity: initialData.validities?.[0]?._id || "",
        thumbnailPreview: initialData.thumbnailUrl || "",
      });
      // Populate nested arrays if they exist
      if (initialData.tutors) setTutors(initialData.tutors);
      if (initialData.classes) setClasses(initialData.classes);
      if (initialData.studyMaterials) setMaterials(initialData.studyMaterials);
    }
  }, [initialData]);

  // --- Handlers: Basic Fields ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  // --- Handlers: Tutors ---
  const addTutor = () => {
    setTutors([
      ...tutors,
      { name: "", subject: "", qualification: "", imageFile: null },
    ]);
  };
  const updateTutor = (index, field, value) => {
    const newTutors = [...tutors];
    newTutors[index][field] = value;
    setTutors(newTutors);
  };
  const handleTutorImage = (index, file) => {
    const newTutors = [...tutors];
    newTutors[index].imageFile = file;
    newTutors[index].previewUrl = URL.createObjectURL(file);
    setTutors(newTutors);
  };
  const removeTutor = (index) =>
    setTutors(tutors.filter((_, i) => i !== index));

  // --- Handlers: Classes ---
  const addClass = () => {
    setClasses([
      ...classes,
      { title: "", topic: "", videoUrl: "", thumbnailFile: null },
    ]);
  };
  const updateClass = (index, field, value) => {
    const newClasses = [...classes];
    newClasses[index][field] = value;
    setClasses(newClasses);
  };
  const removeClass = (index) =>
    setClasses(classes.filter((_, i) => i !== index));

  // --- Handlers: Materials ---
  const addMaterial = () => {
    setMaterials([...materials, { title: "", file: null }]);
  };
  const updateMaterialText = (index, val) => {
    const newMats = [...materials];
    newMats[index].title = val;
    setMaterials(newMats);
  };
  const handleMaterialFile = (index, file) => {
    const newMats = [...materials];
    newMats[index].file = file;
    setMaterials(newMats);
  };
  const removeMaterial = (index) =>
    setMaterials(materials.filter((_, i) => i !== index));

  // --- SAVE ---
  const handleSaveClick = () => {
    // Construct FormData for Backend
    const data = new FormData();
    data.append("name", formData.name);
    data.append("originalPrice", formData.originalPrice);
    data.append("discountPercent", formData.discountPercent);
    data.append("description", formData.description);
    if (formData.category) data.append("categories", formData.category); // Backend expects array or ID? Check backend logic
    if (formData.language) data.append("languages", formData.language);
    if (formData.validity) data.append("validities", formData.validity);
    if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);

    // Append JSON strings for arrays (Backend needs to parse these)
    // Note: You must strip out File objects from JSON.stringify to avoid circular errors
    const tutorsPayload = tutors.map(
      ({ imageFile, previewUrl, ...rest }) => rest
    );
    data.append("tutors", JSON.stringify(tutorsPayload));

    const classesPayload = classes.map(({ thumbnailFile, ...rest }) => rest);
    data.append("classes", JSON.stringify(classesPayload));

    const materialsPayload = materials.map(({ file, ...rest }) => rest);
    data.append("studyMaterials", JSON.stringify(materialsPayload));

    // Append Files with indices to match Multer logic if needed,
    // OR Backend might rely on simple field names "tutorImages", "classThumbnails"

    // 1. Tutor Images
    tutors.forEach((t) => {
      if (t.imageFile) data.append("tutorImages", t.imageFile);
    });

    // 2. Class Thumbnails
    classes.forEach((c) => {
      if (c.thumbnailFile) data.append("classThumbnails", c.thumbnailFile);
    });

    // 3. Material Files
    materials.forEach((m) => {
      if (m.file) data.append("studyMaterialFiles", m.file);
    });

    onSave(data);
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <div className={styles.tabs}>
          {["basic", "tutors", "classes", "materials"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${
                activeTab === tab ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {/* --- BASIC TAB --- */}
        {activeTab === "basic" && (
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Course Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. UPSC Prelims 2025"
              />
            </div>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Discount (%)</label>
                <input
                  type="number"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* IDs Inputs (Ideally these should be <select> fetching from API) */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Category ID</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Category ID"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Language ID</label>
                <input
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="Language ID"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Validity ID</label>
                <input
                  name="validity"
                  value={formData.validity}
                  onChange={handleChange}
                  placeholder="Validity ID"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Thumbnail</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {formData.thumbnailPreview && (
                  <img
                    src={formData.thumbnailPreview}
                    alt="Preview"
                    className={styles.previewImg}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TUTORS TAB --- */}
        {activeTab === "tutors" && (
          <div className={styles.listSection}>
            {tutors.map((tutor, idx) => (
              <div key={idx} className={styles.listItem}>
                <div className={styles.row}>
                  <input
                    placeholder="Name"
                    value={tutor.name}
                    onChange={(e) => updateTutor(idx, "name", e.target.value)}
                  />
                  <input
                    placeholder="Subject"
                    value={tutor.subject}
                    onChange={(e) =>
                      updateTutor(idx, "subject", e.target.value)
                    }
                  />
                  <input
                    placeholder="Qualification"
                    value={tutor.qualification}
                    onChange={(e) =>
                      updateTutor(idx, "qualification", e.target.value)
                    }
                  />
                </div>
                <div className={styles.row} style={{ marginTop: 10 }}>
                  <input
                    type="file"
                    onChange={(e) => handleTutorImage(idx, e.target.files[0])}
                  />
                  <button
                    className={styles.delBtn}
                    onClick={() => removeTutor(idx)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addTutor}>
              <Plus size={16} /> Add Tutor
            </button>
          </div>
        )}

        {/* --- CLASSES TAB --- */}
        {activeTab === "classes" && (
          <div className={styles.listSection}>
            {classes.map((cls, idx) => (
              <div key={idx} className={styles.listItem}>
                <div className={styles.row}>
                  <input
                    placeholder="Title"
                    value={cls.title}
                    onChange={(e) => updateClass(idx, "title", e.target.value)}
                  />
                  <input
                    placeholder="Topic"
                    value={cls.topic}
                    onChange={(e) => updateClass(idx, "topic", e.target.value)}
                  />
                </div>
                <div className={styles.row} style={{ marginTop: 10 }}>
                  <input
                    placeholder="Video URL"
                    value={cls.videoUrl}
                    onChange={(e) =>
                      updateClass(idx, "videoUrl", e.target.value)
                    }
                  />
                  <button
                    className={styles.delBtn}
                    onClick={() => removeClass(idx)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addClass}>
              <Plus size={16} /> Add Class
            </button>
          </div>
        )}

        {/* --- MATERIALS TAB --- */}
        {activeTab === "materials" && (
          <div className={styles.listSection}>
            {materials.map((mat, idx) => (
              <div key={idx} className={styles.listItem}>
                <input
                  placeholder="Material Title"
                  value={mat.title}
                  onChange={(e) => updateMaterialText(idx, e.target.value)}
                />
                <input
                  type="file"
                  onChange={(e) => handleMaterialFile(idx, e.target.files[0])}
                  accept=".pdf,.doc"
                />
                <button
                  className={styles.delBtn}
                  onClick={() => removeMaterial(idx)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addMaterial}>
              <Plus size={16} /> Add Material
            </button>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button className={styles.saveBtn} onClick={handleSaveClick}>
          Save Course
        </button>
      </div>
    </div>
  );
};

export default AdminEditor;
