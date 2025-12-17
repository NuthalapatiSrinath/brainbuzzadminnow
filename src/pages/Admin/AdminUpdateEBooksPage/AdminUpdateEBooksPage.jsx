import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CategoryContentAccordion from "../../../components/CategoryContentAccordion/CategoryContentAccordion";
import EditEBookModal from "../../../components/AdminComponents/EditEBookModal/EditEBookModal";
import styles from "./AdminUpdateEBooksPage.module.css";

// API
import * as eBookService from "../../../api/services/adminEBookService";
import * as categoryService from "../../../api/services/adminCategoryService";
import * as subCategoryService from "../../../api/services/adminSubCategoryService";

const AdminUpdateEBooksPage = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eBookToEdit, setEBookToEdit] = useState(null);

  // 1. Build Hierarchy (Category -> SubCategory -> E-Books)
  const buildHierarchy = (ebooks, cats, subCats) => {
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

    ebooks.forEach((book) => {
      // Format for Accordion
      const formattedItem = {
        id: book._id,
        ...book,
        // Columns matching 'ebooks' variant config
        title: book.name || book.title,
        price: book.originalPrice ? `₹${book.originalPrice}` : "Free",
        language: Array.isArray(book.languages)
          ? book.languages.map((l) => l.name).join(", ")
          : "-",
        date: book.createdAt
          ? new Date(book.createdAt).toLocaleDateString()
          : "-",
      };

      // Assign to SubCategories
      if (Array.isArray(book.subCategories)) {
        book.subCategories.forEach((subRef) => {
          const subId = subRef._id || subRef;
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

  // 2. Fetch Data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [ebooksRes, catsRes, subsRes] = await Promise.all([
        eBookService.getAllEBooks(),
        categoryService.getAllCategories("E_BOOK"),
        subCategoryService.getAllSubCategories(null, "E_BOOK"),
      ]);

      const hierarchy = buildHierarchy(
        ebooksRes.data?.data || [],
        catsRes.data || [],
        subsRes.data || []
      );
      setTreeData(hierarchy);
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // 3. Actions
  const handleEditClick = (book) => {
    setEBookToEdit(book);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (book) => {
    if (!window.confirm(`Delete E-Book "${book.title}"?`)) return;
    try {
      await eBookService.deleteEBook(book.id);
      fetchAllData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleModalClose = (refresh) => {
    setIsModalOpen(false);
    setEBookToEdit(null);
    if (refresh) fetchAllData();
  };

  if (loading) return <div className={styles.loader}>Loading E-Books...</div>;

  return (
    <div className={styles.pageWrap}>
      <h1>Update / Delete E-Books</h1>

      {treeData.length === 0 ? (
        <p className={styles.empty}>No E-Books found.</p>
      ) : (
        treeData.map((cat) => (
          <CategoryContentAccordion
            key={cat.id}
            variant="ebooks" // Ensure this exists in categoryVariants.js
            categoryName={cat.name}
            subCategories={cat.subCategories}
            onAddItem={() => navigate("/admin/content/add/e-book")}
            onEditItem={handleEditClick}
            onDeleteItem={handleDeleteClick}
          />
        ))
      )}

      {isModalOpen && (
        <EditEBookModal
          isOpen={isModalOpen}
          eBook={eBookToEdit}
          onClose={handleModalClose}
        />
      )}

      <div className={styles.addCategoryWrap}>
        <button
          className={styles.addCategoryBtn}
          onClick={() => navigate("/admin/content/add/ebook")}
        >
          <Plus size={18} /> Add E-Book
        </button>
      </div>
    </div>
  );
};

export default AdminUpdateEBooksPage;
