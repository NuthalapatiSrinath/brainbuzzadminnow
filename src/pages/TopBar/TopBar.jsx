// src/pages/TopBar/TopBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openModal } from "../../redux/slices/modalSlice";
import { logout } from "../../redux/slices/authSlice";
// import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";
import Dropdown from "../../components/Dropdown/Dropdown";
import TopbarPanel from "./TopbarPanel";
import ProfileDropdownPanel from "./ProfileDropdownPanel";
import styles from "./Topbar.module.css";

/* (TOP_NAV, LOGIN_BTN, BOTTOM_NAV, normalizeHref functions are all unchanged) */
const TOP_NAV = [
  { key: "adminhome", label: "Admin Home", href: "/admin/content" },
  { key: "home", label: "Home", href: "/" },
  {
    key: "follow",
    label: "Follow Us",
    dropdown: [
      { label: "Facebook", href: "https://www.facebook.com/brainbuzzakademy" },
      { label: "Twitter", href: "https://x.com/brainbuzzacadmy" },
      {
        label: "Instagram",
        href: "https://www.instagram.com/brainbuzzacademy/",
      },
    ],
  },
];
const LOGIN_BTN = { key: "login", label: "Log in / Register" };
const BOTTOM_NAV = [
  {
    key: "onlineCourses",
    label: "Online Courses",
    href: "/online-courses",
    dropdown: [
      {
        label: "UPSC",
        href: "/online-courses/upsc",
        icon: "/images/upsc.png",
      },
      // ... other course categories
    ],
  },
  { key: "liveClass", label: "Live Classes", href: "/liveclasses" },
  {
    key: "testSeries",
    label: "Test Series",
    href: "/test-series",
    dropdown: [
      {
        label: "UPSC",
        href: "/test-series/upsc",
        icon: "/images/upsc.png",
      },
      // ... other test series categories
    ],
  },
  { key: "dailyQuizzes", label: "Daily Quizzes", href: "/dailyquizzes" },
  { key: "currentAffairs", label: "Current Affairs", href: "/currentaffairs" },
  { key: "publications", label: "Publications", href: "/ebooks" },
  { key: "about", label: "About Us", href: "/aboutus" },
  { key: "contact", label: "Contact Us", href: "/contactus" },
];
function normalizeHref(href) {
  if (!href) return "#";
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#")
  )
    return href;
  return href.startsWith("/") ? href : `/${href}`;
}

// --- NO NEED FOR UserIcon component here anymore ---

export default function Topbar() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // const [language, setLanguage] = useState("English");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  const [showPanelKey, setShowPanelKey] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const rootRef = useRef(null);
  const profileRef = useRef(null);

  // Effect for outside click/Escape key
  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setShowPanelKey(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setShowPanelKey(null);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // (Other useEffects remain unchanged...)
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  function handleLoginClick() {
    dispatch(openModal({ type: "login" })); // Use 'modalType' to match modalSlice
  }

  function handleLogoutClick() {
    dispatch(logout());
    setIsProfileOpen(false);
  }

  function toggleMobile() {
    setMobileOpen((s) => !s);
    setShowPanelKey(null);
  }

  function toggleAccordion(key) {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function togglePanel(key) {
    setShowPanelKey((prev) => (prev === key ? null : key));
  }

  return (
    <>
      <header className={styles.topbar} ref={rootRef}>
        <div className={styles.container}>
          {/* LEFT: logo + mobile hamburger (Unchanged) */}
          <div className={styles.left}>
            <div className={styles.logoAndHam}>
              <button
                className={`${styles.hamburger} ${
                  mobileOpen ? styles.open : ""
                }`}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={toggleMobile}
                type="button"
              >
                <span className={styles.hamBar} />
                <span className={styles.hamBar} />
                <span className={styles.hamBar} />
              </button>
              <div className={styles.logoWrap}>
                <img src="/favicon.svg" alt="logo" className={styles.logo} />
              </div>
            </div>
          </div>

          {/* CENTER: desktop navs */}
          <div className={styles.center}>
            <div className={styles.topRow}>
              {/* Top Nav (Unchanged) */}
              <nav className={styles.topNav} aria-label="Primary navigation">
                <ul className={styles.topNavList}>
                  {TOP_NAV.map((it) => (
                    <li key={it.key} className={styles.topNavItem}>
                      {it.dropdown ? (
                        <Dropdown
                          label={it.label}
                          items={(it.dropdown || []).map((d) => ({
                            ...d,
                            href: normalizeHref(d.href),
                          }))}
                          align="center"
                        />
                      ) : (
                        <a
                          href={normalizeHref(it.href)}
                          className={styles.topLink}
                        >
                          {it.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className={styles.badgesGroup}>
                <img
                  src="/googleplaystore.svg"
                  alt="Google Play"
                  className={styles.badge}
                />
                <img
                  src="/appstore.svg"
                  alt="App Store"
                  className={styles.badge}
                />
                {/* <div className={styles.langWrapper}>
                  <LanguageSelector
                    language={language}
                    onChange={setLanguage}
                  />
                </div> */}

                {/* --- 3. UPDATED AUTH SECTION --- */}
                {isAuthenticated && user ? (
                  // --- 1. USER IS LOGGED IN ---
                  <div className={styles.profileDropdown} ref={profileRef}>
                    <button
                      type="button"
                      className={styles.profileTrigger}
                      onClick={() => setIsProfileOpen((o) => !o)}
                      aria-expanded={isProfileOpen}
                    >
                      {/* --- USE YOUR FIXED IMAGE --- */}
                      <div className={styles.userLogo}>
                        {/* This div is now styled with your background image */}
                      </div>

                      {/* --- USE user.name from backend (in white) --- */}
                      <span>{user.name || "My Account"}</span>

                      <span className={styles.profileCaret}></span>
                    </button>

                    {/* --- USE NEW DROPDOWN PANEL --- */}
                    {isProfileOpen && (
                      <ProfileDropdownPanel
                        user={user}
                        onLogout={handleLogoutClick}
                        // --- THIS IS THE FIX ---
                        onClose={() => setIsProfileOpen(false)}
                      />
                    )}
                  </div>
                ) : (
                  // --- 2. USER IS LOGGED OUT ---
                  <button
                    type="button"
                    className={styles.loginBtn}
                    onClick={handleLoginClick}
                  >
                    {LOGIN_BTN.label}
                  </button>
                )}
                {/* --- END OF AUTH SECTION --- */}
              </div>
            </div>

            {/* Bottom Row (Unchanged) */}
            <div className={styles.bottomRow}>
              <nav
                className={styles.bottomNav}
                aria-label="Secondary navigation"
              >
                <ul className={styles.bottomNavList}>
                  {BOTTOM_NAV.map((it) => (
                    <li key={it.key} className={styles.bottomNavItem}>
                      {it.dropdown ? (
                        it.key === "onlineCourses" ||
                        it.key === "testSeries" ? (
                          <div className={styles.panelTriggerWrap}>
                            <a
                              href={
                                it.key === "onlineCourses"
                                  ? normalizeHref("/online-courses")
                                  : normalizeHref("/test-series")
                              }
                              className={styles.bottomLink}
                            >
                              {it.label}
                            </a>
                            <button
                              type="button"
                              aria-haspopup="dialog"
                              aria-expanded={showPanelKey === it.key}
                              onClick={(e) => {
                                e.preventDefault();
                                togglePanel(it.key);
                              }}
                              className={styles.panelToggleBtn}
                              title={`Open ${it.label} panel`}
                            ></button>
                            {showPanelKey === it.key && (
                              <TopbarPanel
                                type={it.key}
                                items={(it.dropdown || []).map((d) => ({
                                  ...d,
                                  href: normalizeHref(d.href),
                                }))}
                                onClose={() => setShowPanelKey(null)}
                              />
                            )}
                          </div>
                        ) : (
                          <Dropdown
                            label={it.label}
                            items={(it.dropdown || []).map((d) => ({
                              ...d,
                              href: normalizeHref(d.href),
                            }))}
                            align="center"
                          />
                        )
                      ) : (
                        <a
                          href={normalizeHref(it.href)}
                          className={styles.bottomLink}
                        >
                          {it.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.langAndToggle}></div>
          </div>
        </div>
      </header>

      {/* --- 4. UPDATED MOBILE MENU (to use fixed image) --- */}
      {mobileOpen && (
        <div
          className={styles.mobileMenuWrap}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <div
            className={styles.mobileMenuBackdrop}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={`${styles.mobileMenuPanel} ${
              mobileOpen ? styles.open : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className={styles.logoWrap}
                  style={{ width: 48, height: 48 }}
                >
                  <img src="/favicon.svg" alt="logo" className={styles.logo} />
                </div>
                <div style={{ fontWeight: 700 }}>Menu</div>
              </div>
              <button
                className={`${styles.hamburger} ${
                  mobileOpen ? styles.open : ""
                }`}
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <span className={styles.hamBar} />
                <span className={styles.hamBar} />
                <span className={styles.hamBar} />
              </button>
            </div>

            {/* Mobile Login Button (or Profile) */}
            <div>
              {isAuthenticated && user ? (
                // --- UPDATED: Mobile Profile View ---
                <div className={styles.mobileProfile}>
                  <div className={styles.mobileProfileInfo}>
                    <div className={styles.userLogo}>
                      {/* This now uses the same fixed image style */}
                    </div>
                    <span>
                      Signed in as <strong>{user.name}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.mobileLogoutBtn}
                    onClick={() => {
                      handleLogoutClick();
                      setMobileOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // --- Original Mobile Login Button ---
                <button
                  type="button"
                  className={styles.mobileLoginBtn}
                  onClick={() => {
                    handleLoginClick();
                    setMobileOpen(false);
                  }}
                >
                  {LOGIN_BTN.label}
                </button>
              )}
            </div>

            {/* Top nav items (Unchanged) */}
            <div className={styles.mobileListWrap}>
              <ul className={styles.mobileMenuList}>
                {TOP_NAV.map((it) =>
                  it.dropdown ? (
                    <li key={it.key}>
                      <button
                        className={styles.mobileAccBtn}
                        onClick={() => toggleAccordion(it.key)}
                        aria-expanded={!!openAccordions[it.key]}
                      >
                        <span>{it.label}</span>
                        <span>{openAccordions[it.key] ? "−" : "+"}</span>
                      </button>
                      <div
                        className={`${styles.mobileAccBody} ${
                          openAccordions[it.key] ? styles.open : ""
                        }`}
                      >
                        {it.dropdown.map((d, idx) => (
                          <a
                            key={idx}
                            href={normalizeHref(d.href)}
                            className={styles.mobileAccItem}
                            onClick={() => setMobileOpen(false)}
                          >
                            {d.label}
                          </a>
                        ))}
                      </div>
                    </li>
                  ) : (
                    <li key={it.key}>
                      <a
                        href={normalizeHref(it.href)}
                        onClick={() => setMobileOpen(false)}
                      >
                        {it.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <hr />

            {/* Bottom nav (Unchanged) */}
            <div>
              <ul className={styles.mobileMenuList}>
                {BOTTOM_NAV.map((it) =>
                  it.dropdown ? (
                    <li key={it.key}>
                      <div className={styles.mobileBottomItem}>
                        <a
                          href={
                            it.key === "onlineCourses"
                              ? normalizeHref("/online-courses")
                              : it.key === "testSeries"
                              ? normalizeHref("/test-series")
                              : normalizeHref(it.href)
                          }
                          className={styles.mobileAccItem}
                          onClick={() => setMobileOpen(false)}
                        >
                          {it.label}
                        </a>
                        <button
                          className={styles.mobileAccToggle}
                          onClick={() => toggleAccordion(it.key)}
                          aria-expanded={!!openAccordions[it.key]}
                          aria-label={
                            openAccordions[it.key]
                              ? `Collapse ${it.label}`
                              : `Expand ${it.label}`
                          }
                        >
                          {openAccordions[it.key] ? "−" : "+"}
                        </button>
                      </div>
                      <div
                        className={`${styles.mobileAccBody} ${
                          openAccordions[it.key] ? styles.open : ""
                        }`}
                      >
                        {(it.dropdown || []).map((d, idx) => (
                          <a
                            key={idx}
                            href={normalizeHref(d.href)}
                            className={styles.mobileAccItem}
                            onClick={() => setMobileOpen(false)}
                          >
                            {d.label}
                          </a>
                        ))}
                      </div>
                    </li>
                  ) : (
                    <li key={it.key}>
                      <a
                        href={normalizeHref(it.href)}
                        onClick={() => setMobileOpen(false)}
                      >
                        {it.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <hr />

            {/* badges, language (Unchanged) */}
            <div className={styles.mobileBadgesRow}>
              <img
                src="/googleplaystore.svg"
                alt="Google Play"
                className={styles.badge}
                style={{ height: 44 }}
              />
              <img
                src="/appstore.svg"
                alt="App Store"
                className={styles.badge}
                style={{ height: 44 }}
              />
              <div style={{ marginLeft: "auto" }}>
                {/* z   <LanguageSelector language={language} onChange={setLanguage} /> */}
              </div>
            </div>

            <div className={styles.mobileBottomLinks}></div>
          </aside>
        </div>
      )}
    </>
  );
}
