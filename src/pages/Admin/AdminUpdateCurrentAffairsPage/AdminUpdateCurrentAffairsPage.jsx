import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CategoryContentAccordion from "../../../components/CategoryContentAccordion/CategoryContentAccordion";
import EditCurrentAffairModal from "../../../components/AdminComponents/EditCurrentAffairModal/EditCurrentAffairModal";
import styles from "./AdminUpdateCurrentAffairsPage.module.css";

// API
import apiClient from "../../../api/apiClient";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";

const CA_ENDPOINTS = [
  { type: "LATEST", url: "/admin/current-affairs/latest" },
  { type: "MONTHLY", url: "/admin/current-affairs/monthly" },
  { type: "SPORTS", url: "/admin/current-affairs/sports" },
  { type: "STATE", url: "/admin/current-affairs/state" },
  { type: "INTERNATIONAL", url: "/admin/current-affairs/international" },
  { type: "POLITICS", url: "/admin/current-affairs/politics" },
  { type: "LOCAL", url: "/admin/current-affairs/local" },
];

const AdminUpdateCurrentAffairsPage = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  /* ------------------------------------------------
     BUILD CATEGORY → SUBCATEGORY → ITEMS TREE
  ------------------------------------------------ */
  const buildHierarchy = (items, categories, subCategories) => {
    const catMap = categories.map((c) => ({
      id: c._id,
      name: c.name,
      subCategories: [],
    }));

    const subMap = subCategories.map((s) => ({
      id: s._id,
      name: s.name,
      parentId: s.category?._id || s.category,
      items: [],
    }));

    items.forEach((item) => {
      const isSports = item.type === "SPORTS";

      const formattedItem = {
        id: item._id,
        ...item,

        // ✅ FIXED TITLE LOGIC (BASED ON YOUR API)
        title: isSports
          ? `${item.sport || "Sports"} – ${item.event || "-"}`
          : item.heading || item.name || "-",

        categoryType: item.type,

        date: item.date ? new Date(item.date).toLocaleDateString("en-GB") : "-",

        language: Array.isArray(item.languages)
          ? item.languages.map((l) => l.name).join(", ")
          : "-",
      };

      if (Array.isArray(item.subCategories)) {
        item.subCategories.forEach((sub) => {
          const subId = sub._id || sub;
          const targetSub = subMap.find((s) => String(s.id) === String(subId));
          if (targetSub) targetSub.items.push(formattedItem);
        });
      }
    });

    subMap.forEach((sub) => {
      const parentCat = catMap.find(
        (c) => String(c.id) === String(sub.parentId)
      );
      if (parentCat) parentCat.subCategories.push(sub);
    });

    return catMap;
  };

  /* ------------------------------------------------
     FETCH ALL CURRENT AFFAIRS
  ------------------------------------------------ */
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      console.log("📡 Fetching current affairs...");

      const caRequests = CA_ENDPOINTS.map((e) =>
        apiClient.get(e.url).then((res) => {
          const data = res.data?.data || [];
          console.log(`✅ ${e.type}:`, data);
          return data.map((item) => ({ ...item, type: e.type }));
        })
      );

      const caResults = await Promise.all(caRequests);
      const allItems = caResults.flat();

      console.log("📦 All merged items:", allItems);

      const [catsRes, subsRes] = await Promise.all([
        categoryService.getAllCategories("CURRENT_AFFAIRS"),
        subCategoryService.getAllSubCategories(null, "CURRENT_AFFAIRS"),
      ]);

      const hierarchy = buildHierarchy(
        allItems,
        catsRes.data || [],
        subsRes.data || []
      );

      console.log("🌳 Final hierarchy:", hierarchy);
      setTreeData(hierarchy);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /* ------------------------------------------------
     ACTIONS
  ------------------------------------------------ */
  const handleEditClick = (item) => {
    console.log("✏️ Edit item:", item);
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      const typePath = item.type.toLowerCase();
      await apiClient.delete(`/admin/current-affairs/${typePath}/${item._id}`);
      fetchAllData();
    } catch (err) {
      alert("❌ Delete failed");
    }
  };

  const handleModalClose = (refresh) => {
    setIsModalOpen(false);
    setItemToEdit(null);
    if (refresh) fetchAllData();
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.pageWrap}>
      <h1>All Current Affairs (Admin)</h1>

      {treeData.length === 0 ? (
        <p className={styles.empty}>No data found.</p>
      ) : (
        treeData.map((cat) => (
          <CategoryContentAccordion
            key={cat.id}
            variant="currentAffairs"
            categoryName={cat.name}
            subCategories={cat.subCategories}
            onAddItem={() => navigate("/admin/content/add/current-affairs")}
            onEditItem={handleEditClick}
            onDeleteItem={handleDeleteClick}
          />
        ))
      )}

      {isModalOpen && (
        <EditCurrentAffairModal
          isOpen={isModalOpen}
          data={itemToEdit}
          onClose={handleModalClose}
        />
      )}

      <div className={styles.addCategoryWrap}>
        <button
          className={styles.addCategoryBtn}
          onClick={() => navigate("/admin/content/add/current-affairs")}
        >
          <Plus size={18} /> Add New
        </button>
      </div>
    </div>
  );
};

export default AdminUpdateCurrentAffairsPage;
