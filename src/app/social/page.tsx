import Link from 'next/link';
import styles from './page.module.css';

export default function SocialPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Social Wall</h1>
      <p className={styles.text}>
        This page is under construction. Check back soon for our complete social media feed.
      </p>
      <Link href="/" className={styles.backLink}>← Back to Home</Link>
    </div>
  );
}
