import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyEbooksPage.module.css";
// 🎯 Import the generic ProductCard component
import ProductCard from "../../../../components/ProductCard/ProductCard";
// Import main Ebooks data
import EBOOKS_DATA from "../../../../data/ebooks";
// 🎯 CORRECTED PATH: Import list of purchased ebook IDs from the data directory
import { purchasedEbookIds } from "../../../../data/userEbooks.js";

// --- Helper function to retrieve full details for purchased ebooks ---
const getMyEbooksData = () => {
  const myEbooks = [];

  // Iterate through all categories and subcategories in the master data
  for (const categoryKey in EBOOKS_DATA.subcategories) {
    const subcategories = EBOOKS_DATA.subcategories[categoryKey];

    for (const subcategoryObj of subcategories) {
      for (const book of subcategoryObj.books || []) {
        // Check if this book ID is in the user's purchased list
        if (purchasedEbookIds.includes(String(book.id))) {
          myEbooks.push({
            ...book,
            id: String(book.id),
            category: categoryKey, // For routing
            subcategory: subcategoryObj.id, // For routing
            image: book.image || "/images/default-book.png",
            // Set price props for consistency, even though they will be hidden
            price: book.price || 0,
            originalPrice: book.originalPrice,
            discount: book.discount,
          });
        }
      }
    }
  }
  return myEbooks;
};

export default function MyEbooksPage() {
  const navigate = useNavigate();
  // Fetch the list of purchased ebooks
  const myEbooksData = useMemo(() => getMyEbooksData(), []);

  // Handler for the "View" button (opens the book viewer tab in a new page)
  const handleView = (book) => {
    // Navigate directly to the book viewer tab in the detail page
    navigate(`/ebooks/${book.category}/${book.subcategory}/${book.id}/book`);
  };

  // Handler for the "Download" button (initiates direct download)
  const handleDownload = (book) => {
    if (!book.pdfUrl) {
      console.error(`Download failed: No PDF URL found for ${book.title}.`);
      return;
    }

    // Create a temporary link element to trigger download
    try {
      const a = document.createElement("a");
      a.href = book.pdfUrl;
      const safeTitle = (book.title || "ebook")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      a.download = `${safeTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      // Fallback for browsers that block dynamic download (e.g., in iframes)
      window.open(book.pdfUrl, "_blank", "noopener");
    }
  };

  // Handler for the outer card click (navigates to the detail/description tab)
  const handleViewDetails = (book) => {
    navigate(`/ebooks/${book.category}/${book.subcategory}/${book.id}`);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* === Text Heading === */}
        <div className={styles.headingWrapper}>
          <div className={styles.headingline}>
            <h2 className={styles.heading}>My E-books & Publications</h2>
            <div className={styles.headingUnderline}></div>
          </div>
          <p className={styles.subtitle}>
            Access your purchased study materials and publications instantly.
          </p>
        </div>

        {/* === Ebook Grid === */}
        <div className={styles.gridContainer}>
          {myEbooksData.length > 0 ? (
            myEbooksData.map((book) => (
              <ProductCard
                key={book.id}
                // 🎯 Pass book-specific data/routing details
                image={book.image}
                title={book.title}
                tag={"E-Book"}
                validity={book.validity}
                medium={book.medium}
                // 🎯 Set variant and purchased status
                variant="ebook"
                isPurchased={true} // Triggers View/Download button logic
                // 🎯 Pass handlers for navigation
                // Note: The main card click (not button) defaults to the onViewDetails handler
                onViewDetails={() => handleViewDetails(book)}
                onView={() => handleView(book)}
                onDownload={() => handleDownload(book)}
                // onBuyNow is irrelevant when isPurchased=true, but we must pass a function
                onBuyNow={() => console.log("Purchased: Buy Now ignored")}
              />
            ))
          ) : (
            <p className={styles.noResultsMessage}>
              You have not purchased any e-books yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
