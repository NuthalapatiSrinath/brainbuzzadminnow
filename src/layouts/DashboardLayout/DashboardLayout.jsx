import TopBar from "../../pages/TopBar/TopBar";
import Footer from "../../pages/Footer/Footer";
import FloatingActions from "../../components/FloatingActions/FloatingActions"; // Import the new component
import styles from "./DashboardLayout.module.css";

import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className={styles.DashboardLayout}>
      <div className={styles.RightSection}>
        {/* <div className={styles.RightSection}></div> */}
        <TopBar />

        <main className="Main">
          <Outlet />
        </main>

        <Footer />

        {/* Floating Buttons (WhatsApp + ScrollTop) */}
        <FloatingActions />
      </div>
    </div>
  );
}

export default DashboardLayout;
