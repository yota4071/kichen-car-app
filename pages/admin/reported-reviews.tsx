// pages/admin/reported-reviews.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  collection, getDocs, doc, deleteDoc, getDoc, updateDoc,
  query, orderBy, where, Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Button from '@/components/ui/Button';
import NoticeBanner from '@/components/NoticeBanner';
import { checkIsAdmin } from '@/lib/admin';
import { RatingStars } from '@/components/shop/RatingStars';

type ReportedReview = {
  id: string;
  shopId: string;
  shopName: string;
  rating: number;
  comment: string;
  displayName: string;
  createdAt: Timestamp;
  reports: number;
  reportedBy: string[];
  userId: string;
  lastReportedAt?: Timestamp;
};

type FilterOption = 'all' | 'high' | 'medium' | 'low';
type SortOption = 'latest' | 'oldest' | 'most-reported' | 'least-reported';

const ReportedReviewsPage = () => {
  const [reportedReviews, setReportedReviews] = useState<ReportedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('most-reported');
  const [selectedReview, setSelectedReview] = useState<ReportedReview | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const router = useRouter();

  // 認証状態監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const isUserAdmin = await checkIsAdmin(user);
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // 報告されたレビューを取得
  useEffect(() => {
    const fetchReportedReviews = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      try {
        const kitchensRef = collection(db, "kitchens");
        const kitchensSnap = await getDocs(kitchensRef);
        
        const allReportedReviews: ReportedReview[] = [];
        
        // 各キッチンカーのレビューをチェック
        for (const kitchenDoc of kitchensSnap.docs) {
          const kitchenData = kitchenDoc.data();
          const reviewsRef = collection(db, "kitchens", kitchenDoc.id, "reviews");
          
          // 報告されたレビューのみを取得（reports > 0）
          const reviewsQuery = query(reviewsRef, where("reports", ">", 0));
          const reviewsSnap = await getDocs(reviewsQuery);
          
          reviewsSnap.docs.forEach(reviewDoc => {
            const reviewData = reviewDoc.data();
            allReportedReviews.push({
              id: reviewDoc.id,
              shopId: kitchenDoc.id,
              shopName: kitchenData.name || 'Unknown',
              rating: reviewData.rating || 0,
              comment: reviewData.comment || '',
              displayName: reviewData.displayName || '匿名ユーザー',
              createdAt: reviewData.createdAt,
              reports: reviewData.reports || 0,
              reportedBy: reviewData.reportedBy || [],
              userId: reviewData.userId || '',
              lastReportedAt: reviewData.lastReportedAt
            });
          });
        }
        
        setReportedReviews(allReportedReviews);
      } catch (error) {
        console.error("Error fetching reported reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchReportedReviews();
    }
  }, [isAdmin]);

  // フィルタリングとソート
  const getFilteredAndSortedReviews = () => {
    let filtered = reportedReviews;
    
    // フィルタリング
    switch (filter) {
      case 'high':
        filtered = reportedReviews.filter(review => review.reports >= 3);
        break;
      case 'medium':
        filtered = reportedReviews.filter(review => review.reports === 2);
        break;
      case 'low':
        filtered = reportedReviews.filter(review => review.reports === 1);
        break;
      case 'all':
      default:
        filtered = reportedReviews;
        break;
    }
    
    // ソート
    const sorted = [...filtered];
    switch (sortBy) {
      case 'most-reported':
        return sorted.sort((a, b) => b.reports - a.reports);
      case 'least-reported':
        return sorted.sort((a, b) => a.reports - b.reports);
      case 'latest':
        return sorted.sort((a, b) => {
          const aTime = a.lastReportedAt?.toMillis() || a.createdAt?.toMillis() || 0;
          const bTime = b.lastReportedAt?.toMillis() || b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return aTime - bTime;
        });
      default:
        return sorted;
    }
  };

  // レビューの詳細を表示
  const handleViewDetails = (review: ReportedReview) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  // レビューを削除
  const handleDeleteReview = async (review: ReportedReview) => {
    if (!confirm(`このレビューを削除してもよろしいですか？\n\n店舗: ${review.shopName}\nレビュー: ${review.comment.substring(0, 50)}...`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "kitchens", review.shopId, "reviews", review.id));
      
      // 状態を更新
      setReportedReviews(prev => prev.filter(r => r.id !== review.id || r.shopId !== review.shopId));
      setShowModal(false);
      
      alert("レビューを削除しました。");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("レビューの削除に失敗しました。");
    }
  };

  // レビューの報告をクリア（報告を無視）
  const handleClearReports = async (review: ReportedReview) => {
    if (!confirm(`このレビューの報告をクリアしてもよろしいですか？\n\n店舗: ${review.shopName}\nレビュー: ${review.comment.substring(0, 50)}...`)) {
      return;
    }
    
    try {
      const reviewRef = doc(db, "kitchens", review.shopId, "reviews", review.id);
      await updateDoc(reviewRef, {
        reports: 0,
        reportedBy: [],
        lastReportedAt: null
      });
      
      // 状態を更新
      setReportedReviews(prev => prev.filter(r => r.id !== review.id || r.shopId !== review.shopId));
      setShowModal(false);
      
      alert("報告をクリアしました。");
    } catch (error) {
      console.error("Error clearing reports:", error);
      alert("報告のクリアに失敗しました。");
    }
  };

  // 日付フォーマット
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp.toMillis()).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredAndSortedReviews = getFilteredAndSortedReviews();

  if (isLoading && user) {
    return (
      <Layout title="報告されたレビュー | 管理者ページ">
        <div className="container py-8">
          <LoadingIndicator message="報告されたレビューを読み込み中..." />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout title="アクセス権限エラー">
        <div className="container py-8">
          <NoticeBanner
            title="アクセス権限がありません"
            message="この機能を使用するには管理者としてログインする必要があります。"
            icon="⚠️"
          />
          <div className="flex justify-center mt-8">
            <Button href="/" variant="primary">
              ホームに戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="報告されたレビュー | 管理者ページ">
      <div className="admin-page-container py-8">
        <div className="admin-header">
          <h1 className="admin-title">報告されたレビュー管理</h1>
          <div className="admin-actions">
            <Button href="/admin" variant="secondary" className="mr-2">
              🏠 ダッシュボード
            </Button>
            <Button href="/admin/shops" variant="secondary" className="mr-2">
              店舗管理へ
            </Button>
            <Button href="/admin/notices" variant="secondary">
              お知らせ管理へ
            </Button>
          </div>
        </div>

        {/* フィルターとソート */}
        <div className="controls-section">
          <div className="filter-controls">
            <div className="control-group">
              <label>報告件数でフィルター:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as FilterOption)}
                className="control-select"
              >
                <option value="all">すべて ({reportedReviews.length}件)</option>
                <option value="high">高リスク (3件以上)</option>
                <option value="medium">中リスク (2件)</option>
                <option value="low">低リスク (1件)</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>並び替え:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="control-select"
              >
                <option value="most-reported">報告件数（多い順）</option>
                <option value="least-reported">報告件数（少ない順）</option>
                <option value="latest">最新の報告順</option>
                <option value="oldest">古いレビュー順</option>
              </select>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{reportedReviews.length}</div>
              <div className="stat-label">総報告件数</div>
            </div>
            <div className="stat-item high-risk">
              <div className="stat-value">{reportedReviews.filter(r => r.reports >= 3).length}</div>
              <div className="stat-label">高リスク (3件以上)</div>
            </div>
            <div className="stat-item medium-risk">
              <div className="stat-value">{reportedReviews.filter(r => r.reports === 2).length}</div>
              <div className="stat-label">中リスク (2件)</div>
            </div>
            <div className="stat-item low-risk">
              <div className="stat-value">{reportedReviews.filter(r => r.reports === 1).length}</div>
              <div className="stat-label">低リスク (1件)</div>
            </div>
          </div>
        </div>

        {/* レビュー一覧 */}
        <div className="reviews-section">
          <h2 className="section-title">
            報告されたレビュー一覧 
            <span className="count-badge">({filteredAndSortedReviews.length}件表示中)</span>
          </h2>
          
          {filteredAndSortedReviews.length === 0 ? (
            <div className="no-reviews-message">
              {filter === 'all' ? 
                "現在報告されているレビューはありません。" :
                "フィルター条件に該当するレビューはありません。"
              }
            </div>
          ) : (
            <div className="reviews-table-container">
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th className="w-1/6">店舗名</th>
                    <th className="w-1/6">投稿者</th>
                    <th className="w-1/12">評価</th>
                    <th className="w-2/5">コメント</th>
                    <th className="w-1/12">報告件数</th>
                    <th className="w-1/6">投稿日</th>
                    <th className="w-1/12">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedReviews.map((review) => (
                    <tr key={`${review.shopId}-${review.id}`} className={`review-row ${review.reports >= 3 ? 'high-risk-row' : review.reports >= 2 ? 'medium-risk-row' : 'low-risk-row'}`}>
                      <td className="shop-name">{review.shopName}</td>
                      <td>{review.displayName}</td>
                      <td>
                        <RatingStars rating={review.rating} size="sm" />
                      </td>
                      <td className="comment-cell">
                        <div className="comment-preview">
                          {review.comment.length > 80 ? 
                            `${review.comment.substring(0, 80)}...` : 
                            review.comment
                          }
                        </div>
                      </td>
                      <td>
                        <span className={`reports-badge ${review.reports >= 3 ? 'high' : review.reports >= 2 ? 'medium' : 'low'}`}>
                          {review.reports}件
                        </span>
                      </td>
                      <td>{formatDate(review.createdAt)}</td>
                      <td>
                        <button 
                          onClick={() => handleViewDetails(review)}
                          className="action-button view-button"
                          title="詳細を表示"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* レビュー詳細モーダル */}
        {showModal && selectedReview && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">レビュー詳細</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="review-detail-section">
                  <h3>基本情報</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>店舗名:</label>
                      <span>{selectedReview.shopName}</span>
                    </div>
                    <div className="detail-item">
                      <label>投稿者:</label>
                      <span>{selectedReview.displayName}</span>
                    </div>
                    <div className="detail-item">
                      <label>評価:</label>
                      <span><RatingStars rating={selectedReview.rating} size="sm" /></span>
                    </div>
                    <div className="detail-item">
                      <label>報告件数:</label>
                      <span className={`reports-badge ${selectedReview.reports >= 3 ? 'high' : selectedReview.reports >= 2 ? 'medium' : 'low'}`}>
                        {selectedReview.reports}件
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>投稿日:</label>
                      <span>{formatDate(selectedReview.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>最終報告日:</label>
                      <span>{formatDate(selectedReview.lastReportedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="review-detail-section">
                  <h3>コメント内容</h3>
                  <div className="comment-full">
                    {selectedReview.comment}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <Button 
                  onClick={() => handleClearReports(selectedReview)} 
                  variant="secondary"
                >
                  報告をクリア
                </Button>
                <Button 
                  onClick={() => handleDeleteReview(selectedReview)} 
                  variant="primary"
                  className="delete-button-modal"
                >
                  レビューを削除
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .admin-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
        }
        
        .admin-page-container {
          width: 100%;
          max-width: none;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .controls-section {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .filter-controls {
          display: flex;
          gap: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-group label {
          font-weight: 600;
          color: #4b5563;
          white-space: nowrap;
        }

        .control-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .stats-section {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          border-radius: 0.5rem;
          background-color: #f3f4f6;
        }

        .stat-item.high-risk {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .stat-item.medium-risk {
          background-color: #fef3c7;
          color: #d97706;
        }

        .stat-item.low-risk {
          background-color: #ecfdf5;
          color: #16a34a;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .reviews-section {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .count-badge {
          font-size: 0.875rem;
          background-color: #e5e7eb;
          color: #6b7280;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-weight: normal;
        }
        
        .reviews-table-container {
          overflow-x: auto;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .reviews-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }
        
        .reviews-table th {
          text-align: left;
          font-weight: 600;
          color: #4b5563;
          padding: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .reviews-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
          vertical-align: top;
        }

        .review-row.high-risk-row {
          background-color: #fef2f2;
        }

        .review-row.medium-risk-row {
          background-color: #fffbeb;
        }

        .review-row.low-risk-row {
          background-color: #f0fdf4;
        }

        .shop-name {
          font-weight: 600;
        }

        .comment-cell {
          max-width: 300px;
        }

        .comment-preview {
          word-break: break-word;
          line-height: 1.4;
        }

        .reports-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .reports-badge.high {
          background-color: #dc2626;
          color: white;
        }

        .reports-badge.medium {
          background-color: #d97706;
          color: white;
        }

        .reports-badge.low {
          background-color: #16a34a;
          color: white;
        }
        
        .action-button {
          width: 32px;
          height: 32px;
          border-radius: 0.375rem;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .view-button {
          background-color: #dbeafe;
        }
        
        .view-button:hover {
          background-color: #bfdbfe;
        }
        
        .no-reviews-message {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          border: 2px dashed #d1d5db;
        }

        /* モーダルスタイル */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background-color: #f3f4f6;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.5rem;
          line-height: 1;
        }

        .modal-close:hover {
          background-color: #e5e7eb;
          color: #374151;
          transform: scale(1.05);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2rem;
        }

        .review-detail-section {
          margin-bottom: 1.5rem;
        }

        .review-detail-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          font-weight: 600;
          color: #4b5563;
          font-size: 0.875rem;
        }

        .detail-item span {
          color: #1f2937;
        }

        .comment-full {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.6;
          color: #1f2937;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 2rem 1.5rem 2rem;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }

        .delete-button-modal {
          background-color: #dc2626 !important;
        }

        .delete-button-modal:hover {
          background-color: #b91c1c !important;
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .admin-page-container {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .admin-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .admin-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .filter-controls {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .control-group {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-content {
            max-width: 100%;
            max-height: 95vh;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ReportedReviewsPage;