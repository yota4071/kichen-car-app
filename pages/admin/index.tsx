// pages/admin/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Button from '@/components/ui/Button';
import NoticeBanner from '@/components/NoticeBanner';
import { checkIsAdmin } from '@/lib/admin';

type AdminStats = {
  totalShops: number;
  totalReportedReviews: number;
  highRiskReviews: number;
  totalNotices: number;
};

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalShops: 0,
    totalReportedReviews: 0,
    highRiskReviews: 0,
    totalNotices: 0
  });
  
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

  // 統計データを取得
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      try {
        // 店舗数を取得
        const kitchensRef = collection(db, "kitchens");
        const kitchensSnap = await getDocs(kitchensRef);
        const totalShops = kitchensSnap.size;

        // 報告されたレビューを取得
        let totalReportedReviews = 0;
        let highRiskReviews = 0;

        for (const kitchenDoc of kitchensSnap.docs) {
          const reviewsRef = collection(db, "kitchens", kitchenDoc.id, "reviews");
          const reportedReviewsQuery = query(reviewsRef, where("reports", ">", 0));
          const reportedReviewsSnap = await getDocs(reportedReviewsQuery);
          
          reportedReviewsSnap.docs.forEach(reviewDoc => {
            const reviewData = reviewDoc.data();
            totalReportedReviews++;
            if (reviewData.reports >= 3) {
              highRiskReviews++;
            }
          });
        }

        // お知らせ数を取得（存在する場合）
        let totalNotices = 0;
        try {
          const noticesRef = collection(db, "notices");
          const noticesSnap = await getDocs(noticesRef);
          totalNotices = noticesSnap.size;
        } catch (error) {
          // お知らせコレクションが存在しない場合は0のまま
        }

        setStats({
          totalShops,
          totalReportedReviews,
          highRiskReviews,
          totalNotices
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (isLoading && user) {
    return (
      <Layout title="管理者ダッシュボード">
        <div className="container py-8">
          <LoadingIndicator message="ダッシュボードを読み込み中..." />
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
    <Layout title="管理者ダッシュボード">
      <div className="admin-dashboard-container py-8">
        {/* ヘッダー */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">管理者ダッシュボード</h1>
            <p className="dashboard-subtitle">システム全体の管理と監視</p>
          </div>
          <div className="user-info">
            <span className="welcome-text">ようこそ、{user.displayName || user.email}さん</span>
          </div>
        </div>

        {/* 統計カード */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏪</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalShops}</div>
                <div className="stat-label">登録店舗数</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📢</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalNotices}</div>
                <div className="stat-label">お知らせ数</div>
              </div>
            </div>
            
            <div className={`stat-card ${stats.totalReportedReviews > 0 ? 'warning' : ''}`}>
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalReportedReviews}</div>
                <div className="stat-label">報告されたレビュー</div>
              </div>
            </div>
            
            <div className={`stat-card ${stats.highRiskReviews > 0 ? 'danger' : ''}`}>
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{stats.highRiskReviews}</div>
                <div className="stat-label">高リスクレビュー</div>
              </div>
            </div>
          </div>
        </div>

        {/* 管理メニュー */}
        <div className="admin-menu-section">
          <h2 className="section-title">管理メニュー</h2>
          <div className="menu-grid">
            {/* 店舗管理 */}
            <div className="menu-card">
              <div className="menu-header">
                <div className="menu-icon">🏪</div>
                <h3 className="menu-title">店舗管理</h3>
              </div>
              <p className="menu-description">
                キッチンカーの登録・編集・削除、メニュー管理を行います
              </p>
              <div className="menu-stats">
                <span className="menu-stat-item">登録店舗: {stats.totalShops}件</span>
              </div>
              <div className="menu-actions">
                <Button href="/admin/shops" variant="primary" className="w-full">
                  店舗管理へ
                </Button>
              </div>
            </div>

            {/* レビュー管理 */}
            <div className="menu-card">
              <div className="menu-header">
                <div className="menu-icon">🚨</div>
                <h3 className="menu-title">報告レビュー管理</h3>
              </div>
              <p className="menu-description">
                ユーザーから報告されたレビューの確認・削除を行います
              </p>
              <div className="menu-stats">
                <span className="menu-stat-item">報告レビュー: {stats.totalReportedReviews}件</span>
                {stats.highRiskReviews > 0 && (
                  <span className="menu-stat-item danger">高リスク: {stats.highRiskReviews}件</span>
                )}
              </div>
              <div className="menu-actions">
                <Button 
                  href="/admin/reported-reviews" 
                  variant={stats.totalReportedReviews > 0 ? "primary" : "secondary"}
                  className="w-full"
                >
                  レビュー管理へ
                </Button>
              </div>
            </div>

            {/* お知らせ管理 */}
            <div className="menu-card">
              <div className="menu-header">
                <div className="menu-icon">📢</div>
                <h3 className="menu-title">お知らせ管理</h3>
              </div>
              <p className="menu-description">
                サイト全体のお知らせやバナーの管理を行います
              </p>
              <div className="menu-stats">
                <span className="menu-stat-item">お知らせ: {stats.totalNotices}件</span>
              </div>
              <div className="menu-actions">
                <Button href="/admin/notices" variant="primary" className="w-full">
                  お知らせ管理へ
                </Button>
              </div>
            </div>

            {/* PRカード管理 */}
            <div className="menu-card">
              <div className="menu-header">
                <div className="menu-icon">🎯</div>
                <h3 className="menu-title">PRカード管理</h3>
              </div>
              <p className="menu-description">
                トップページのPRカードの管理を行います
              </p>
              <div className="menu-stats">
                <span className="menu-stat-item">PRカード管理</span>
              </div>
              <div className="menu-actions">
                <Button href="/admin/pr-cards" variant="primary" className="w-full">
                  PRカード管理へ
                </Button>
              </div>
            </div>

            {/* カレンダー管理 */}
            <div className="menu-card">
              <div className="menu-header">
                <div className="menu-icon">📅</div>
                <h3 className="menu-title">カレンダー管理</h3>
              </div>
              <p className="menu-description">
                出店スケジュールや営業カレンダーの管理を行います
              </p>
              <div className="menu-stats">
                <span className="menu-stat-item">スケジュール管理</span>
              </div>
              <div className="menu-actions">
                <Button href="/admin/calendar" variant="primary" className="w-full">
                  カレンダー管理へ
                </Button>
              </div>
            </div>

            {/* システム設定 */}
            <div className="menu-card">
              <div className="menu-header">
                <div className="menu-icon">⚙️</div>
                <h3 className="menu-title">システム設定</h3>
              </div>
              <p className="menu-description">
                システム全体の設定や管理者権限の管理を行います
              </p>
              <div className="menu-stats">
                <span className="menu-stat-item">システム管理</span>
              </div>
              <div className="menu-actions">
                <Button href="/" variant="secondary" className="w-full">
                  準備中
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* アラート情報 */}
        {(stats.totalReportedReviews > 0 || stats.highRiskReviews > 0) && (
          <div className="alerts-section">
            <h2 className="section-title">⚠️ 注意が必要な項目</h2>
            <div className="alerts-grid">
              {stats.highRiskReviews > 0 && (
                <div className="alert-card danger">
                  <div className="alert-icon">🚨</div>
                  <div className="alert-content">
                    <h3 className="alert-title">高リスクレビューがあります</h3>
                    <p className="alert-description">
                      {stats.highRiskReviews}件のレビューが3回以上報告されています。確認が必要です。
                    </p>
                    <Button href="/admin/reported-reviews?filter=high" variant="primary">
                      今すぐ確認
                    </Button>
                  </div>
                </div>
              )}
              
              {stats.totalReportedReviews > stats.highRiskReviews && (
                <div className="alert-card warning">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <h3 className="alert-title">報告されたレビューがあります</h3>
                    <p className="alert-description">
                      {stats.totalReportedReviews - stats.highRiskReviews}件のレビューが報告されています。
                    </p>
                    <Button href="/admin/reported-reviews" variant="secondary">
                      確認する
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ホームへ戻るボタン */}
        <div className="back-section">
          <Button href="/" variant="secondary">
            サイトのホームに戻る
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        .admin-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          color: #6b7280;
          font-size: 1.125rem;
        }

        .user-info {
          text-align: right;
        }

        .welcome-text {
          color: #4b5563;
          font-weight: 500;
        }

        .stats-section {
          margin-bottom: 3rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .stat-card.warning {
          border-left: 4px solid #f59e0b;
        }

        .stat-card.danger {
          border-left: 4px solid #ef4444;
        }

        .stat-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 0.75rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .admin-menu-section,
        .alerts-section {
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .menu-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .menu-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
          border-color: #d1d5db;
        }

        .menu-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .menu-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 0.5rem;
        }

        .menu-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .menu-description {
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .menu-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .menu-stat-item {
          background: #f3f4f6;
          color: #4b5563;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .menu-stat-item.danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .menu-actions {
          margin-top: auto;
        }

        .alerts-grid {
          display: grid;
          gap: 1rem;
        }

        .alert-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .alert-card.warning {
          border-left: 4px solid #f59e0b;
          background: #fffbeb;
        }

        .alert-card.danger {
          border-left: 4px solid #ef4444;
          background: #fef2f2;
        }

        .alert-icon {
          font-size: 1.5rem;
          width: 40px;
          flex-shrink: 0;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .alert-description {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .back-section {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .admin-dashboard-container {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .dashboard-title {
            font-size: 1.875rem;
          }

          .user-info {
            text-align: left;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .menu-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-card,
          .menu-card {
            padding: 1rem;
          }

          .alert-card {
            flex-direction: column;
            text-align: center;
          }

          .alert-icon {
            align-self: center;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AdminDashboard;