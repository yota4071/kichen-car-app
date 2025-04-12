// components/shop/ReviewItem.tsx
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { RatingStars } from './RatingStars';

type ReviewItemProps = {
  reviewId: string;
  rating: number;
  comment: string;
  authorName: string;
  date?: Timestamp | Date | null;
  formatDate?: (date: Timestamp | Date | null) => string;
  likes: number;
  onLike?: (reviewId: string) => Promise<boolean>; // Promise<boolean>を返すように変更
  userHasLiked?: boolean;
};

export function ReviewItem({ 
  reviewId,
  rating, 
  comment, 
  authorName, 
  date, 
  formatDate = (date) => date instanceof Date ? date.toLocaleDateString('ja-JP') : '',
  likes = 0,
  onLike,
  userHasLiked = false
}: ReviewItemProps) {
  const [isLiked, setIsLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const formattedDate = date ? (
    date instanceof Timestamp ? 
      new Date(date.toMillis()).toLocaleDateString('ja-JP') : 
      formatDate(date)
  ) : '';

  const handleLikeClick = async () => {
    if (onLike) {
      // onLike関数がtrueを返した場合のみUIを更新する
      const success = await onLike(reviewId);
      
      if (success) {
        // すでにいいねしている場合は取り消し、していない場合は追加
        if (isLiked) {
          setLikeCount(prev => prev - 1);
          setIsLiked(false);
        } else {
          setLikeCount(prev => prev + 1);
          setIsLiked(true);
          setIsLikeAnimating(true);
          setTimeout(() => setIsLikeAnimating(false), 500);
        }
      }
    }
  };

  return (
    <div className="review-item">
      <div className="review-item-header">
        <div className="rating-stars">
          <RatingStars rating={rating} />
        </div>
        <div className="review-likes">
          <button 
            className={`like-button ${isLiked ? 'liked' : ''} ${isLikeAnimating ? 'animating' : ''}`}
            onClick={handleLikeClick}
            //disabled={isLiked}
          >
            {isLiked ? '❤️' : '🤍'} <span className="like-count">{likeCount}</span>
          </button>
        </div>
      </div>
      <p className="review-comment">{comment}</p>
      <div className="review-footer">
        <div className="review-author">
          <span>👤</span> {authorName || '匿名ユーザー'}
        </div>
        {formattedDate && (
          <div className="review-date">{formattedDate}</div>
        )}
      </div>
    </div>
  );
}