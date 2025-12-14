import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyTestSeries.module.css";
// Import TestSeriesCard instead of CourseCard
import TestSeriesCard from "../../../../components/TestSeriesCard/TestSeriesCard";
// Import main Test Series data
import TEST_SERIES_LIST_DATA from "../../../../data/testSeries.js";
// Import list of purchased test series categories
import { purchasedTestSeries } from "../../../../data/userTestSeries.js";

// --- Helper function to simulate fetching purchased Test Series packages ---
const getMyTestSeriesData = () => {
  const myTestSeries = [];

  // Iterate over the purchased category keys (e.g., "upsc", "ssc_cgl")
  purchasedTestSeries.forEach((categoryKey) => {
    // Check if the data exists for this category
    const packageData = TEST_SERIES_LIST_DATA[categoryKey];

    if (packageData) {
      // 🎯 We treat the entire package as the "course" in My Test Series view.
      // This uses the hero data as the main card information.
      const hero = packageData.hero;

      // Calculate total progress (A simple average/sum could be used here)
      // For simplicity, we'll assign a fixed progress for mock data.
      const totalTests = packageData.tests.length;
      const completedTests = Math.floor(
        totalTests * (categoryKey === "upsc" ? 0.4 : 0.8)
      ); // Mock progress
      const progress =
        totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;

      myTestSeries.push({
        id: categoryKey, // Use category key as the ID for routing
        category: categoryKey,
        title: hero.title,
        subtitle: hero.subtitle || "Complete Test Series Package",
        mainTitle: hero.title + " Test Series",
        batchStartDate: "Available Now",
        isLive: true,
        medium: "Bilingual",
        mediumIconText: "HIN + ENG",
        validity: "1 Year",
        testCount: totalTests,
        progress: progress,
        variant: "user", // Use the 'user' variant for progress bar
      });
    }
  });

  return myTestSeries;
};

export default function MyTestSeries() {
  const navigate = useNavigate();
  // Fetch the list of test series packages for the current user
  const myTestSeriesData = useMemo(() => getMyTestSeriesData(), []);

  // Function to handle navigation when the TestSeriesCard is clicked or "Go to Tests" is hit
  const handleStartTestSeries = (testSeriesId) => {
    // Navigate to the main description page for that series, defaulting to the 'tests' tab
    navigate(`/test-series/${testSeriesId}`);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* === Text Heading === */}
        <div className={styles.headingWrapper}>
          <div className={styles.headingline}>
            <h2 className={styles.heading}>My Test Series</h2>
            <div className={styles.headingUnderline}></div>
          </div>
          <p className={styles.subtitle}>
            Continue your test preparation and track your progress in your
            enrolled test packages.
          </p>
        </div>

        {/* === Test Series Grid === */}
        <div className={styles.gridContainer}>
          {myTestSeriesData.length > 0 ? (
            myTestSeriesData.map((testSeries) => (
              <TestSeriesCard
                key={testSeries.id}
                {...testSeries}
                // The main card click and the action button will go to the same place
                onStartTestSeries={() => handleStartTestSeries(testSeries.id)}
                onClick={() => handleStartTestSeries(testSeries.id)}
              />
            ))
          ) : (
            <p className={styles.noCoursesMessage}>
              You have not enrolled in any test series yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
