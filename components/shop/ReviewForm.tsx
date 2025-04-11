// components/shop/ReviewForm.tsx
import { useState, useEffect } from 'react';
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
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharacterCount = 500;

  useEffect(() => {
    // 成功メッセージが表示されたら（提出成功後）、フォームをクリアする
    if (successMessage) {
      setRating(5);
      setComment('');
      setCharacterCount(0);
    }
  }, [successMessage]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    // 最大文字数を超える場合は入力を制限
    if (newComment.length <= maxCharacterCount) {
      setComment(newComment);
      setCharacterCount(newComment.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === '') return;
    await onSubmit(rating, comment);
  };

  return (
    <div className="review-form">
      <h2 className="form-title">レビューを投稿する</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">
            評価
            <div className="rating-selection">
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
              onChange={handleCommentChange}
              className="textarea"
              placeholder="このキッチンカーの感想を教えてください..."
              required
              maxLength={maxCharacterCount}
            />
            <div className="character-count">
              <span className={characterCount > maxCharacterCount * 0.8 ? "text-warning" : ""}>
                {characterCount}/{maxCharacterCount}
              </span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || comment.trim() === ''}
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