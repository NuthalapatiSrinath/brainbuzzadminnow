import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CategoryContentAccordion from "../../../components/CategoryContentAccordion/CategoryContentAccordion";
import EditCourseModal from "../../../components/AdminComponents/EditCourseModal/EditCourseModal";
import styles from "./AdminUpdateCoursesPage.module.css";

// API
import * as courseService from "../../../api/services/adminCourseService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";

const AdminUpdateCoursesPage = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const buildHierarchy = (courses, cats, subCats) => {
    const catMap = cats.map((c) => ({
      id: c._id,
      name: c.name,
      subCategories: [],
    }));
    const subMap = subCats.map((s) => ({
      id: s._id,
      name: s.name,
      parentId: s.category?._id || s.category,
      items: [],
    }));

    courses.forEach((course) => {
      // Safe Array Logic
      const languagesList = Array.isArray(course.languages)
        ? course.languages.map((l) => l?.name || "").join(", ")
        : "N/A";
      const validitiesList = Array.isArray(course.validities)
        ? course.validities.map((v) => v?.label || "").join(", ")
        : "N/A";

      const formattedItem = {
        id: course._id,
        ...course,
        languages: languagesList,
        validity: validitiesList,
        price: `₹${course.originalPrice || 0}`,
      };

      if (Array.isArray(course.subCategories)) {
        course.subCategories.forEach((subRef) => {
          const subId = subRef._id || subRef;
          const targetSub = subMap.find((s) => s.id === subId);
          if (targetSub) targetSub.items.push(formattedItem);
        });
      }
    });

    subMap.forEach((sub) => {
      const parentCat = catMap.find((c) => c.id === sub.parentId);
      if (parentCat) parentCat.subCategories.push(sub);
    });

    return catMap;
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, catsRes, subsRes] = await Promise.all([
        courseService.getAllCourses("?contentType=ONLINE_COURSE"),
        categoryService.getAllCategories("ONLINE_COURSE"),
        subCategoryService.getAllSubCategories(null, "ONLINE_COURSE"),
      ]);
      const hierarchy = buildHierarchy(
        coursesRes.data?.data || [],
        catsRes.data || [],
        subsRes.data || []
      );
      setTreeData(hierarchy);
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleEditClick = (course) => {
    setCourseToEdit(course);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (course) => {
    if (!window.confirm(`Delete "${course.name}"?`)) return;
    try {
      await courseService.deleteCourse(course.id);
      fetchAllData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    setCourseToEdit(null);
    if (shouldRefresh) fetchAllData();
  };

  const handleNavigateToAdd = () => {
    navigate("/admin/content/add/online-course");
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.pageWrap}>
      <h1>Update / Delete Courses</h1>
      {treeData.map((cat) => (
        <CategoryContentAccordion
          key={cat.id}
          variant="courses"
          categoryName={cat.name}
          subCategories={cat.subCategories}
          onAddItem={handleNavigateToAdd}
          onEditItem={handleEditClick}
          onDeleteItem={handleDeleteClick}
        />
      ))}

      {isModalOpen && (
        <EditCourseModal
          isOpen={isModalOpen}
          course={courseToEdit}
          onClose={handleModalClose}
        />
      )}

      <div className={styles.addCategoryWrap}>
        <button className={styles.addCategoryBtn} onClick={handleNavigateToAdd}>
          <Plus size={18} /> Add Course
        </button>
      </div>
    </div>
  );
};

export default AdminUpdateCoursesPage;
