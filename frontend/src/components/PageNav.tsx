"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaHome } from "react-icons/fa";
import styles from "./PageNav.module.css";

export default function PageNav() {
  const router = useRouter();
  return (
    <nav className={styles.pageNav} aria-label="Page navigation">
      <button type="button" onClick={() => router.back()} className={styles.navButton}>
        <FaArrowLeft />
        <span>Back</span>
      </button>
      <Link href="/" className={styles.navButton}>
        <FaHome />
        <span>Home</span>
      </Link>
    </nav>
  );
}
