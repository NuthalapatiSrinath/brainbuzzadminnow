import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import HomePage from "../pages/HomePage/HomePage";
// --- ADMIN IMPORTS ---
import AdminMainPage from "../pages/Admin/AdminMainPage/AdminMainPage";
import AdminOnlineCoursesPage from "../pages/Admin/AdminOnlineCoursesPage/AdminOnlineCoursesPage";

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
          <Route path="/admin/content" element={<AdminMainPage />}>
            {/* ADD ROUTES */}
            <Route index element={<AdminOnlineCoursesPage />} />
            <Route
              path="add/online-course"
              element={<AdminOnlineCoursesPage />}
            />
            <Route
              path="add/test-series"
              element={<PlaceholderPage title="Add Test Series" />}
            />
            <Route
              path="add/daily-quiz"
              element={<PlaceholderPage title="Add Daily Quiz" />}
            />
            <Route
              path="add/current-affairs"
              element={<PlaceholderPage title="Add Current Affairs" />}
            />
            <Route
              path="add/publication"
              element={<PlaceholderPage title="Add Publication" />}
            />
            <Route
              path="add/previous-paper"
              element={<PlaceholderPage title="Add Previous Paper" />}
            />

            {/* UPDATE ROUTES */}
            <Route
              path="update/online-courses"
              element={<PlaceholderPage title="Update Online Courses" />}
            />
            <Route
              path="update/test-series"
              element={<PlaceholderPage title="Update Test Series" />}
            />
            <Route
              path="update/daily-quizzes"
              element={<PlaceholderPage title="Update Daily Quizzes" />}
            />
            <Route
              path="update/current-affairs"
              element={<PlaceholderPage title="Update Current Affairs" />}
            />
            <Route
              path="update/publications"
              element={<PlaceholderPage title="Update Publications" />}
            />
            <Route
              path="update/previous-papers"
              element={<PlaceholderPage title="Update Previous Papers" />}
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
          <Route index element={<HomePage />} />

          {/* <Route path="about" element={<AboutPage />} />
          <Route path="treatments" element={<TreatmentsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="contact" element={<ContactUsPage />} />

         
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="blogs/:id" element={<BlogDetailsPage />} /> */}
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  );
}
