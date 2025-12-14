import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
// Import API functions
import {
  getAllCourses,
  createCourse,
  updateCourse,
} from "../../../api/apiRoutes";

// Components
import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import AdminEditor from "../../../components/AdminComponents/AdminEditor/AdminEditor";
import styles from "./AdminOnlineCoursesPage.module.css";

const AdminOnlineCoursesPage = () => {
  const dispatch = useDispatch();

  const [viewMode, setViewMode] = useState("list");
  const [editingData, setEditingData] = useState(null);

  // Real Data State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. Fetch Data on Mount ---
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getAllCourses(); // Call API
      // Backend returns { success: true, data: [...] } or just arrays?
      // Adjust based on your backend response structure
      setCourses(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleAddNew = () => {
    setEditingData(null);
    setViewMode("add");
  };

  const handleEditItem = (item) => {
    setEditingData(item);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingData(null);
  };

  const handleSaveContent = async (formData) => {
    try {
      setLoading(true);
      if (viewMode === "add") {
        await createCourse(formData);
        alert("Course Created Successfully!");
      } else if (viewMode === "edit" && editingData?._id) {
        await updateCourse(editingData._id, formData);
        alert("Course Updated Successfully!");
      }
      // Refresh list and go back
      fetchCourses();
      handleBackToList();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  if (loading) return <div className={styles.loader}>Loading...</div>;

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className={styles.pageWrap}>
        <button onClick={handleBackToList} className={styles.backBtn}>
          ← Back to Courses
        </button>
        <AdminEditor
          title={viewMode === "add" ? "Add New Course" : "Edit Course Details"}
          initialData={editingData}
          onSave={handleSaveContent}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <h1>Online Courses Management</h1>
        <button className={styles.addBtnMain} onClick={handleAddNew}>
          + Add New Course
        </button>
      </div>

      <div className={styles.gridContainer}>
        {/* Render Courses as Cards or List here */}
        {courses.length === 0 ? (
          <p>No courses found. Add one!</p>
        ) : (
          /* Note: You originally had 'CategoryColumn' logic. 
              Since the API returns a flat list of courses, you might want 
              to map them to your AdminCourseCard directly, 
              or group them by category if you prefer the column view.
           */
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {courses.map((course) => (
              <div
                key={course._id}
                className={styles.courseCardStub} // Add CSS for this
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "8px",
                  width: "250px",
                }}
              >
                <img
                  src={course.thumbnailUrl}
                  alt={course.name}
                  style={{ width: "100%", height: "140px", objectFit: "cover" }}
                />
                <h3>{course.name}</h3>
                <p>Price: ₹{course.originalPrice}</p>
                <button onClick={() => handleEditItem(course)}>Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOnlineCoursesPage;
