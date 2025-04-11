// components/shop/ReviewForm.tsx
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { RatingStars } from './RatingStars';

type ReviewFormProps = {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  initialRating?: number;
  initialComment?: string;
  isSubmitting?: boolean;
  successMessage?: string | null;
};

export function ReviewForm({ 
  onSubmit, 
  initialRating = 5, 
  initialComment = '', 
  isSubmitting = false,
  successMessage = null
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(rating, comment);
  };

  return (
    <div className="review-form">
      <h2 className="form-title">レビューを投稿する</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">
            評価
            <div style={{ marginTop: '0.5rem' }}>
              <RatingStars 
                rating={rating} 
                isEditable 
                onChange={setRating}
                size="lg" 
              />
            </div>
          </label>
        </div>

        <div className="form-group">
          <label className="label">
            コメント
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="textarea"
              placeholder="このキッチンカーの感想を教えてください..."
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '投稿中...' : 'レビューを投稿'}
        </button>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
      </form>
    </div>
  );
}