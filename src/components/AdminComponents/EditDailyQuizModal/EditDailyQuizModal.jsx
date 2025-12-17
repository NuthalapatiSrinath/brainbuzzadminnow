import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
} from "lucide-react";
import * as dailyQuizService from "../../../api/services/adminDailyQuizService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";
import AdminEditor from "../AdminEditor/AdminEditor";
import styles from "./EditDailyQuizModal.module.css";

const EditDailyQuizModal = ({ isOpen, quiz, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  /* ---------------- FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    name: "",
    examDate: "",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
    instructions: "",
    isActive: true,
  });

  const [sections, setSections] = useState([]);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!isOpen || !quiz) return;

    // Populate dropdowns
    Promise.all([
      categoryService.getAllCategories("DAILY_QUIZ"),
      subCategoryService.getAllSubCategories(null, "DAILY_QUIZ"),
    ]).then(([c, s]) => {
      setCategories(c.data || []);
      setSubCategories(s.data || []);
    });

    // Populate form
    setFormData({
      name: quiz.title || quiz.name || "", // Check both keys just in case
      examDate: quiz.examDate ? quiz.examDate.split("T")[0] : "",
      categoryIds: Array.isArray(quiz.categories)
        ? quiz.categories.map((c) => c._id || c)
        : [],
      subCategoryIds: Array.isArray(quiz.subCategories)
        ? quiz.subCategories.map((s) => s._id || s)
        : [],
      languageIds: Array.isArray(quiz.languages)
        ? quiz.languages.map((l) => l._id || l)
        : [],
      instructions: quiz.instructions || "",
      isActive: quiz.isActive ?? true,
    });

    // Populate sections & questions
    setSections(
      (quiz.sections || []).map((sec) => ({
        title: sec.title,
        order: sec.order,
        collapsed: false,
        questions: sec.questions.map((q) => ({
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          options: q.options || ["", "", "", ""],
          correctOptionIndex: Number(q.correctOptionIndex) || 0,
          explanation: q.explanation || "",
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks || 0,
        })),
      }))
    );
  }, [isOpen, quiz]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, (o) => o.value);
    setFormData({ ...formData, [e.target.name]: values });
  };

  /* -------- Section / Question handlers -------- */
  const addSection = () =>
    setSections([
      ...sections,
      {
        title: "New Section",
        order: sections.length + 1,
        collapsed: false,
        questions: [],
      },
    ]);

  const toggleSection = (idx) => {
    const updated = [...sections];
    updated[idx].collapsed = !updated[idx].collapsed;
    setSections(updated);
  };

  const deleteSection = (idx) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const addQuestion = (sIdx) => {
    const updated = [...sections];
    updated[sIdx].questions.push({
      questionNumber: updated[sIdx].questions.length + 1,
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
      marks: 1,
      negativeMarks: 0,
    });
    setSections(updated);
  };

  const removeQuestion = (sIdx, qIdx) => {
    const updated = [...sections];
    updated[sIdx].questions = updated[sIdx].questions.filter(
      (_, i) => i !== qIdx
    );
    setSections(updated);
  };

  const updateQuestion = (sIdx, qIdx, field, value) => {
    const updated = [...sections];
    updated[sIdx].questions[qIdx][field] = value;
    setSections(updated);
  };

  // --- NEW: Set Correct Option Handler ---
  const setCorrectOption = (sIdx, qIdx, oIdx) => {
    const updated = [...sections];
    updated[sIdx].questions[qIdx].correctOptionIndex = oIdx;
    setSections(updated);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        title: formData.name, // Send both to be safe
        examDate: formData.examDate,
        categoryIds: formData.categoryIds,
        subCategoryIds: formData.subCategoryIds,
        languageIds: formData.languageIds,
        instructions: formData.instructions,
        isActive: formData.isActive,
        sections: sections.map((sec) => ({
          title: sec.title,
          order: Number(sec.order),
          questions: sec.questions.map((q) => ({
            questionText: q.questionText,
            questionType: "MCQ",
            options: q.options,
            correctOptionIndex: Number(q.correctOptionIndex),
            explanation: q.explanation,
            marks: Number(q.marks),
            negativeMarks: Number(q.negativeMarks),
          })),
        })),
      };

      // Wrap in 'quiz' key if your backend requires it like create
      // For updates, typically it's just the object, but if your backend controller for update
      // also looks for req.body.quiz, use { quiz: payload }
      await dailyQuizService.updateQuiz(quiz._id, { quiz: payload });

      alert("Quiz updated successfully");
      onClose(true);
    } catch (err) {
      console.error(err);
      alert("Update failed: " + (err.response?.data?.message || err.message));
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
          <h2>Edit Quiz: {quiz?.title || quiz?.name}</h2>
          <button onClick={() => onClose(false)} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {/* 1. BASIC DETAILS */}
          <div className={styles.section}>
            <h3>Basic Details</h3>
            <div className={styles.gridRow}>
              <div className={styles.inputGroup}>
                <label>Quiz Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.inputGroup}>
                <label>Categories</label>
                <select
                  multiple
                  name="categoryIds"
                  value={formData.categoryIds}
                  onChange={handleMultiSelect}
                  className={styles.multiSelect}
                >
                  {categories.map((c) => (
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
                  value={formData.subCategoryIds}
                  onChange={handleMultiSelect}
                  className={styles.multiSelect}
                >
                  {subCategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Instructions</label>
              <AdminEditor
                value={formData.instructions}
                onChange={(v) => setFormData({ ...formData, instructions: v })}
              />
            </div>
          </div>

          {/* 2. SECTIONS & QUESTIONS */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Questions</h3>
              <button
                type="button"
                onClick={addSection}
                className={styles.addBtn}
              >
                <Plus size={16} /> Add Section
              </button>
            </div>

            {sections.map((sec, sIdx) => (
              <div key={sIdx} className={styles.sectionCard}>
                {/* Section Header */}
                <div
                  className={styles.cardHeader}
                  onClick={() => toggleSection(sIdx)}
                >
                  <div className={styles.headerTitle}>
                    {sec.collapsed ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronUp size={18} />
                    )}
                    <span>
                      {sec.title} ({sec.questions.length} Qs)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(sIdx);
                    }}
                    className={styles.iconBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Section Body */}
                {!sec.collapsed && (
                  <div className={styles.cardBody}>
                    <div className={styles.inputGroup}>
                      <label>Section Title</label>
                      <input
                        value={sec.title}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[sIdx].title = e.target.value;
                          setSections(updated);
                        }}
                      />
                    </div>

                    {/* Questions Loop */}
                    {sec.questions.map((q, qIdx) => (
                      <div key={qIdx} className={styles.questionBlock}>
                        <div className={styles.qHeader}>
                          <span className={styles.badge}>Q{qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(sIdx, qIdx)}
                            className={styles.textBtnRed}
                          >
                            Remove
                          </button>
                        </div>

                        <textarea
                          className={styles.questionText}
                          value={q.questionText}
                          onChange={(e) =>
                            updateQuestion(
                              sIdx,
                              qIdx,
                              "questionText",
                              e.target.value
                            )
                          }
                          placeholder="Enter Question Text..."
                          rows={2}
                        />

                        {/* OPTIONS */}
                        <div className={styles.optionsGrid}>
                          <label className={styles.fullWidthLabel}>
                            Options (Select Correct)
                          </label>
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`${styles.optionRow} ${
                                q.correctOptionIndex === oIdx
                                  ? styles.correctRow
                                  : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${sIdx}-${qIdx}`} // Group per question
                                checked={q.correctOptionIndex === oIdx}
                                onChange={() =>
                                  setCorrectOption(sIdx, qIdx, oIdx)
                                }
                                className={styles.radioInput}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updatedOpts = [...q.options];
                                  updatedOpts[oIdx] = e.target.value;
                                  updateQuestion(
                                    sIdx,
                                    qIdx,
                                    "options",
                                    updatedOpts
                                  );
                                }}
                                placeholder={`Option ${oIdx + 1}`}
                                className={styles.optionInput}
                              />
                              {q.correctOptionIndex === oIdx && (
                                <CheckCircle
                                  size={16}
                                  className={styles.checkIcon}
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className={styles.gridRowSmall}>
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

                        <div className={styles.inputGroup}>
                          <label>Explanation</label>
                          <AdminEditor
                            value={q.explanation}
                            onChange={(val) =>
                              updateQuestion(sIdx, qIdx, "explanation", val)
                            }
                            placeholder="Explanation..."
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addQuestion(sIdx)}
                      className={styles.addQBtn}
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => onClose(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.saveBtn}>
              <Save size={18} /> {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDailyQuizModal;
