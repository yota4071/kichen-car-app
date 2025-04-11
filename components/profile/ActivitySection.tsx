// components/profile/ActivitySection.tsx
import { Timestamp } from 'firebase/firestore';

type Review = {
  rating: number;
  comment: string;
  shopName: string;
  createdAt: Timestamp | null;
};

type ActivityItemProps = {
  date: string;
  content: React.ReactNode;
};

function ActivityItem({ date, content }: ActivityItemProps) {
  return (
    <div className="activity-item">
      <div className="activity-date">{date}</div>
      <div className="activity-content">{content}</div>
    </div>
  );
}

type ActivitySectionProps = {
  title: string;
  reviews: Review[];
  formatDate: (timestamp: Timestamp | null) => string;
};

export default function ActivitySection({ title, reviews, formatDate }: ActivitySectionProps) {
  if (reviews.length === 0) return null;

  return (
    <div className="activity-section">
      <h2 className="activity-heading">{title}</h2>
      <div className="activity-list">
        {reviews.map((review, index) => (
          <ActivityItem
            key={index}
            date={review.createdAt ? formatDate(review.createdAt) : '日付不明'}
            content={
              <>
                <strong>{review.shopName}</strong>：{review.rating}★ - {review.comment}
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}