// pages/map.tsx
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import InteractiveMap from "@/components/map/InteractiveMap";
import NoticeBanner from "@/components/NoticeBanner";

export default function MapPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // ページ読み込み時のローディング制御
  useEffect(() => {
    // 画像のプリロード完了を模擬
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Layout title="キャンパスマップ | キッチンカー探し">
      <div className="map-page-container">
        <div className="map-header">
          <h1 className="map-title">キャンパスマップ</h1>
          <p className="map-subtitle">各キャンパスのキッチンカースポットをチェックしよう</p>
        </div>
        
        <NoticeBanner
          title="最新情報"
          message="キッチンカーの出店情報は毎日更新されます。定期的にチェックして最新情報をご確認ください。"
          icon="📢"
        />
        
        {isLoading ? (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>マップデータを読み込み中...</p>
          </div>
        ) : (
          <InteractiveMap />
        )}
        
        <div className="map-features">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">スポットを探索</h3>
            <p className="feature-description">
              マップ上のマーカーをクリックして、各キッチンカースポットの詳細情報を表示します。
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3 className="feature-title">出店情報を確認</h3>
            <p className="feature-description">
              今日出店しているキッチンカーの情報や営業時間を簡単に確認できます。
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">どこでも確認</h3>
            <p className="feature-description">
              スマートフォンからもアクセス可能。移動中でも最新の出店情報をチェックできます。
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .map-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .map-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .map-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .map-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
        }
        
        .map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background-color: #f9fafb;
          border-radius: 0.75rem;
          color: #6b7280;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          margin-bottom: 1rem;
          border: 4px solid rgba(59, 130, 246, 0.2);
          border-left-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .map-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }
        
        .feature-card {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }
        
        .feature-description {
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.5;
        }
      `}</style>
    </Layout>
  );
}