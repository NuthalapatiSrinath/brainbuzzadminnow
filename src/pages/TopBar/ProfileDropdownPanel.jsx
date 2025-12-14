import React from "react";
import styles from "./ProfileDropdownPanel.module.css";
import CategoryHomeCard from "../../components/CategoryHomeCard/CategoryHomeCard";

// Data updated to match the six specific items in the image
const profileCardData = [
  {
    label: "My Courses",
    imageSrc: "/images/aboutus/icons/live-class.png",
    to: "/mycourses",
    bgColor: "var(--Utility_Color2)", // Assuming standard project color variables
  },
  {
    label: "My Test Series",
    imageSrc: "/images/aboutus/icons/test-series.png",
    to: "/mytestseries",
    bgColor: "var(--Utility_Color3)",
  },
  {
    label: "My E-books",
    imageSrc: "/images/aboutus/icons/question-paper.png",
    to: "/myebooks",
    bgColor: "#e3f2fd",
  },
  {
    label: "My Orders",
    imageSrc: "/images/aboutus/icons/online-courses.png", // Reusing a sensible icon
    to: "/myorders", // Assuming a new route for orders
    bgColor: "#fff5e3", // Light Orange/Yellow
  },
  {
    label: "About Us",
    imageSrc: "/images/aboutus/icons/current-affairs.png",
    to: "/aboutus",
    bgColor: "#f0e3ff", // Light Purple
  },
  {
    label: "Contact Us",
    imageSrc: "/images/aboutus/icons/quiz.png",
    to: "/contactus",
    bgColor: "#dff7e6", // Light Green
  },
];

// Simple icon for the header
const UserIcon = () => (
  <svg className={styles.userIconSvg} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const ProfileDropdownPanel = ({ user, onLogout, onClose }) => {
  if (!user) return null;

  return (
    <div className={styles.profilePanel}>
      {/* Header (My Profile info) */}
      <div className={styles.profileHeader}>
        <div className={styles.userIconLarge}>
          <UserIcon />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name || "User"}</span>
          <span className={styles.userEmail}>
            {user.email || "user@example.com"}
          </span>
        </div>
      </div>

      {/* Grid for 6 Navigation Items */}
      <div className={styles.profileRow}>
        {profileCardData.map((card) => (
          <CategoryHomeCard
            key={card.label}
            label={card.label}
            imageSrc={card.imageSrc}
            to={card.to}
            bgColor={card.bgColor}
            className={styles.smallCard}
            onClick={onClose}
          />
        ))}
      </div>

      {/* Footer: Logout Button */}
      <div className={styles.profileFooter}>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdownPanel;
