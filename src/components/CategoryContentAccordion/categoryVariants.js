export const CATEGORY_VARIANTS = {
  courses: {
    label: "Online Courses",
    searchPlaceholder: "Search Courses",
    addButtonText: "Add Course",

    columns: [
      { key: "name", label: "Course Name" },
      { key: "languages", label: "Languages Available" },
      { key: "validity", label: "Validity" },
      { key: "price", label: "Price" },
    ],
  },

  testSeries: {
    label: "Test Series",
    searchPlaceholder: "Search Test Series",
    addButtonText: "Add Test Series",

    columns: [
      { key: "name", label: "Test Series Name" },
      { key: "languages", label: "Languages Available" },
      { key: "tests", label: "No. of Tests" },
    ],
  },

  quizzes: {
    label: "Daily Quizzes",
    searchPlaceholder: "Search Quizzes",
    addButtonText: "Add Quiz",

    columns: [
      { key: "name", label: "Quiz Name" },
      { key: "language", label: "Language" },
      { key: "questions", label: "No. of Questions" },
    ],
  },
  currentAffairs: {
    searchPlaceholder: "Search Current Affairs...",
    addButtonText: "+ Add Current Affair",
    columns: [
      { label: "Type", key: "categoryType", width: "15%" }, // Distinct width
      { label: "Title", key: "title", width: "35%" }, // Wider for title
      { label: "Date", key: "date", width: "15%" },
      { label: "Language", key: "language", width: "15%" },
      // Action column is auto-added as fixed 80px in the component
    ],
  },
  ebooks: {
    label: "E-books",
    searchPlaceholder: "Search E-books",
    addButtonText: "Add E-book",

    columns: [
      { key: "name", label: "Book Name" },
      { key: "language", label: "Language" },
      { key: "pages", label: "Pages" },
      { key: "price", label: "Price" },
    ],
  },

  publications: {
    columns: [
      { key: "title", label: "Title" },
      { key: "price", label: "Price" },
      { key: "language", label: "Language" },
      { key: "date", label: "Date" },
      { key: "action", label: "Action" },
    ],
  },
  liveClasses: {
    label: "Live Classes",
    searchPlaceholder: "Search Live Classes",
    addButtonText: "Add Live Class",

    columns: [
      { key: "title", label: "Class Title" },
      { key: "faculty", label: "Faculty" },
      { key: "schedule", label: "Schedule" },
    ],
  },

  previousPapers: {
    label: "Previous Question Papers",
    searchPlaceholder: "Search Question Papers",
    addButtonText: "Add Question Paper",

    columns: [
      { key: "exam", label: "Exam" },
      { key: "year", label: "Year" },
      { key: "language", label: "Language" },
    ],
  },
};
