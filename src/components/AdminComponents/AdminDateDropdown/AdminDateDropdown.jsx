import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Calendar } from "lucide-react";
import styles from "./AdminDateDropdown.module.css";

const AdminDateDropdown = ({
  label,
  value,
  onChange,
  variant = "primary", // 'primary' or 'rich' to match other dropdowns
  className = "",
}) => {
  const dateInputRef = useRef(null);

  // Get today's date in YYYY-MM-DD format for the 'min' attribute
  const today = new Date().toISOString().split("T")[0];

  // Handler for date change
  const handleDateChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Format the display date (e.g., "2025-09-25" -> "25 Sep 2025")
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "Select Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Trigger focus on the hidden input when the container is clicked
  const handleContainerClick = () => {
    if (dateInputRef.current) {
      if (dateInputRef.current.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}

      <div
        className={`${styles.wrapper} ${styles[variant]}`}
        onClick={handleContainerClick}
      >
        {/* The visual part that looks like a dropdown */}
        <div className={styles.displayArea}>
          <span
            className={`${styles.dateText} ${!value ? styles.placeholder : ""}`}
          >
            {formatDateDisplay(value)}
          </span>
          <Calendar className={styles.icon} size={18} />
        </div>

        {/* The hidden native input that triggers the calendar */}
        <input
          ref={dateInputRef}
          type="date"
          min={today} // Restricts to future dates
          value={value || ""}
          onChange={handleDateChange}
          className={styles.hiddenInput}
        />
      </div>
    </div>
  );
};

AdminDateDropdown.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string, // Expects YYYY-MM-DD
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "rich"]),
  className: PropTypes.string,
};

export default AdminDateDropdown;
