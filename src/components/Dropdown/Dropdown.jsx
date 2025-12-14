import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./Dropdown.module.css";

/**
 * Dropdown
 * Props:
 *  - label: string (trigger text)
 *  - items: array of { label, href } (if provided renders a menu)
 *  - href: string (if provided and no items, it will render as a plain anchor)
 *  - align: "left" | "center" | "right" (menu alignment relative to trigger)
 *  - id: optional id string for accessibility
 *  - className, buttonClassName, menuClassName: optional className additions
 *
 * Usage:
 *  <Dropdown label="Follow Us" items={[{label:'Twitter', href:'#'}]} />
 *  <Dropdown label="Home" href="/" />
 */
export default function Dropdown({
  label,
  items,
  href,
  align = "center",
  id,
  className = "",
  buttonClassName = "",
  menuClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const firstItemRef = useRef(null);

  // close on outside click / Escape
  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // focus first item when opened via keyboard (ArrowDown)
  useEffect(() => {
    if (open && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [open]);

  const toggle = () => setOpen((p) => !p);

  const onTriggerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      // focusing handled by effect
    }
  };

  const menuAlignClass =
    align === "left"
      ? styles.alignLeft
      : align === "right"
      ? styles.alignRight
      : styles.alignCenter;

  // If items not provided and href provided, render simple anchor (no menu)
  if ((!items || items.length === 0) && href) {
    return (
      <div className={`${styles.root} ${className}`} ref={rootRef}>
        <a href={href} className={`${styles.link} ${buttonClassName}`} id={id}>
          {label}
        </a>
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${className}`} ref={rootRef}>
      <button
        className={`${styles.trigger} ${buttonClassName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id || undefined}
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        type="button"
      >
        <span>{label}</span>
        <span className={styles.caret} aria-hidden />
      </button>

      <ul
        id={id}
        className={`${styles.menu} ${
          open ? styles.open : ""
        } ${menuAlignClass} ${menuClassName}`}
        role="menu"
        aria-hidden={!open}
      >
        {items &&
          items.map((it, idx) => (
            <li key={idx} role="none" className={styles.menuItemWrap}>
              <a
                href={it.href || "#"}
                role="menuitem"
                tabIndex={open ? 0 : -1}
                className={styles.menuItem}
                ref={idx === 0 ? firstItemRef : null}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
              >
                {it.label}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}

Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ),
  href: PropTypes.string,
  align: PropTypes.oneOf(["left", "center", "right"]),
  id: PropTypes.string,
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  menuClassName: PropTypes.string,
};
