// components/shop/ReviewItem.tsx
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { RatingStars } from './RatingStars';
import styles from '../../styles/ReviewItem.module.css';

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
        setShowReportConfirm(false);
        setReportSuccess(true);
        // 3秒後に成功メッセージを非表示にする
        setTimeout(() => {
          setReportSuccess(false);
        }, 3000);
      } else {
        setShowReportConfirm(false);
      }
    } catch (error) {
      console.error("レビュー報告エラー:", error);
      setShowReportConfirm(false);
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
    <div className={styles.reviewItem}>
      <div className={styles.reviewItemHeader}>
        <div className={styles.ratingStars}>
          <RatingStars rating={rating} />
        </div>
        <div className={styles.reviewActions}>
          <button 
            className={`${styles.likeButton} ${isLiked ? styles.liked : ''} ${isLikeAnimating ? styles.animating : ''}`}
            onClick={handleLikeClick}
          >
            {isLiked ? '❤️' : '🤍'} <span className={styles.likeCount}>{likeCount}</span>
          </button>
          
          {!canDelete && (
            <button
              className={styles.reportButton}
              onClick={handleReportClick}
              aria-label="このレビューを報告"
            >
              <span className="report-icon">🚩</span>
            </button>
          )}

          {canDelete && (
            <button
              className={styles.deleteButton}
              onClick={handleDeleteClick}
              aria-label="このレビューを削除"
            >
              <span className="delete-icon">🗑️</span>
            </button>
          )}
        </div>
      </div>
      <p className={styles.reviewComment}>{comment}</p>
      <div className={styles.reviewFooter}>
        <div className={styles.reviewAuthor}>
          <span>👤</span> {authorName || '匿名ユーザー'}
        </div>
        {formattedDate && (
          <div className={styles.reviewDate}>{formattedDate}</div>
        )}
      </div>

      {/* 報告成功メッセージ（インライン表示） */}
      {reportSuccess && (
        <div className={styles.reportSuccessMessage}>
          <div className={styles.successIcon}>✓</div>
          <span className={styles.successText}>報告を受け付けました</span>
        </div>
      )}

      {/* 報告確認ダイアログ */}
      {showReportConfirm && (
        <div className={styles.reportConfirmOverlay}>
          <div className={styles.reportConfirmDialog}>
            <h4>このレビューを報告しますか？</h4>
            <p>不適切な内容や誹謗中傷が含まれる場合に報告してください。</p>
            
            <div className={styles.reportButtons}>
              <button 
                className={styles.reportCancelButton}
                onClick={() => setShowReportConfirm(false)}
                disabled={isReporting}
              >
                キャンセル
              </button>
              <button 
                className={styles.reportConfirmButton}
                onClick={confirmReport}
                disabled={isReporting}
              >
                {isReporting ? '報告中...' : '報告する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className={styles.deleteConfirmOverlay}>
          <div className={styles.deleteConfirmDialog}>
            <h4>このレビューを削除しますか？</h4>
            <p>削除したレビューは元に戻すことができません。</p>
            
            <div className={styles.deleteButtons}>
              <button 
                className={styles.deleteCancelButton}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button 
                className={styles.deleteConfirmButton}
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