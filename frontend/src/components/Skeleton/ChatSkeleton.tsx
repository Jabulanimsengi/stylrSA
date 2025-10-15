import { Skeleton, SkeletonGroup } from './Skeleton';
import styles from './Skeleton.module.css';

export default function ChatSkeleton() {
  return (
    <div className={styles.chatSkeletonContainer}>
      {/* Chat header */}
      <div className={styles.chatHeader}>
        <Skeleton variant="circle" width={40} height={40} />
        <div style={{ flex: 1, marginLeft: '1rem' }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        <SkeletonGroup count={6}>
          {(idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                justifyContent: idx % 2 === 0 ? 'flex-start' : 'flex-end',
                marginBottom: '1rem',
              }}
            >
              <Skeleton
                variant="rounded"
                width={`${Math.random() * 30 + 40}%`}
                height={60}
              />
            </div>
          )}
        </SkeletonGroup>
      </div>

      {/* Input skeleton */}
      <div className={styles.chatInputSkeleton}>
        <Skeleton variant="rounded" width="100%" height={50} />
      </div>
    </div>
  );
}
