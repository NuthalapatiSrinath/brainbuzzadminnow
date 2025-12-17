import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CategoryContentAccordion from "../../../components/CategoryContentAccordion/CategoryContentAccordion";
import EditPublicationModal from "../../../components/AdminComponents/EditPublicationModal/EditPublicationModal";
import styles from "./AdminUpdatePublicationsPage.module.css";

// API
import * as publicationService from "../../../api/services/adminPublicationService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";

const CONTENT_TYPE = "PUBLICATION"; // ✅ FIXED

const AdminUpdatePublicationsPage = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  /* ---------------------------------------------
     BUILD HIERARCHY
  --------------------------------------------- */
  const buildHierarchy = (items, cats, subCats) => {
    const catMap = cats.map((c) => ({
      id: c._id,
      name: c.name,
      subCategories: [],
    }));

    const subMap = subCats.map((s) => ({
      id: s._id,
      name: s.name,
      parentId: s.category?._id || s.category,
      items: [],
    }));

    items.forEach((item) => {
      const formattedItem = {
        id: item._id,
        ...item,
        title: item.name || "Untitled",
        price: item.originalPrice ? `₹${item.originalPrice}` : "Free",
        language: item.languages?.map((l) => l.name).join(", ") || "-",
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "-",
      };

      if (!Array.isArray(item.subCategories)) return;

      item.subCategories.forEach((sub) => {
        const subId = sub._id || sub;
        const targetSub = subMap.find((s) => String(s.id) === String(subId));
        if (targetSub) targetSub.items.push(formattedItem);
      });
    });

    subMap.forEach((sub) => {
      const parent = catMap.find((c) => String(c.id) === String(sub.parentId));
      if (parent) parent.subCategories.push(sub);
    });

    return catMap.filter((c) =>
      c.subCategories.some((s) => s.items.length > 0)
    );
  };

  /* ---------------------------------------------
     FETCH DATA
  --------------------------------------------- */
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [pubRes, catsRes, subsRes] = await Promise.all([
        publicationService.getAllPublications(),
        categoryService.getAllCategories(CONTENT_TYPE), // ✅ FIX
        subCategoryService.getAllSubCategories(null, CONTENT_TYPE), // ✅ FIX
      ]);

      console.log("📘 Publications:", pubRes.data?.data);
      console.log("📁 Categories:", catsRes.data);
      console.log("📂 SubCategories:", subsRes.data);

      const hierarchy = buildHierarchy(
        pubRes.data?.data || [],
        catsRes.data || [],
        subsRes.data || []
      );

      setTreeData(hierarchy);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /* ---------------------------------------------
     ACTIONS
  --------------------------------------------- */
  const handleEditClick = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    await publicationService.deletePublication(item.id);
    fetchAllData();
  };

  const handleModalClose = (refresh) => {
    setIsModalOpen(false);
    setItemToEdit(null);
    if (refresh) fetchAllData();
  };

  if (loading) {
    return <div className={styles.loader}>Loading Publications...</div>;
  }

  return (
    <div className={styles.pageWrap}>
      <h1>Update / Delete Publications</h1>

      {treeData.length === 0 ? (
        <p className={styles.empty}>No Publications found.</p>
      ) : (
        treeData.map((cat) => (
          <CategoryContentAccordion
            key={cat.id}
            variant="publications"
            categoryName={cat.name}
            subCategories={cat.subCategories}
            onAddItem={() => navigate("/admin/content/add/publication")}
            onEditItem={handleEditClick}
            onDeleteItem={handleDeleteClick}
          />
        ))
      )}

      {isModalOpen && (
        <EditPublicationModal
          isOpen={isModalOpen}
          data={itemToEdit}
          onClose={handleModalClose}
        />
      )}

      <div className={styles.addCategoryWrap}>
        <button
          className={styles.addCategoryBtn}
          onClick={() => navigate("/admin/content/add/publication")}
        >
          <Plus size={18} /> Add Publication
        </button>
      </div>
    </div>
  );
};

export default AdminUpdatePublicationsPage;
