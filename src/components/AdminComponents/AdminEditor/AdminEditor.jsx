import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
} from "lucide-react";
import styles from "./AdminEditor.module.css";

const AdminEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null); // Reference for hidden file input
  const [isFocused, setIsFocused] = useState(false);

  // Sync initial value (only if editor is empty or new value is different)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      if (!isFocused) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isFocused]);

  const handleInput = (e) => {
    const html = e.currentTarget.innerHTML;
    onChange(html);
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  // --- NEW: Handle System Image Upload ---
  const handleImageIconClick = () => {
    // Trigger the hidden file input click
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Insert image as Base64 directly into editor
        applyFormat("insertImage", event.target.result);
      };
      reader.readAsDataURL(file);
    }
    // Reset so same file can be selected again if needed
    e.target.value = "";
  };

  return (
    <div
      className={`${styles.editorWrapper} ${isFocused ? styles.focused : ""}`}
    >
      {/* Hidden Input for System Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* --- Toolbar --- */}
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => applyFormat("bold")}
          title="Bold"
          className={styles.toolBtn}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("italic")}
          title="Italic"
          className={styles.toolBtn}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("underline")}
          title="Underline"
          className={styles.toolBtn}
        >
          <Underline size={16} />
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={() => applyFormat("insertUnorderedList")}
          title="Bullet List"
          className={styles.toolBtn}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("insertOrderedList")}
          title="Numbered List"
          className={styles.toolBtn}
        >
          <ListOrdered size={16} />
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={() => applyFormat("justifyLeft")}
          title="Align Left"
          className={styles.toolBtn}
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("justifyCenter")}
          title="Align Center"
          className={styles.toolBtn}
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("justifyRight")}
          title="Align Right"
          className={styles.toolBtn}
        >
          <AlignRight size={16} />
        </button>

        <div className={styles.divider} />

        {/* IMAGE BUTTON - Triggers System Upload */}
        <button
          type="button"
          onClick={handleImageIconClick}
          title="Upload Image from Device"
          className={styles.toolBtn}
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* --- Editable Area --- */}
      <div
        className={styles.editorContent}
        contentEditable
        ref={editorRef}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default AdminEditor;
