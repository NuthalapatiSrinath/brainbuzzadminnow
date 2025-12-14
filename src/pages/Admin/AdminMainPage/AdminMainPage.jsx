import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import FilterPills from "../../../components/FilterPills/FilterPills";
import AdminPanelDropdown from "../../../components/AdminComponents/AdminPanelDropdown/AdminPanelDropdown";
import AdminDateDropdown from "../../../components/AdminComponents/AdminDateDropdown/AdminDateDropdown";
import styles from "./AdminMainPage.module.css";

export default function AdminMainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. Configuration for the 9 Tabs ---
  const allTabs = [
    { label: "Add Content", path: "add", isAddTab: true },
    { label: "Update Online Courses", path: "update/online-courses" },
    { label: "Update Test Series", path: "update/test-series" },
    { label: "Update Daily Quizzes", path: "update/daily-quizzes" },
    { label: "Update Current Affairs", path: "update/current-affairs" },
    { label: "Update Publications", path: "update/publications" },
    { label: "Update Previous Papers", path: "update/previous-papers" },
    { label: "Update Live Classes", path: "update/live-classes" },
    { label: "Update Banners", path: "update/banners" },
  ];

  // --- 2. Content Options ---
  const contentOptions = [
    { label: "Online Course", value: "online-course" },
    { label: "Test Series", value: "test-series" },
    { label: "Daily Quiz", value: "daily-quiz" },
    { label: "Current Affairs Article", value: "current-affairs" },
    { label: "Publication/Book", value: "publication" },
    { label: "Previous Year Paper", value: "previous-paper" },
  ];

  // --- State ---
  const [activeTabLabel, setActiveTabLabel] = useState("Add Content");
  // Initialize with YYYY-MM-DD format for the input[type="date"] to work correctly
  const [selectedDate, setSelectedDate] = useState("2025-09-25");
  const [selectedContent, setSelectedContent] = useState(contentOptions[0]);

  // --- Handlers ---
  const handlePillSelect = (label) => {
    const tab = allTabs.find((t) => t.label === label);
    if (tab) {
      setActiveTabLabel(label);
      if (tab.isAddTab) {
        navigate(`/admin/content/add/${selectedContent.value}`);
      } else {
        navigate(`/admin/content/${tab.path}`);
      }
    }
  };

  const handleContentSelect = (option) => {
    setSelectedContent(option);
    navigate(`/admin/content/add/${option.value}`);
  };

  // --- Sync UI with URL ---
  useEffect(() => {
    const path = location.pathname;
    const matchingTab = allTabs.find(
      (t) => !t.isAddTab && path.includes(t.path)
    );

    if (matchingTab) {
      setActiveTabLabel(matchingTab.label);
    } else if (path.includes("/add/")) {
      setActiveTabLabel("Add Content");
      const typeSlug = path.split("/add/")[1];
      const matchedContent = contentOptions.find((c) => c.value === typeSlug);
      if (matchedContent) {
        setSelectedContent(matchedContent);
      }
    }
  }, [location.pathname]);

  const isAddTabActive = activeTabLabel === "Add Content";

  return (
    <div className={styles.pageWrapper}>
      {/* --- FIXED HEADER --- */}
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Add / Update Content</h1>

        {/* Pills Row */}
        <div className={styles.pillsRow}>
          <FilterPills
            options={allTabs.map((t) => t.label)}
            activePill={activeTabLabel}
            onSelectPill={handlePillSelect}
          />
        </div>

        {/* Action Bar (Visible only for Add Content) */}
        {isAddTabActive && (
          <div className={styles.actionBar}>
            {/* LEFT: Select Content Dropdown (Rich Variant) */}
            <div className={styles.leftAction}>
              <div style={{ minWidth: "220px" }}>
                <AdminPanelDropdown
                  label="Select Content Category"
                  options={contentOptions}
                  selectedOption={selectedContent}
                  onSelect={handleContentSelect}
                  variant="rich" // Rich UI style
                  placeholder="Select Content Type"
                />
              </div>
            </div>

            {/* RIGHT: Select Date Dropdown (Rich Variant) */}
            <div className={styles.rightAction}>
              <div style={{ minWidth: "180px" }}>
                <AdminDateDropdown
                  label="Select Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  variant="rich"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div className={styles.contentArea}>
        <Outlet />
      </div>
    </div>
  );
}
