import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyCoursesPage.module.css";
import CourseCard from "../../../../components/CourseCard/CourseCard";
// Import the central data structure and the user's purchased IDs
import { ONLINE_COURSES_SUBCATEGORIES } from "../../../../data/onlineCourses.js";
import {
  purchasedCourseIds,
  getCourseProgress,
} from "../../../../data/userCourses.js";

// --- Helper function to mimic fetching purchased courses ---
const getMyCoursesData = () => {
  // Use the list of purchased IDs to build the full data list
  const myCourses = [];

  // Iterate over the purchased course IDs
  purchasedCourseIds.forEach((courseId) => {
    // We need to iterate through all subcategories to find the matching course data
    for (const categoryKey in ONLINE_COURSES_SUBCATEGORIES) {
      const subcategories = ONLINE_COURSES_SUBCATEGORIES[categoryKey];

      for (const subcategoryObj of subcategories) {
        const courseDetails = subcategoryObj.courses.find(
          (course) => course.id === courseId
        );

        if (courseDetails) {
          // Combine base course details with user-specific progress/routing info
          myCourses.push({
            ...courseDetails, // Spreads all original course props (title, dates, etc.)
            id: courseId, // Ensure ID is explicit
            category: categoryKey, // Add category for routing
            subcategory: subcategoryObj.id, // Add subcategory for routing
            progress: getCourseProgress(courseId), // Get user's current progress
            variant: "user", // Explicitly setting the variant for clarity
          });
          return; // Move to the next purchased course ID once found
        }
      }
    }
  });

  return myCourses;
};

export default function MyCoursesPage() {
  const navigate = useNavigate();
  // Fetch the list of courses for the current user
  const myCoursesData = getMyCoursesData();

  // Function to handle the navigation when a CourseCard is clicked
  const handleCardClick = (course) => {
    // Construct the dynamic path: /online-courses/:category/:subcategory/:id
    const coursePath = `/online-courses/${course.category}/${course.subcategory}/${course.id}`;
    navigate(coursePath);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* === Text Heading === */}
        <div className={styles.headingWrapper}>
          <div className={styles.headingline}>
            <h2 className={styles.heading}>My Courses</h2>
            <div className={styles.headingUnderline}></div>
          </div>
          <p className={styles.subtitle}>
            Explore our carefully curated courses and unlock valuable knowledge
            that empowers your personal and professional growth
          </p>
        </div>

        {/* === Courses Grid === */}
        <div className={styles.gridContainer}>
          {myCoursesData.length > 0 ? (
            myCoursesData.map((course) => (
              <CourseCard
                key={course.id} // Use the unique ID as the key
                {...course} // Spread all course props (including dynamic progress and category/subcategory)
                // Override the default onClick to handle navigation
                onClick={() => handleCardClick(course)}
              />
            ))
          ) : (
            <p className={styles.noCoursesMessage}>
              You have not enrolled in any courses yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
