// pages/NoticePages/nomnom-release.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';

export default function NomNomReleasePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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
    { number: '20+', label: 'キッチンカー登録数', icon: '🚚' },
    { number: '---', label: 'ユーザー数（集計中）', icon: '👥' },
    { number: '2', label: '出店スポット', icon: '📍' },
    { number: '4.6', label: '平均評価', icon: '⭐' }
  ];

  const testimonials = [
    {
      name: 'りっちゃん',
      department: '情報理工学部 3年',
      rating: 5,
      comment: 'キッチンカーを探すのがこんなに簡単になるなんて！マップ機能が特に便利で、授業の合間にサクッと美味しいランチを見つけられます。',
      avatar: '👩‍💻'
    },
    {
      name: 'たけ',
      department: '経営学部 2年',
      rating: 5,
      comment: 'レビュー機能がすごく参考になる。他の学生のリアルな声が聞けるから、失敗しないキッチンカー選びができています。',
      avatar: '👨‍🎓'
    },
    {
      name: 'あーちゃん',
      department: '国際関係学部 4年',
      rating: 4,
      comment: 'スケジュール機能で来週の出店予定まで分かるのが嬉しい！お気に入りのキッチンカーをフォローして通知も受けられるので便利です。',
      avatar: '👩‍📚'
    }
  ];

  const screenshots = [
    {
      title: 'ホーム画面',
      description: '今日のキッチンカーと人気カテゴリーを一目で確認',
      image: '/images/app-home.jpg'
    },
    {
      title: 'マップ機能',
      description: 'リアルタイムでキッチンカーの位置を確認',
      image: '/images/app-map.jpg'
    },
    {
      title: 'レビュー画面',
      description: '写真付きレビューで詳細な情報をチェック',
      image: '/images/app-reviews.jpg'
    }
  ];

  const faqs = [
    {
      question: 'NomNom!は無料で使えますか？',
      answer: 'はい、NomNom!は完全無料でご利用いただけます。アプリのダウンロード、利用、すべての機能に料金はかかりません。'
    },
    {
      question: 'キッチンカーの情報はリアルタイムで更新されますか？',
      answer: '営業時間や出店状況は定期的に更新されますが、天候やその他の事情により急遽変更になる場合があります。最新情報はキッチンカーに直接確認していただくことをお勧めします。'
    },
    {
      question: 'レビューの投稿にはアカウント登録が必要ですか？',
      answer: 'はい、レビューの投稿やお気に入り機能の利用には無料のアカウント登録が必要です。Googleアカウントで簡単に登録できます。'
    },
    {
      question: '他のキャンパスでも利用できますか？',
      answer: '現在は立命館大学のキャンパス内のキッチンカー情報のみ提供していますが、今後他大学への展開も検討しています。'
    },
    {
      question: '新しいキッチンカーの情報を追加してもらえますか？',
      answer: 'はい！お問い合わせフォームから新しいキッチンカーの情報をお送りください。運営チームで確認後、データベースに追加いたします。'
    }
  ];

  // 動的サイズ調整のためのEffect
  useEffect(() => {
    const updateViewport = () => {
      if (typeof window !== 'undefined') {
        setViewportHeight(window.innerHeight);
        setIsMobile(window.innerWidth <= 768);
      }
    };

    // 初回実行
    updateViewport();

    // リサイズ時の更新
    window.addEventListener('resize', updateViewport);
    
    // オリエンテーション変更時の更新（モバイル対応）
    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewport, 100);
    });

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  // 動的スタイルの計算
  const dynamicHeroStyle = {
    minHeight: isMobile ? `${Math.min(viewportHeight * 0.85, 600)}px` : '600px',
    maxHeight: isMobile ? `${viewportHeight}px` : 'none'
  };

  return (
    <Layout title="Nom!Nom! リリースのお知らせ | キッチンカー探し">
      {/* ヒーローセクション */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            🎉 ついにリリース！
          </div>
          
          <h1 className="hero-title">
            <span className="brand-name">NomNom!</span>
            <span className="service-name">キッチンカー検索サービス</span>
          </h1>
          
          <p className="hero-description">
            立命館大学のキッチンカーを簡単に検索・発見
          </p>
          
          <div className="hero-buttons">
            <Button href="/categories" variant="primary" className="primary-btn">
              今すぐ使ってみる
            </Button>
            <Button href="/about" variant="secondary" className="secondary-btn">
              詳細を見る
            </Button>
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

      {/* スクリーンショットセクション */}
      <section className="screenshots-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">アプリスクリーンショット</h2>
            <p className="section-subtitle">
              実際の画面でNomNom!の使いやすさを確認してみてください
            </p>
          </div>
          
          <div className="screenshots-grid">
            {screenshots.map((screenshot, index) => (
              <div key={index} className="screenshot-card">
                <div className="screenshot-image">
                  <div className="placeholder-image">
                    📱 {screenshot.title}
                  </div>
                </div>
                <div className="screenshot-info">
                  <h3 className="screenshot-title">{screenshot.title}</h3>
                  <p className="screenshot-description">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ユーザーレビューセクション */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">学生からの評価</h2>
            <p className="section-subtitle">
              実際に使っている学生の皆さんからの声をお聞きください
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-department">{testimonial.department}</p>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < testimonial.rating ? 'filled' : 'empty'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
          
          <div className="rating-summary">
            <div className="overall-rating">
              <div className="rating-number">4.6</div>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star filled">⭐</span>
                ))}
              </div>
              <div className="rating-count">15件のレビュー</div>
            </div>
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

      {/* FAQセクション */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">よくある質問</h2>
            <p className="section-subtitle">
              NomNom!についてよくお寄せいただく質問にお答えします
            </p>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-question ${activeFAQ === index ? 'active' : ''}`}
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                >
                  <span className="faq-q-text">{faq.question}</span>
                  <span className="faq-icon">
                    {activeFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {activeFAQ === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="faq-contact">
            <p>他にご質問がございましたら、<Link href="/contact" className="contact-link">お問い合わせフォーム</Link>からお気軽にご連絡ください。</p>
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
        /* ヒーローセクション - 完全リニューアル */
        .hero-section {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
          color: white;
          padding: 4rem 1rem;
          text-align: center;
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: -20%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          z-index: 0;
        }

        .hero-container {
          max-width: 800px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-title {
          margin-bottom: 1.5rem;
        }

        .brand-name {
          display: block;
          font-family: 'Bangers', cursive;
          font-size: 4rem;
          color: #FFE4B5;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .service-name {
          display: block;
          font-size: 1.8rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .hero-description {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .primary-btn, .secondary-btn {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s ease;
          min-width: 160px;
          text-align: center;
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

        /* スクリーンショットセクション */
        .screenshots-section {
          padding: 4rem 0;
          background: white;
        }

        .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .screenshot-card {
          background: var(--bg-color);
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .screenshot-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .screenshot-image {
          height: 200px;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--border-color);
        }

        .placeholder-image {
          font-size: 2rem;
          color: var(--primary-color);
          font-weight: 600;
        }

        .screenshot-info {
          padding: 1.5rem;
        }

        .screenshot-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .screenshot-description {
          color: var(--text-light);
          line-height: 1.5;
        }

        /* レビューセクション */
        .testimonials-section {
          padding: 4rem 0;
          background: var(--bg-color);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s;
        }

        .testimonial-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .testimonial-avatar {
          width: 3rem;
          height: 3rem;
          background: var(--primary-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .testimonial-info {
          flex: 1;
        }

        .testimonial-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 0.25rem 0;
        }

        .testimonial-department {
          font-size: 0.875rem;
          color: var(--text-light);
          margin: 0;
        }

        .testimonial-rating {
          display: flex;
          gap: 0.125rem;
        }

        .star {
          font-size: 1rem;
        }

        .star.filled {
          color: #ffc107;
        }

        .star.empty {
          color: #e9ecef;
        }

        .testimonial-comment {
          color: var(--text-color);
          line-height: 1.6;
          font-style: italic;
          margin: 0;
        }

        .rating-summary {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 1rem;
          border: 2px solid var(--primary-color);
          max-width: 400px;
          margin: 0 auto;
        }

        .overall-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--primary-color);
        }

        .rating-stars {
          display: flex;
          gap: 0.25rem;
        }

        .rating-count {
          color: var(--text-light);
          font-size: 0.875rem;
        }

        /* FAQセクション */
        .faq-section {
          padding: 4rem 0;
          background: white;
        }

        .faq-list {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          padding: 1.5rem;
          background: white;
          border: none;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .faq-question:hover {
          background: var(--bg-color);
        }

        .faq-question.active {
          background: var(--primary-light);
        }

        .faq-q-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
        }

        .faq-icon {
          font-size: 1.5rem;
          color: var(--primary-color);
          font-weight: 600;
        }

        .faq-answer {
          padding: 0 1.5rem 1.5rem;
          background: var(--bg-color);
          animation: fadeIn 0.3s ease-in;
        }

        .faq-answer p {
          color: var(--text-color);
          line-height: 1.6;
          margin: 0;
        }

        .faq-contact {
          text-align: center;
          margin-top: 3rem;
          padding: 2rem;
          background: var(--primary-light);
          border-radius: 1rem;
        }

        .contact-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* レスポンシブ対応 - 新デザイン */
        @media (max-width: 768px) {
          .hero-section {
            padding: 3rem 1rem;
            min-height: 50vh;
          }

          .brand-name {
            font-size: 3rem;
          }

          .service-name {
            font-size: 1.4rem;
          }

          .hero-description {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .hero-buttons {
            flex-direction: column;
            gap: 0.75rem;
          }

          .primary-btn, .secondary-btn {
            width: 100%;
            max-width: 300px;
            padding: 0.875rem 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 2rem 0.75rem;
            min-height: 45vh;
          }

          .hero-badge {
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
            margin-bottom: 1.5rem;
          }

          .brand-name {
            font-size: 2.5rem;
          }

          .service-name {
            font-size: 1.2rem;
          }

          .hero-description {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }

          .primary-btn, .secondary-btn {
            padding: 0.75rem 1.25rem;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 320px) {
          .brand-name {
            font-size: 2rem;
          }

          .service-name {
            font-size: 1rem;
          }

          .hero-description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Layout>
  );
}