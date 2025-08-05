// components/shop/ReviewList.tsx
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { ReviewItem } from './ReviewItem';

type Review = {
  id: string;
  rating: number;
  comment: string;
  displayName?: string;
  createdAt?: Timestamp | null;
  likes: number;
  userLiked?: boolean;
  reports?: number; // 報告数を追加
  userId?: string; // レビュー投稿者のユーザーID
};

type SortOption = 'newest' | 'highest-rated' | 'most-liked';

type ReviewListProps = {
  reviews: Review[];
  formatDate?: (date: Timestamp | Date | null) => string;
  onLikeReview: (reviewId: string) => Promise<boolean>;
  onReportReview?: (reviewId: string) => Promise<boolean>; // 報告機能を追加
  onDeleteReview?: (reviewId: string) => Promise<boolean>; // 削除機能を追加
  currentUserId?: string; // 現在のユーザーID
};

export function ReviewList({ 
  reviews, 
  formatDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) return date.toLocaleDateString('ja-JP');
    return new Date(date.toMillis()).toLocaleDateString('ja-JP');
  },
  onLikeReview,
  onReportReview,
  onDeleteReview,
  currentUserId
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // ソート関数
  const getSortedReviews = () => {
    const reviewsCopy = [...reviews];
    
    switch (sortBy) {
      case 'newest':
        return reviewsCopy.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
      case 'highest-rated':
        return reviewsCopy.sort((a, b) => b.rating - a.rating);
      case 'most-liked':
        return reviewsCopy.sort((a, b) => b.likes - a.likes);
      default:
        return reviewsCopy;
    }
  };

  const sortedReviews = getSortedReviews();

  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        まだレビューはありません。最初のレビューを投稿してみませんか？
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-sort">
        <span className="sort-label">並び替え:</span>
        <div className="sort-options">
          <button 
            className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            最新順
          </button>
          <button 
            className={`sort-option ${sortBy === 'highest-rated' ? 'active' : ''}`}
            onClick={() => setSortBy('highest-rated')}
          >
            評価順
          </button>
          <button 
            className={`sort-option ${sortBy === 'most-liked' ? 'active' : ''}`}
            onClick={() => setSortBy('most-liked')}
          >
            いいね順
          </button>
        </div>
      </div>

      <div className="reviews-list">
        {sortedReviews.map((review) => (
          <ReviewItem
            key={review.id}
            reviewId={review.id}
            rating={review.rating}
            comment={review.comment}
            authorName={review.displayName || '匿名ユーザー'}
            date={review.createdAt}
            formatDate={formatDate}
            likes={review.likes}
            onLike={onLikeReview}
            userHasLiked={review.userLiked}
            onReport={onReportReview}
            reports={review.reports}
            onDelete={onDeleteReview}
            canDelete={!!(currentUserId && review.userId === currentUserId)}
          />
        ))}
      </div>
    </div>
  );
}