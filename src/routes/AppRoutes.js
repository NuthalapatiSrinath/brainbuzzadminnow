import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import HomePage from "../pages/HomePage/HomePage";

// --- ADMIN IMPORTS ---
import AdminMainPage from "../pages/Admin/AdminMainPage/AdminMainPage";
import AdminOnlineCoursesPage from "../pages/Admin/AdminOnlineCoursesPage/AdminOnlineCoursesPage";
import AdminTestSeriesPage from "../pages/Admin/AdminTestSeriesPage/AdminTestSeriesPage";
import AdminDailyQuizPage from "../pages/Admin/AdminDailyQuizPage/AdminDailyQuizPage";
import AdminCurrentAffairsPage from "../pages/Admin/AdminCurrentAffairsPage/AdminCurrentAffairsPage";
import AdminEBooksPage from "../pages/Admin/AdminEBooksPage/AdminEBooksPage";
import AdminPublicationPage from "../pages/Admin/AdminPublicationPage/AdminPublicationPage";
import AdminPreviousPaperPage from "../pages/Admin/AdminPreviousPaperPage/AdminPreviousPaperPage";

// --- Placeholder Component ---
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
    <h2>{title}</h2>
    <p>This form/page is under development.</p>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Parent Route: The Layout */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Child Route: The HomePage */}
          <Route index element={<HomePage />} />

          {/* --- ADMIN CONTENT ROUTES --- */}
          {/* Parent Path: /admin/content */}
          <Route path="/admin/content" element={<AdminMainPage />}>
            {/* Default: Redirect to the first Add option */}
            <Route
              index
              element={<Navigate to="add/online-course" replace />}
            />

            {/* ======================================================== */}
            {/* 1. ADD ROUTES (Relative Paths - NO leading slash)        */}
            {/* Result: /admin/content/add/online-course                 */}
            {/* ======================================================== */}
            <Route
              path="add/online-course"
              element={<AdminOnlineCoursesPage />}
            />
            <Route path="add/test-series" element={<AdminTestSeriesPage />} />
            <Route path="add/daily-quiz" element={<AdminDailyQuizPage />} />
            <Route
              path="add/current-affairs"
              element={<AdminCurrentAffairsPage />}
            />
            <Route path="add/e-book" element={<AdminEBooksPage />} />
            <Route path="add/publication" element={<AdminPublicationPage />} />
            <Route
              path="add/previous-paper"
              element={<AdminPreviousPaperPage />}
            />

            {/* Placeholders for future pages */}
            <Route
              path="add/live-class"
              element={<PlaceholderPage title="Add Live Class" />}
            />
            <Route
              path="add/banner"
              element={<PlaceholderPage title="Add Banner" />}
            />

            {/* ======================================================== */}
            {/* 2. UPDATE ROUTES (Relative Paths - NO leading slash)     */}
            {/* Result: /admin/content/update/online-courses             */}
            {/* ======================================================== */}
            <Route
              path="update/online-courses"
              element={<AdminOnlineCoursesPage />}
            />
            <Route
              path="update/test-series"
              element={<AdminTestSeriesPage />}
            />
            <Route
              path="update/daily-quizzes"
              element={<AdminDailyQuizPage />}
            />
            <Route
              path="update/current-affairs"
              element={<AdminCurrentAffairsPage />}
            />
            <Route path="update/e-books" element={<AdminEBooksPage />} />
            <Route
              path="update/publications"
              element={<AdminPublicationPage />}
            />
            <Route
              path="update/previous-papers"
              element={<AdminPreviousPaperPage />}
            />

            <Route
              path="update/live-classes"
              element={<PlaceholderPage title="Update Live Classes" />}
            />
            <Route
              path="update/banners"
              element={<PlaceholderPage title="Update Banners" />}
            />
          </Route>
          {/* --- END ADMIN ROUTES --- */}
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  );
}
