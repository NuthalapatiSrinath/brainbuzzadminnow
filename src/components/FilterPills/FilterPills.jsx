import React from "react";
import styles from "./FilterPills.module.css";

/**
 * A component to render a row of filter "pills" (buttons).
 *
 * @param {object} props
 * @param {string[]} props.options - An array of strings for each pill label (e.g., ["All", "UPSC", "CGL"]).
 * @param {string} props.activePill - The label of the currently active pill.
 * @param {function(string): void} props.onSelectPill - Callback function when a pill is clicked.
 */
const FilterPills = ({ options = [], activePill, onSelectPill }) => {
  return (
    <nav
      className={styles.pillContainer}
      role="tablist"
      aria-label="Category Filters"
    >
      {options.map((option) => (
        <button
          key={option}
          className={`${styles.pillButton} ${
            activePill === option ? styles.active : ""
          }`}
          onClick={() => onSelectPill(option)}
          aria-selected={activePill === option}
          role="tab"
        >
          {option}
        </button>
      ))}
    </nav>
  );
};

export default FilterPills;
