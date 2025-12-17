import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../../redux/slices/modalSlice";
import {
  Plus,
  Layers,
  FileText,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

// --- API Services ---
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import * as quizService from "../../../api/services/adminDailyQuizService"; // Ensure this matches your service file
import { getAllLanguages } from "../../../api/apiRoutes";

// --- Components ---
import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
import AdminEditor from "../../../components/AdminComponents/AdminEditor/AdminEditor";
import styles from "./AdminDailyQuizPage.module.css";

const AdminDailyQuizPage = () => {
  const dispatch = useDispatch();

  // --- UI STATE ---
  const [activeView, setActiveView] = useState("CATEGORIES");
  const [loading, setLoading] = useState(false);

  // --- DATA LISTS ---
  const [columns, setColumns] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [flatSubCategories, setFlatSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  const CURRENT_SECTION = "DAILY_QUIZ";
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

  // --- FORM STATE ---
  const initialFormState = {
    name: "",
    month: "JANUARY",
    examDate: "",
    categoryIds: [], // Multi-select
    subCategoryIds: [], // Multi-select
    languageIds: [], // Multi-select
    instructions: "",
    isActive: true,
  };

  const [quizData, setQuizData] = useState(initialFormState);

  // --- SECTIONS & QUESTIONS STATE ---
  const [sections, setSections] = useState([]);
  const [totals, setTotals] = useState({ marks: 0, questions: 0 });

  // Auto-Calculate Totals
  useEffect(() => {
    let qCount = 0;
    let mCount = 0;
    sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        qCount += 1;
        mCount += Number(q.marks) || 0;
      });
    });
    setTotals({ marks: mCount, questions: qCount });
  }, [sections]);

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
      setColumns(processDataToColumns(cats, subs));
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- MODAL HANDLERS ---
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

  // inside AdminDailyQuizPage.jsx

  const handleAddSubCategory = (parent) =>
    dispatch(
      openModal({
        type: "SUBCATEGORY_MODAL",
        modalData: {
          mode: "add",
          parentCategory: parent,
          section: "DAILY_QUIZ", // <--- This ensures isolation
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
  const handleInputChange = (e) =>
    setQuizData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditorChange = (html) =>
    setQuizData((prev) => ({ ...prev, instructions: html }));

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selectedValues.push(options[i].value);
    }
    setQuizData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  const filteredSubCategories = flatSubCategories.filter((sub) => {
    if (quizData.categoryIds.length === 0) return false;
    const parentId = sub.category?._id || sub.category;
    return quizData.categoryIds.includes(parentId);
  });

  // --- BUILDER HANDLERS ---
  const addSection = () =>
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}`,
        order: sections.length + 1,
        questions: [],
        collapsed: false,
      },
    ]);
  const updateSection = (sIdx, field, value) => {
    const n = [...sections];
    n[sIdx][field] = value;
    setSections(n);
  };
  const removeSection = (sIdx) =>
    setSections(sections.filter((_, i) => i !== sIdx));
  const toggleSection = (sIdx) => {
    const n = [...sections];
    n[sIdx].collapsed = !n[sIdx].collapsed;
    setSections(n);
  };

  const addQuestion = (sIdx) => {
    const n = [...sections];
    n[sIdx].questions.push({
      questionNumber: n[sIdx].questions.length + 1,
      questionText: "",
      questionType: "MCQ",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
      marks: 1,
      negativeMarks: 0,
    });
    setSections(n);
  };

  const updateQuestion = (sIdx, qIdx, field, value) => {
    const n = [...sections];
    n[sIdx].questions[qIdx][field] = value;
    setSections(n);
  };

  const removeQuestion = (sIdx, qIdx) => {
    const n = [...sections];
    n[sIdx].questions = n[sIdx].questions.filter((_, i) => i !== qIdx);
    setSections(n);
  };

  const updateOption = (sIdx, qIdx, oIdx, value) => {
    const n = [...sections];
    n[sIdx].questions[qIdx].options[oIdx] = value;
    setSections(n);
  };

  const setCorrectOption = (sIdx, qIdx, oIdx) => {
    const n = [...sections];
    n[sIdx].questions[qIdx].correctOptionIndex = oIdx;
    setSections(n);
  };

  const addOption = (sIdx, qIdx) => {
    const n = [...sections];
    n[sIdx].questions[qIdx].options.push("");
    setSections(n);
  };

  const removeOption = (sIdx, qIdx, oIdx) => {
    const n = [...sections];
    n[sIdx].questions[qIdx].options = n[sIdx].questions[qIdx].options.filter(
      (_, i) => i !== oIdx
    );
    setSections(n);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Basic Validation
    if (!quizData.name) {
      alert("Please enter a Quiz Name.");
      setLoading(false);
      return;
    }
    if (quizData.categoryIds.length === 0) {
      alert("Please select at least one Category.");
      setLoading(false);
      return;
    }

    try {
      // 2. Construct Payload EXACTLY like Postman
      const quizPayload = {
        name: quizData.name,
        month: quizData.month,
        examDate: quizData.examDate,

        // Send Arrays exactly as they are in state
        categoryIds: quizData.categoryIds,
        subCategoryIds: quizData.subCategoryIds,
        languageIds: quizData.languageIds,

        totalMarks: Number(totals.marks),
        totalQuestions: Number(totals.questions),
        instructions: quizData.instructions,

        // Keep the hierarchy: Sections -> Questions
        sections: sections.map((sec) => ({
          title: sec.title,
          order: Number(sec.order),
          questions: sec.questions.map((q) => ({
            questionNumber: Number(q.questionNumber),
            questionText: q.questionText,
            questionType: "MCQ",
            options: q.options,
            correctOptionIndex: Number(q.correctOptionIndex),
            explanation: q.explanation,
            marks: Number(q.marks),
            negativeMarks: Number(q.negativeMarks),
          })),
        })),

        isActive: quizData.isActive,
      };

      console.log("Submitting Payload:", JSON.stringify(quizPayload, null, 2));

      await quizService.createDailyQuiz({
        quiz: quizPayload,
      });

      alert("Daily Quiz Created Successfully!");

      // Reset Form
      setQuizData(initialFormState);
      setSections([]);
      setTotals({ marks: 0, questions: 0 });
      setActiveView("CATEGORIES");
    } catch (error) {
      console.error("Create Error:", error);
      const errMsg =
        error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to create Quiz: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };
  // ... rest of component

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
          <FileText size={18} /> Create Quiz
        </button>
      </div>

      {/* Structure View */}
      {activeView === "CATEGORIES" && (
        <div className={styles.columnsContainer}>
          <div className={styles.headerRow}>
            <h1>Daily Quizzes: Structure</h1>
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

      {/* Create Quiz Form */}
      {activeView === "ADD" && (
        <div className={styles.formContainer}>
          <h2>Create Daily Quiz</h2>
          <form onSubmit={handleSubmit} className={styles.quizForm}>
            {/* 1. Basic Info */}
            <div className={styles.formSection}>
              <h3>Quiz Details</h3>
              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Quiz Name *</label>
                  <input
                    name="name"
                    value={quizData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. TSPSC Daily Quiz"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Month</label>
                  <select
                    name="month"
                    value={quizData.month}
                    onChange={handleInputChange}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Exam Date</label>
                  <input
                    type="date"
                    name="examDate"
                    value={quizData.examDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Categories (Ctrl+Click)</label>
                  <select
                    multiple
                    name="categoryIds"
                    value={quizData.categoryIds}
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
                    value={quizData.subCategoryIds}
                    onChange={handleMultiSelectChange}
                    className={styles.multiSelect}
                  >
                    {filteredSubCategories.map((s) => (
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
                    value={quizData.languageIds}
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

              <div className={styles.gridRow}>
                <div className={styles.inputGroup}>
                  <label>Total Marks (Auto)</label>
                  <input
                    value={totals.marks}
                    disabled
                    className={styles.readOnly}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Total Questions (Auto)</label>
                  <input
                    value={totals.questions}
                    disabled
                    className={styles.readOnly}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Instructions</label>
                <AdminEditor
                  value={quizData.instructions}
                  onChange={handleEditorChange}
                />
              </div>
            </div>

            {/* 2. Questions Builder */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>Questions Builder</h3>
                <button
                  type="button"
                  onClick={addSection}
                  className={styles.addBtnMain}
                >
                  <Plus size={16} /> Add Section
                </button>
              </div>

              {sections.map((section, sIdx) => (
                <div key={sIdx} className={styles.sectionCard}>
                  <div
                    className={styles.sectionCardHeader}
                    onClick={() => toggleSection(sIdx)}
                  >
                    <div className={styles.headerLeft}>
                      {section.collapsed ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronUp size={20} />
                      )}
                      <span>
                        {section.title} (Qs: {section.questions.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(sIdx);
                      }}
                      className={styles.deleteBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {!section.collapsed && (
                    <div className={styles.sectionBody}>
                      <div className={styles.gridRow}>
                        <div className={styles.inputGroup}>
                          <label>Section Title</label>
                          <input
                            value={section.title}
                            onChange={(e) =>
                              updateSection(sIdx, "title", e.target.value)
                            }
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Order</label>
                          <input
                            type="number"
                            value={section.order}
                            onChange={(e) =>
                              updateSection(sIdx, "order", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className={styles.questionsList}>
                        {section.questions.map((q, qIdx) => (
                          <div key={qIdx} className={styles.questionCard}>
                            <div className={styles.qHeader}>
                              <span className={styles.qNum}>Q{qIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeQuestion(sIdx, qIdx)}
                                className={styles.deleteBtn}
                              >
                                Remove
                              </button>
                            </div>
                            <div className={styles.inputGroup}>
                              <label>Question Text</label>
                              <textarea
                                rows={2}
                                value={q.questionText}
                                onChange={(e) =>
                                  updateQuestion(
                                    sIdx,
                                    qIdx,
                                    "questionText",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles.gridRow}>
                              <div className={styles.inputGroup}>
                                <label>Marks</label>
                                <input
                                  type="number"
                                  value={q.marks}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sIdx,
                                      qIdx,
                                      "marks",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className={styles.inputGroup}>
                                <label>Neg. Marks</label>
                                <input
                                  type="number"
                                  value={q.negativeMarks}
                                  onChange={(e) =>
                                    updateQuestion(
                                      sIdx,
                                      qIdx,
                                      "negativeMarks",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className={styles.optionsContainer}>
                              <label>Options (Select Correct)</label>
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className={styles.optionRow}>
                                  <input
                                    type="radio"
                                    name={`correct-${sIdx}-${qIdx}`}
                                    checked={q.correctOptionIndex === oIdx}
                                    onChange={() =>
                                      setCorrectOption(sIdx, qIdx, oIdx)
                                    }
                                  />
                                  <input
                                    value={opt}
                                    onChange={(e) =>
                                      updateOption(
                                        sIdx,
                                        qIdx,
                                        oIdx,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Option ${oIdx + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeOption(sIdx, qIdx, oIdx)
                                    }
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(sIdx, qIdx)}
                                className={styles.addOptBtn}
                              >
                                + Add Option
                              </button>
                            </div>
                            <div className={styles.inputGroup}>
                              <label>Explanation</label>
                              <AdminEditor
                                value={q.explanation}
                                onChange={(html) =>
                                  updateQuestion(
                                    sIdx,
                                    qIdx,
                                    "explanation",
                                    html
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuestion(sIdx)}
                        className={styles.addQBtn}
                      >
                        <Plus size={16} /> Add Question
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                <Save size={18} /> {loading ? "Creating..." : "Save Quiz"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDailyQuizPage;
