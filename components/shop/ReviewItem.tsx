import { Timestamp } from 'firebase/firestore';
// components/shop/ReviewItem.tsx の先頭に追加
import { RatingStars } from './RatingStars';

type ReviewItemProps = {
  rating: number;
  comment: string;
  authorName: string;
  date?: Timestamp | Date | null;
  formatDate?: (date: Timestamp | Date | null) => string;
};

export function ReviewItem({ 
  rating, 
  comment, 
  authorName, 
  date, 
  formatDate = (date) => date instanceof Date ? date.toLocaleDateString('ja-JP') : ''
}: ReviewItemProps) {
  const formattedDate = date ? (
    date instanceof Timestamp ? 
      new Date(date.toMillis()).toLocaleDateString('ja-JP') : 
      formatDate(date)
  ) : '';

  return (
    <div className="review-item">
      <div className="rating-stars">
        <RatingStars rating={rating} />
      </div>
      <p className="review-comment">{comment}</p>
      <div className="review-author">
        <span>👤</span> {authorName || '匿名ユーザー'}
      </div>
      {formattedDate && (
        <div className="review-date">{formattedDate}</div>
      )}
    </div>
  );
}