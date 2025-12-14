// src/components/CategoryHomeCard/CategoryHomeCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./CategoryHomeCard.module.css";

const CategoryHomeCard = ({
  label,
  imageSrc,
  to,
  bgColor,
  className = "",
  onClick,
  hoverLabel, // <-- 1. ADD NEW PROP for the "View All" text
}) => {
  return (
    <Link
      to={to}
      // 2. Add 'hoverable' class only if 'hoverLabel' exists
      className={`${styles.card} ${className} ${
        hoverLabel ? styles.hoverable : ""
      }`}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      <div className={styles.imageWrapper}>
        <img src={imageSrc} alt={label} className={styles.image} />
      </div>
      <h3 className={styles.label}>{label}</h3>

      {/* --- 3. ADD NEW ELEMENT FOR THE HOVER CONTENT --- */}
      {hoverLabel && (
        <div className={styles.hoverContent}>
          <span className={styles.hoverLabel}>{hoverLabel}</span>
        </div>
      )}
    </Link>
  );
};

export default CategoryHomeCard;
