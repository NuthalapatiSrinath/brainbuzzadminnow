// src/components/Topbar/TopbarPanel.jsx
import React from "react";
import panelStyles from "./TopbarPanel.module.css";

/**
 * TopbarPanel
 * props:
 *  - type: 'current' | 'quizzes' (unused visually now, kept for clarity)
 *  - items: array of { label, href, icon? }
 *  - onClose: function to close panel
 *
 * Shows up to 16 items in 8 columns x 2 rows. Uses `icon` if provided.
 */
export default function TopbarPanel({ type, items = [], onClose }) {
  // show up to 16 items (8x2 grid)
  const visible = Array.isArray(items) ? items.slice(0, 16) : [];
  const placeholdersCount = Math.max(0, 16 - visible.length);

  return (
    <div
      className={panelStyles.panelWrap}
      role="dialog"
      aria-label={
        type === "current" ? "Current Affairs panel" : "Daily Quizzes panel"
      }
    >
      <div className={panelStyles.panelInner}>
        <div className={panelStyles.headerRow}>
          {/* Empty left area (no title as requested) */}
          <div />
          {/* Close button on the right */}
          <button
            aria-label="Close panel"
            className={panelStyles.closeBtn}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className={panelStyles.itemsGrid}>
          {visible.map((it, idx) => (
            <a key={idx} href={it.href} className={panelStyles.item}>
              {it.icon ? (
                <img
                  src={it.icon}
                  alt={it.label}
                  className={panelStyles.itemIcon}
                  onError={(e) => {
                    // hide broken image and fall back to label
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}

              {/* show label either below image or as only content when no image */}
              <div className={panelStyles.itemLabel}>{it.label}</div>
            </a>
          ))}

          {/* placeholders to keep layout balanced */}
          {Array.from({ length: placeholdersCount }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className={`${panelStyles.item} ${panelStyles.itemEmpty}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
