import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CategoryContentAccordion from "../../../components/CategoryContentAccordion/CategoryContentAccordion";
import EditDailyQuizModal from "../../../components/AdminComponents/EditDailyQuizModal/EditDailyQuizModal";
import styles from "./AdminUpdateDailyQuizzesPage.module.css";

// API
import * as dailyQuizService from "../../../api/services/adminDailyQuizService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";

const AdminUpdateDailyQuizzesPage = () => {
  const navigate = useNavigate();

  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState(null);

  /* ----------------------------------------------------
     BUILD HIERARCHY
     Category → SubCategory → Quizzes
  ---------------------------------------------------- */
  const buildHierarchy = (quizzes, cats, subCats) => {
    console.log("📦 BUILD HIERARCHY INPUT", {
      quizzes,
      cats,
      subCats,
    });

    // Categories
    const catMap = cats.map((c) => ({
      id: c._id,
      name: c.name,
      subCategories: [],
    }));

    // SubCategories
    const subMap = subCats.map((s) => ({
      id: s._id,
      name: s.name,
      parentId: s.category?._id || s.category,
      items: [],
    }));

    console.log("🧩 SUB MAP", subMap);

    quizzes.forEach((quiz) => {
      console.log("➡️ Processing quiz:", quiz.name);

      // Calculate total questions from sections
      const totalQuestions =
        quiz.sections?.reduce(
          (sum, sec) => sum + (sec.questions?.length || 0),
          0
        ) || 0;

      const formattedItem = {
        id: quiz._id,
        ...quiz, // Needed for edit modal
        name: quiz.name,
        questions: totalQuestions,
        language: quiz.languages?.map((l) => l.name).join(", ") || "-",
        date: quiz.examDate
          ? new Date(quiz.examDate).toLocaleDateString()
          : "-",
      };

      console.log("📄 FORMATTED QUIZ ITEM", formattedItem);

      // 🔥 subCategories are POPULATED OBJECTS
      quiz.subCategories?.forEach((sub) => {
        const subId = sub?._id || sub;

        const targetSub = subMap.find((s) => String(s.id) === String(subId));

        if (targetSub) {
          console.log(
            `✅ Attached "${quiz.name}" to subcategory "${targetSub.name}"`
          );
          targetSub.items.push(formattedItem);
        } else {
          console.warn("❌ SubCategory NOT FOUND:", subId);
        }
      });
    });

    // Attach subCategories to Categories
    subMap.forEach((sub) => {
      const parentCat = catMap.find(
        (c) => String(c.id) === String(sub.parentId)
      );
      if (parentCat) {
        parentCat.subCategories.push(sub);
      }
    });

    console.log("🌳 FINAL TREE DATA", catMap);
    return catMap;
  };

  /* ----------------------------------------------------
     FETCH DATA
  ---------------------------------------------------- */
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [quizRes, catRes, subRes] = await Promise.all([
        dailyQuizService.getAllQuizzes(),
        categoryService.getAllCategories("DAILY_QUIZ"),
        subCategoryService.getAllSubCategories(null, "DAILY_QUIZ"),
      ]);

      const quizzes = quizRes.data?.data || quizRes.data || [];
      const categories = catRes.data?.data || catRes.data || [];
      const subCategories = subRes.data?.data || subRes.data || [];

      console.log("✅ FETCHED QUIZZES", quizzes);

      const hierarchy = buildHierarchy(quizzes, categories, subCategories);
      setTreeData(hierarchy);
    } catch (error) {
      console.error("❌ FETCH ERROR", error);
      alert("Failed to load quizzes. Check console.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /* ----------------------------------------------------
     ACTION HANDLERS
  ---------------------------------------------------- */
  const handleEditClick = (quiz) => {
    setQuizToEdit(quiz);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (quiz) => {
    if (!window.confirm(`Delete Quiz "${quiz.name}"?`)) return;
    try {
      await dailyQuizService.deleteQuiz(quiz.id);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleModalClose = (refresh) => {
    setIsModalOpen(false);
    setQuizToEdit(null);
    if (refresh) fetchAllData();
  };

  const handleNavigateToAdd = () => {
    navigate("/admin/content/add/daily-quiz");
  };

  /* ----------------------------------------------------
     RENDER
  ---------------------------------------------------- */
  if (loading) {
    return <div className={styles.loader}>Loading Quizzes...</div>;
  }

  return (
    <div className={styles.pageWrap}>
      <h1>Update / Delete Daily Quizzes</h1>

      {treeData.length === 0 ? (
        <div className={styles.empty}>No Categories or Quizzes found.</div>
      ) : (
        treeData.map((cat) => (
          <CategoryContentAccordion
            key={cat.id}
            variant="quizzes"
            categoryName={cat.name}
            subCategories={cat.subCategories}
            onAddItem={handleNavigateToAdd}
            onEditItem={handleEditClick}
            onDeleteItem={handleDeleteClick}
          />
        ))
      )}

      {isModalOpen && (
        <EditDailyQuizModal
          isOpen={isModalOpen}
          quiz={quizToEdit}
          onClose={handleModalClose}
        />
      )}

      <div className={styles.addCategoryWrap}>
        <button className={styles.addCategoryBtn} onClick={handleNavigateToAdd}>
          <Plus size={18} /> Add Quiz
        </button>
      </div>
    </div>
  );
};

export default AdminUpdateDailyQuizzesPage;
