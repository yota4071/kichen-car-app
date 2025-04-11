// 必要なインポートを追加
import { Timestamp } from 'firebase/firestore';
import { ReviewItem } from './ReviewItem'; // 正しいパスを指定

type Review = {
  rating: number;
  comment: string;
  displayName?: string;
  createdAt?: Timestamp | null;
};

type ReviewListProps = {
    reviews: Review[];
    formatDate?: (date: Timestamp | Date | null) => string;
  };

export function ReviewList({ 
  reviews, 
  formatDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) return date.toLocaleDateString('ja-JP');
    return new Date(date.toMillis()).toLocaleDateString('ja-JP');
  }
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        まだレビューはありません。最初のレビューを投稿してみませんか？
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {reviews.map((review, index) => (
        <ReviewItem
          key={index}
          rating={review.rating}
          comment={review.comment}
          authorName={review.displayName || '匿名ユーザー'}
          date={review.createdAt}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}