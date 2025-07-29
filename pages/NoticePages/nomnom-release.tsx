// pages/NoticePages/nomnom-release.tsx
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';

export default function NomNomReleasePage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'search',
      title: 'キッチンカー検索',
      description: 'お好みの料理やキッチンカーを素早く見つけることができます',
      icon: '🔍',
      details: [
        '料理ジャンル別検索',
        'キーワード検索',
        '評価・レビューでソート',
        'お気に入り機能'
      ]
    },
    {
      id: 'map',
      title: 'リアルタイムマップ',
      description: 'キャンパス内のキッチンカーの位置をリアルタイムで確認',
      icon: '🗺️',
      details: [
        'インタラクティブマップ',
        '現在地からの距離表示',
        '出店スポット詳細',
        '営業時間確認'
      ]
    },
    {
      id: 'schedule',
      title: '出店スケジュール',
      description: '今日から来週までの出店予定を一目で確認できます',
      icon: '📅',
      details: [
        'カレンダー表示',
        '週間スケジュール',
        'キッチンカー別予定',
        'お知らせ通知'
      ]
    },
    {
      id: 'reviews',
      title: 'レビュー・評価',
      description: '実際に利用した学生の口コミや評価を参考にできます',
      icon: '⭐',
      details: [
        '5段階評価システム',
        '写真付きレビュー',
        'おすすめメニュー',
        'コメント機能'
      ]
    }
  ];

  const stats = [
    { number: '50+', label: 'キッチンカー登録数', icon: '🚚' },
    { number: '1000+', label: '学生ユーザー', icon: '👥' },
    { number: '15', label: '出店スポット', icon: '📍' },
    { number: '4.8', label: '平均評価', icon: '⭐' }
  ];

  return (
    <Layout title="Nom!Nom! リリースのお知らせ | キッチンカー探し">
      {/* ヒーローセクション */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="announcement-badge">
              <span className="badge-text">🎉 ついにリリース！</span>
            </div>
            
            <h1 className="hero-title">
              <span className="brand-name">NomNom!</span>
              <br />
              キャンパスキッチンカー検索サービス
            </h1>
            
            <p className="hero-description">
              立命館大学の学生のために作られた、キッチンカー専用の検索・情報サービスがついにリリース！
              <br />
              美味しい食事をもっと身近に、もっと簡単に見つけられます。
            </p>
            
            <div className="hero-actions">
              <Button href="/categories" variant="primary" className="cta-button">
                さっそく使ってみる
              </Button>
              <Button href="/about" variant="secondary" className="about-button">
                サービスについて
              </Button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="app-interface">
                  <div className="app-header">
                    <div className="app-logo">NomNom!</div>
                    <div className="search-bar">🔍 キッチンカーを探す</div>
                  </div>
                  <div className="app-content">
                    <div className="food-card">🍕 イタリアンキッチン</div>
                    <div className="food-card">🍔 ハンバーガー専門店</div>
                    <div className="food-card">🌮 タコス・メキシカン</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主要機能セクション */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">主要機能</h2>
            <p className="section-subtitle">
              NomNom!の便利な機能をご紹介します
            </p>
          </div>
          
          <div className="features-container">
            <div className="features-tabs">
              {features.map((feature, index) => (
                <button
                  key={feature.id}
                  className={`feature-tab ${activeFeature === index ? 'active' : ''}`}
                  onClick={() => setActiveFeature(index)}
                >
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-name">{feature.title}</span>
                </button>
              ))}
            </div>
            
            <div className="feature-content">
              <div className="feature-details">
                <h3 className="feature-title">
                  {features[activeFeature].icon} {features[activeFeature].title}
                </h3>
                <p className="feature-description">
                  {features[activeFeature].description}
                </p>
                <ul className="feature-list">
                  {features[activeFeature].details.map((detail, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-check">✅</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="stats-section">
        <div className="container">
          <h2 className="stats-title">サービス開始時点での数字</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="how-to-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">使い方</h2>
            <p className="section-subtitle">
              3ステップでキッチンカーを見つけよう
            </p>
          </div>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">検索またはマップでキッチンカーを探す</h3>
                <p className="step-description">
                  料理ジャンルやキーワードで検索するか、マップで現在地周辺のキッチンカーを確認
                </p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">詳細情報とレビューを確認</h3>
                <p className="step-description">
                  メニュー、価格、営業時間、他の学生のレビューをチェックして最適な選択を
                </p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">お気に入りに追加して次回も利用</h3>
                <p className="step-description">
                  気に入ったキッチンカーはお気に入りに追加して、いつでも簡単にアクセス
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">今すぐNomNom!を使ってみよう</h2>
            <p className="cta-description">
              キャンパスライフをもっと美味しく、もっと便利に
            </p>
            <div className="cta-actions">
              <Button href="/categories" variant="primary" className="main-cta">
                キッチンカーを探す
              </Button>
              <Button href="/map" variant="secondary" className="map-cta">
                マップで確認
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* リリース情報 */}
      <section className="release-info">
        <div className="container">
          <div className="release-details">
            <h3 className="release-title">リリース情報</h3>
            <div className="release-grid">
              <div className="release-item">
                <strong>リリース日:</strong> 2025年6月21日
              </div>
              <div className="release-item">
                <strong>バージョン:</strong> 1.0.0
              </div>
              <div className="release-item">
                <strong>対応キャンパス:</strong> 立命館大学（順次拡大予定）
              </div>
              <div className="release-item">
                <strong>開発チーム:</strong> <Link href="/about" className="team-link">Qurest</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`

        
        .hero-section {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
          color: white;
          padding: 4rem 1rem;
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow-x: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          z-index: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          position: relative;
          z-index: 1;
          width: 100%;
          box-sizing: border-box;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          max-width: 100%;
          overflow-x: hidden;
        }

        .announcement-badge {
          display: flex;
          margin-bottom: 1.5rem;
          text-align: center;
          justify-content: flex-start;
          width: 100%
        }

        .badge-text {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          white-space: nowrap;
          writing-mode: horizontal-tb;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .brand-name {
          color: #FFE4B5;
          font-family: 'Bangers', cursive;
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .cta-button, .about-button {
          padding: 0.75rem 2rem;
          font-weight: 600;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .phone-mockup {
          width: 200px;
          height: 400px;
          background: #000;
          border-radius: 25px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .phone-screen {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }

        .app-interface {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background: var(--primary-color);
          color: white;
          padding: 1rem;
          text-align: center;
        }

        .app-logo {
          font-family: 'Bangers', cursive;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .search-bar {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem;
          border-radius: 20px;
          font-size: 0.8rem;
        }

        .app-content {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .food-card {
          background: var(--bg-color);
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          border: 1px solid var(--border-color);
        }

        .features-section, .how-to-section {
          padding: 4rem 0;
          background-color: var(--bg-color);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: var(--text-light);
        }

        .features-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
          align-items: start;
        }

        .features-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .feature-tab {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border: 2px solid var(--border-color);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
        }

        .feature-tab.active {
          border-color: var(--primary-color);
          background: var(--primary-light);
        }

        .feature-tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .feature-name {
          font-weight: 600;
          color: var(--text-color);
        }

        .feature-content {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-color);
        }

        .feature-description {
          font-size: 1.1rem;
          color: var(--text-light);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .feature-list {
          list-style: none;
          padding: 0;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          color: var(--text-color);
        }

        .stats-section {
          padding: 4rem 0;
          background: white;
        }

        .stats-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 3rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
          background: var(--bg-color);
          border-radius: 1rem;
          border: 1px solid var(--border-color);
          transition: transform 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-light);
          font-weight: 500;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .step {
          display: flex;
          gap: 1.5rem;
          padding: 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .step-number {
          width: 3rem;
          height: 3rem;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.75rem;
        }

        .step-description {
          color: var(--text-light);
          line-height: 1.6;
        }

        .cta-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
          color: white;
          text-align: center;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-description {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .main-cta, .map-cta {
          padding: 0.75rem 2rem;
          font-weight: 600;
        }

        .release-info {
          padding: 3rem 0;
          background: white;
        }

        .release-details {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .release-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 2rem;
        }

        .release-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          text-align: left;
        }

        .release-item {
          padding: 1rem;
          background: var(--bg-color);
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
        }

        .team-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
        }

        .team-link:hover {
          text-decoration: underline;
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .hero-section {
            padding: 2rem 0.5rem;
            min-height: auto;
          }

          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }

          .hero-title {
            font-size: 2rem;
            line-height: 1.3;
          }

          .hero-description {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }

          .hero-actions {
            flex-direction: column;
            gap: 0.75rem;
            align-items: center;
          }

          .cta-button, .about-button {
            width: 100%;
            max-width: 280px;
            padding: 0.875rem 1.5rem;
          }

          .features-container {
            grid-template-columns: 1fr;
          }

          .features-tabs {
            flex-direction: row;
            overflow-x: auto;
            gap: 1rem;
            padding-bottom: 1rem;
          }

          .feature-tab {
            min-width: 200px;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem 0.75rem;
          }

          .cta-actions {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .main-cta, .map-cta {
            width: 100%;
            max-width: 280px;
          }

          .phone-mockup {
            width: 180px;
            height: 360px;
            padding: 15px;
          }

          .container {
            padding: 0 0.75rem;
          }

          .announcement-badge {
            justify-content: center;
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 1.5rem 0.5rem;
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .brand-name {
            display: block;
            margin-bottom: 0.5rem;
          }

          .hero-description {
            font-size: 0.95rem;
          }

          .phone-mockup {
            width: 160px;
            height: 320px;
          }

          .container {
            padding: 0 0.5rem;
          }
        }
      `}</style>
    </Layout>
  );
}