// pages/404.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';

export default function Custom404() {
  const [countdown, setCountdown] = useState(10);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  // 10秒後に自動的にホームページにリダイレクト
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // 手動でホームに戻る
  const goHome = () => {
    setIsRedirecting(true);
    router.push('/');
  };

  return (
    <Layout title="ページが見つかりません | NOM!NOM!">
      <div className="error-container">
        <div className="error-content">
          {/* 404イラスト */}
          <div className="error-illustration">
            <div className="food-truck">
              🚚
            </div>
            <div className="error-number">404</div>
            <div className="floating-food">
              <span className="food-item">🍕</span>
              <span className="food-item">🍔</span>
              <span className="food-item">🌮</span>
            </div>
          </div>

          {/* エラーメッセージ */}
          <div className="error-message">
            <h1 className="error-title">
              おっと！キッチンカーが迷子になってしまいました
            </h1>
            <p className="error-description">
              お探しのページは見つかりませんでした。<br />
              URLが間違っているか、ページが移動または削除された可能性があります。
            </p>
          </div>

          {/* アクションボタン */}
          <div className="error-actions">
            <Button 
              onClick={goHome}
              variant="primary"
              className="home-button"
              disabled={isRedirecting}
            >
              {isRedirecting ? '移動中...' : 'ホームに戻る'}
            </Button>
            
            <div className="helpful-links">
              <Link href="/categories" className="helpful-link">
                キッチンカーを探す
              </Link>
              <Link href="/map" className="helpful-link">
                マップで確認
              </Link>
              <Link href="/search" className="helpful-link">
                検索ページ
              </Link>
              <Link href="/contact" className="helpful-link">
                お問い合わせ
              </Link>
            </div>
          </div>

          {/* 自動リダイレクトカウントダウン */}
          <div className="countdown-section">
            <p className="countdown-text">
              {isRedirecting ? (
                'ホームページに移動しています...'
              ) : (
                <>
                  <span className="countdown-number">{countdown}</span>秒後に自動的にホームページに移動します
                </>
              )}
            </p>
          </div>

          {/* おすすめセクション */}
          <div className="suggestions">
            <h3 className="suggestions-title">こちらもおすすめ</h3>
            <div className="suggestion-cards">
              <Link href="/categories" className="suggestion-card">
                <div className="suggestion-icon">🍽️</div>
                <div className="suggestion-content">
                  <h4>カテゴリーから探す</h4>
                  <p>料理ジャンル別にキッチンカーを探せます</p>
                </div>
              </Link>
              
              <Link href="/map" className="suggestion-card">
                <div className="suggestion-icon">🗺️</div>
                <div className="suggestion-content">
                  <h4>マップで探す</h4>
                  <p>現在地周辺のキッチンカーを確認</p>
                </div>
              </Link>
              
              <Link href="/calendar" className="suggestion-card">
                <div className="suggestion-icon">📅</div>
                <div className="suggestion-content">
                  <h4>出店予定</h4>
                  <p>今後の出店スケジュールをチェック</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .error-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .error-content {
          max-width: 600px;
          text-align: center;
        }

        .error-illustration {
          position: relative;
          margin-bottom: 3rem;
          padding: 2rem;
        }

        .food-truck {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
        }

        .error-number {
          font-size: 6rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 1rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .floating-food {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .food-item {
          position: absolute;
          font-size: 2rem;
          animation: float 3s ease-in-out infinite;
        }

        .food-item:nth-child(1) {
          top: 20%;
          left: 15%;
          animation-delay: 0s;
        }

        .food-item:nth-child(2) {
          top: 40%;
          right: 20%;
          animation-delay: 1s;
        }

        .food-item:nth-child(3) {
          bottom: 30%;
          left: 25%;
          animation-delay: 2s;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .error-message {
          margin-bottom: 3rem;
        }

        .error-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .error-description {
          font-size: 1.1rem;
          color: var(--text-light);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .error-actions {
          margin-bottom: 3rem;
        }

        .home-button {
          margin-bottom: 2rem;
          padding: 0.75rem 2rem;
          font-size: 1.1rem;
        }

        .helpful-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }

        .helpful-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          border: 1px solid var(--border-color);
          background-color: white;
        }

        .helpful-link:hover {
          background-color: var(--primary-light);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .countdown-section {
          margin-bottom: 3rem;
          padding: 1.5rem;
          background-color: var(--bg-color);
          border-radius: 1rem;
          border: 1px solid var(--border-color);
        }

        .countdown-text {
          font-size: 1rem;
          color: var(--text-light);
          margin: 0;
        }

        .countdown-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .suggestions {
          margin-top: 3rem;
        }

        .suggestions-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1.5rem;
        }

        .suggestion-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .suggestion-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          text-decoration: none;
          color: inherit;
          transition: all 0.3s;
          border: 1px solid var(--border-color);
        }

        .suggestion-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--primary-medium);
        }

        .suggestion-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .suggestion-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.25rem;
        }

        .suggestion-content p {
          font-size: 0.875rem;
          color: var(--text-light);
          margin: 0;
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .error-container {
            padding: 1rem;
            min-height: 70vh;
          }

          .error-number {
            font-size: 4rem;
          }

          .error-title {
            font-size: 1.5rem;
          }

          .error-description {
            font-size: 1rem;
          }

          .food-truck {
            font-size: 3rem;
          }

          .food-item {
            font-size: 1.5rem;
          }

          .helpful-links {
            gap: 0.5rem;
          }

          .helpful-link {
            font-size: 0.875rem;
            padding: 0.375rem 0.75rem;
          }

          .suggestion-cards {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .suggestion-card {
            padding: 1rem;
            flex-direction: column;
            text-align: center;
          }
        }

        /* 動作軽減設定 */
        @media (prefers-reduced-motion: reduce) {
          .food-truck,
          .food-item,
          .countdown-number {
            animation: none;
          }
          
          .suggestion-card:hover {
            transform: none;
          }
        }
      `}</style>
    </Layout>
  );
}