import React, { useState } from "react";
import { useDispatch } from "react-redux";
// import { AiOutlinePlus, AiOutlineArrowLeft } from "react-icons/ai";

// Components
import CategoryColumn from "../../../components/AdminComponents/CategoryColumn/CategoryColumn";
// Ensure you have created the AdminEditor folder and file as per previous step
import AdminEditor from "../../../components/AdminComponents/AdminEditor/AdminEditor";
import styles from "./AdminOnlineCoursesPage.module.css";

const AdminOnlineCoursesPage = ({ categories }) => {
  const dispatch = useDispatch();

  // --- View State Management ---
  // 'list' = show columns, 'add' = show blank editor, 'edit' = show filled editor
  const [viewMode, setViewMode] = useState("list");
  const [editingData, setEditingData] = useState(null);

  // --- Demo Data (Preserving your original structure) ---
  const demoCategories = [
    {
      id: "cat-left",
      name: "",
      subcategories: [],
      special: "leftOnly", // Keeps the "Add Sub Category" link column
    },
    {
      id: "cat-upsc",
      name: "UPSC",
      subcategories: [
        { id: "upsc-1", name: "Group 1" },
        { id: "upsc-2", name: "Group 2" },
        { id: "upsc-3", name: "Group 3" },
        { id: "upsc-4", name: "Group 4" },
      ],
    },
    {
      id: "cat-appsc",
      name: "APPSC",
      subcategories: [
        { id: "appsc-1", name: "Group 1" },
        { id: "appsc-2", name: "Group 2" },
        { id: "appsc-3", name: "Group 3" },
        { id: "appsc-4", name: "Group 4" },
      ],
    },
    {
      id: "cat-tspsc",
      name: "TSPSC",
      subcategories: [
        { id: "tspsc-1", name: "Group 1" },
        { id: "tspsc-2", name: "Group 2" },
        { id: "tspsc-3", name: "Group 3" },
        { id: "tspsc-4", name: "Group 4" },
      ],
    },
    {
      id: "cat-police",
      name: "Police",
      subcategories: [
        { id: "pol-1", name: "AP SI" },
        { id: "pol-2", name: "AP Constable" },
      ],
    },
    {
      id: "cat-ssc",
      name: "SSC",
      subcategories: [
        { id: "ssc-1", name: "CGL" },
        { id: "ssc-2", name: "CHSL" },
      ],
    },
  ];

  const list =
    Array.isArray(categories) && categories.length
      ? categories
      : demoCategories;

  // --- Handlers ---

  const handleAddNew = () => {
    setEditingData(null); // Clear data for new entry
    setViewMode("add");
  };

  const handleEditItem = (item) => {
    // Map your existing item data to the AdminEditor fields
    // This example assumes 'item' has a name property
    setEditingData({
      ...item,
      title: item.name,
      // You can pre-fill other fields here if your data has them:
      // price: item.price,
      // discount: item.discount,
    });
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingData(null);
  };

  const handleSaveContent = (data) => {
    console.log("Saving Content:", data);
    // TODO: Dispatch your Redux action here (e.g., CREATE_COURSE or UPDATE_COURSE)
    handleBackToList();
  };

  // --- RENDER ---

  // 1. Editor View (Used for both Add and Edit)
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className={styles.pageWrap}>
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#6b7280",
            fontSize: "1rem",
            fontWeight: "500",
          }}
        >
          Back to Categories
        </button>

        {/* The Enriched Admin Editor */}
        <AdminEditor
          title={viewMode === "add" ? "Add New Course" : "Edit Course Details"}
          initialData={editingData}
          onSave={handleSaveContent}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  // 2. List View (Default Category Columns)
  return (
    <div className={styles.pageWrap}>
      <div className={styles.box}>
        <div className={styles.gridWrap}>
          {list.map((cat) => (
            <div key={cat.id} className={styles.columnSlot}>
              {/* Special left column rendering */}
              {cat.special === "leftOnly" ? (
                <div className={styles.leftOnly}>
                  <button
                    className={styles.leftAdd}
                    onClick={() =>
                      dispatch({ type: "ADD_SUB_SPECIAL", payload: cat })
                    }
                  >
                    + Add Sub Category
                  </button>
                </div>
              ) : (
                <CategoryColumn
                  category={cat}
                  // Clicking the item name opens the modal as before
                  onOpen={(it) => dispatch({ type: "OPEN_MODAL", payload: it })}
                  // Plus button adds sub category
                  onAddSub={(c) =>
                    dispatch({ type: "SHOW_ADD_SUB", payload: c })
                  }
                  // EDIT BUTTON: Now opens the new AdminEditor
                  onEdit={(it) => handleEditItem(it)}
                  // DELETE BUTTON: Keep existing delete logic
                  onDelete={(it) =>
                    dispatch({ type: "DELETE_ITEM", payload: it })
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer Row to Add New Top-Level Category or Course */}
        <div className={styles.footerRow}>
          <button className={styles.addCategoryBtn} onClick={handleAddNew}>
            {/* <AiOutlinePlus className={styles.plusIcon} /> */}
            Add New Course / Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOnlineCoursesPage;
