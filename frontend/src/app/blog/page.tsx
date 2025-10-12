import styles from '../info-page.module.css';

export default function BlogPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>The Hub Blog</h1>
      <p className={styles.paragraph}>
        Welcome to The Hub—your source for everything beauty, wellness, and business. Our blog is a resource for both our
        clients and our professional partners.
      </p>
      
      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>For Our Clients</h3>
        <p className={styles.blockContent}>
          Explore articles on the latest hairstyle trends, skincare advice from the experts, tips for
          finding the perfect service for you, and spotlights on some of the amazing local salons featured on our platform.
        </p>
      </div>

      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>For Our Partners</h3>
        <p className={styles.blockContent}>
          Grow your business with our guides on digital marketing for salons, managing your online
          reputation, inventory tips for your beauty products, and strategies to turn first-time clients into loyal regulars.
        </p>
      </div>
    </div>
  );
}
