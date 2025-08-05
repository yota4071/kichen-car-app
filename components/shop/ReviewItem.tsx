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
  onLike?: (reviewId: string) => Promise<boolean>;
  userHasLiked?: boolean;
  onReport?: (reviewId: string) => Promise<boolean>; // 報告機能を追加
  reports?: number; // 報告数を表示（管理者向け）
  onDelete?: (reviewId: string) => Promise<boolean>; // 削除機能を追加
  canDelete?: boolean; // 削除権限の有無
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
  userHasLiked = false,
  onReport,
  reports = 0,
  onDelete,
  canDelete = false
}: ReviewItemProps) {
  const [isLiked, setIsLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // 報告ボタンがクリックされたときの処理
  const handleReportClick = () => {
    setShowReportConfirm(true);
  };

  // 報告確認ダイアログでの確定処理
  const confirmReport = async () => {
    if (!onReport) return;
    
    setIsReporting(true);
    try {
      const success = await onReport(reviewId);
      if (success) {
        setReportSuccess(true);
        // 3秒後に成功メッセージを非表示にする
        setTimeout(() => {
          setReportSuccess(false);
          setShowReportConfirm(false);
        }, 3000);
      } else {
        setShowReportConfirm(false);
      }
    } catch (error) {
      console.error("レビュー報告エラー:", error);
    } finally {
      setIsReporting(false);
    }
  };

  // 削除ボタンがクリックされたときの処理
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // 削除確認ダイアログでの確定処理
  const confirmDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await onDelete(reviewId);
      if (success) {
        // 削除成功時はダイアログを閉じる（親コンポーネントでリストから削除される）
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("レビュー削除エラー:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="review-item">
      <div className="review-item-header">
        <div className="rating-stars">
          <RatingStars rating={rating} />
        </div>
        <div className="review-actions">
          <button 
            className={`like-button ${isLiked ? 'liked' : ''} ${isLikeAnimating ? 'animating' : ''}`}
            onClick={handleLikeClick}
          >
            {isLiked ? '❤️' : '🤍'} <span className="like-count">{likeCount}</span>
          </button>
          
          {!canDelete && (
            <button
              className="report-button"
              onClick={handleReportClick}
              aria-label="このレビューを報告"
            >
              <span className="report-icon">🚩</span>
            </button>
          )}

          {canDelete && (
            <button
              className="delete-button"
              onClick={handleDeleteClick}
              aria-label="このレビューを削除"
            >
              <span className="delete-icon">🗑️</span>
            </button>
          )}
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

      {/* 報告確認ダイアログ */}
      {showReportConfirm && (
        <div className="report-confirm-overlay">
          <div className="report-confirm-dialog">
            <h4>このレビューを報告しますか？</h4>
            <p>不適切な内容や誹謗中傷が含まれる場合に報告してください。</p>
            
            {reportSuccess ? (
              <div className="report-success">
                報告を受け付けました。
              </div>
            ) : (
              <div className="report-buttons">
                <button 
                  className="report-cancel-button"
                  onClick={() => setShowReportConfirm(false)}
                  disabled={isReporting}
                >
                  キャンセル
                </button>
                <button 
                  className="report-confirm-button"
                  onClick={confirmReport}
                  disabled={isReporting}
                >
                  {isReporting ? '報告中...' : '報告する'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <h4>このレビューを削除しますか？</h4>
            <p>削除したレビューは元に戻すことができません。</p>
            
            <div className="delete-buttons">
              <button 
                className="delete-cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button 
                className="delete-confirm-button"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}