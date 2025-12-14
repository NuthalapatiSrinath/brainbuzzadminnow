import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./AdminPanelDropdown.module.css";
import { ChevronDown } from "lucide-react";

const AdminPanelDropdown = ({
  label, // Optional label above the dropdown
  options = [],
  selectedOption,
  onSelect,
  placeholder = "Select...",
  variant = "primary", // 'primary' or 'rich'
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  // Display logic: if selected, show label; else show placeholder
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption;

  return (
    <div
      className={`${styles.dropdownContainer} ${className}`}
      ref={dropdownRef}
    >
      {label && <label className={styles.label}>{label}</label>}

      <div
        className={`${styles.trigger} ${isOpen ? styles.open : ""} ${
          styles[variant]
        }`}
        onClick={handleToggle}
      >
        <span
          className={`${styles.text} ${
            isPlaceholder ? styles.placeholderText : ""
          }`}
        >
          {displayText}
        </span>
        <ChevronDown
          size={18}
          className={`${styles.icon} ${isOpen ? styles.rotate : ""}`}
        />
      </div>

      {isOpen && (
        <ul className={styles.menu}>
          {options.map((option, index) => (
            <li
              key={index}
              className={`${styles.menuItem} ${
                selectedOption?.value === option.value ? styles.selected : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

AdminPanelDropdown.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })
  ),
  selectedOption: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "rich"]),
  className: PropTypes.string,
};

export default AdminPanelDropdown;
