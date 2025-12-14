import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

/**
 * A responsive footer component for the BrainBuzz application.
 * Based on the 4-column layout from the user's image.
 */
export default function Footer() {
  // Social links from your project's public/icons folder
  const socialLinks = [
    {
      href: "https://www.facebook.com/brainbuzzakademy",
      imgSrc: "/icons/facebook.png",
      alt: "Facebook",
    },
    {
      href: "https://x.com/brainbuzzacadmy",
      imgSrc: "/icons/twitter.png",
      alt: "Twitter",
    },
    {
      href: "https://www.instagram.com/brainbuzzacademy/",
      imgSrc: "/icons/instagram.png",
      alt: "Instagram",
    },
    {
      href: "https://linkedin.com", // Add your LinkedIn URL
      imgSrc: "/icons/linkedin.png",
      alt: "LinkedIn",
    },
    {
      href: "https://youtube.com", // Add your YouTube URL
      imgSrc: "/icons/youtube.png",
      alt: "YouTube",
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Column 1: App Logo and Name */}
        <div className={styles.column}>
          <Link to="/" className={styles.logoWrap}>
            <img
              src="/favicon.svg" // Using your app's favicon
              alt="BrainBuzz Logo"
              className={styles.logo}
            />
            <span className={styles.logoText}>BrainBuzz Academy</span>
          </Link>
          <div className={styles.appBadges}>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/googleplaystore.svg"
                alt="Get it on Google Play"
                className={styles.badge}
              />
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/appstore.svg"
                alt="Download on the App Store"
                className={styles.badge}
              />
            </a>
          </div>
        </div>

        {/* Column 2: About BrainBuzz */}
        <div className={styles.column}>
          <h3 className={styles.title}>About BrainBuzz</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/aboutus" className={styles.link}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contactus" className={styles.link}>
                Contact Us
              </Link>
            </li>
            {/* <li>
              <a href="#" className={styles.link}>
                Careers
              </a>
            </li> */}
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div className={styles.column}>
          <h3 className={styles.title}>Resources</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/courses" className={styles.link}>
                Online Courses
              </Link>
            </li>
            <li>
              <Link to="/test-series" className={styles.link}>
                Test Series
              </Link>
            </li>
            <li>
              <Link to="/dailyquizzes" className={styles.link}>
                Daily Quizzes
              </Link>
            </li>
            <li>
              <Link to="/ebooks" className={styles.link}>
                Publications
              </Link>
            </li>
            <li>
              <Link to="/previous-papers" className={styles.link}>
                Previous Papers
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Social */}
        <div className={styles.column}>
          <h3 className={styles.title}>Social</h3>
          <div className={styles.socialLinks}>
            {socialLinks.map((social) => (
              <a
                key={social.alt}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={`Follow us on ${social.alt}`}
              >
                <img
                  src={social.imgSrc}
                  alt={social.alt}
                  className={styles.socialIcon}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
