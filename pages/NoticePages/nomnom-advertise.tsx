// pages/NoticePages/nomnom-advertise.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';

export default function NomNomAdvertisePage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  const advertisingFeatures = [
    {
      id: 'reach',
      title: '学生向けリーチ',
      description: '立命館大学の学生に直接アプローチできる最適なプラットフォーム',
      icon: '🎯',
      details: [
        'キャンパス内での認知度向上',
        '学生のアクセスが多い時間帯での露出',
        'ターゲット層に的確にリーチ',
        'サークル活動の告知に最適'
      ]
    },
    {
      id: 'visibility',
      title: '高い視認性',
      description: 'トップページの目立つ位置に告知を配置',
      icon: '👁️',
      details: [
        'ホーム画面での優先表示',
        'お知らせスライダーでの告知',
        '専用ページでの詳細情報掲載',
        '学生の目に留まりやすい配置'
      ]
    },
    {
      id: 'flexible',
      title: '柔軟な掲載期間',
      description: '最短1日から掲載可能、イベントに合わせた柔軟な期間設定',
      icon: '📅',
      details: [
        '最短1日から掲載可能',
        'イベント直前の短期掲載対応',
        '長期キャンペーンにも対応',
        '掲載期間の延長も可能'
      ]
    },
    {
      id: 'support',
      title: '制作サポート',
      description: '相談により専用ページのデザイン・制作も承ります',
      icon: '🎨',
      details: [
        'お知らせスライダーへの掲載',
        '専用ページの制作（オプション）',
        'デザインの相談・提案',
        'コンテンツ制作のサポート'
      ]
    }
  ];

  const stats = [
    { number: '2,000+', label: '月間アクティブユーザー', icon: '👥' },
    { number: '20+', label: 'キッチンカー登録数', icon: '🚚' },
    { number: '4.6', label: 'アプリ平均評価', icon: '⭐' },
    { number: '立命館大学', label: '対象キャンパス', icon: '🏫' }
  ];


  const useCases = [
    {
      title: '定期ライブ・コンサート',
      description: 'バンドサークルや音楽系サークルの定期公演告知',
      icon: '🎵',
      examples: ['軽音楽サークルの定期ライブ', 'アカペラサークルのコンサート', 'オーケストラの演奏会']
    },
    {
      title: '文化祭・学園祭イベント',
      description: '各サークルの文化祭での出店・公演告知',
      icon: '🎪',
      examples: ['模擬店の出店告知', '展示・発表の案内', 'パフォーマンスの告知']
    },
    {
      title: 'サークル説明会・新歓',
      description: '新入生向けのサークル説明会や新歓イベント',
      icon: '🌸',
      examples: ['新歓説明会の案内', '体験会・見学会の告知', 'サークル紹介イベント']
    },
    {
      title: 'その他イベント',
      description: '講演会、勉強会、交流イベントなど',
      icon: '📚',
      examples: ['講演会・セミナー', '勉強会・ワークショップ', '交流会・懇親会']
    }
  ];

  const faqs = [
    {
      question: '広告掲載の最短期間はどのくらいですか？',
      answer: '最短1日から掲載可能です。イベント直前の短期間での掲載にも対応しておりますので、お気軽にご相談ください。'
    },
    {
      question: '料金はどのように決まりますか？',
      answer: '掲載期間、内容、オプション（専用ページ制作など）により料金が変動いたします。詳細な料金については、お問い合わせいただいた際にご案内いたします。'
    },
    {
      question: '専用ページの制作は可能ですか？',
      answer: 'はい、可能です。お知らせスライダーでの告知に加えて、イベントの詳細情報を掲載する専用ページの制作も承っております（追加料金）。デザインから制作まで対応いたします。'
    },
    {
      question: 'どのような団体が利用できますか？',
      answer: '立命館大学の公認サークル・団体を対象としております。バンドサークル、ダンスサークル、演劇部、学術系サークルなど、ジャンルを問わずご利用いただけます。'
    },
    {
      question: '掲載内容に制限はありますか？',
      answer: '公序良俗に反しない内容であれば基本的に制限はございません。'
    },
    {
      question: 'キャンセルは可能ですか？',
      answer: '掲載開始前であればキャンセル可能です。掲載開始後のキャンセルについては、残り期間に応じて対応いたします。詳しくはお問い合わせください。'
    }
  ];

  return (
    <Layout title="NOMNOMに広告を出しませんか？ | サークル・団体向け告知サービス">
      {/* ヒーローセクション */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            📢 サークル・団体様募集中！
          </div>
          
          <h1 className="hero-title">
            <span className="brand-name">NomNom!</span>
            <span className="service-name">告知掲載サービス</span>
          </h1>
          
          <p className="hero-description">
            立命館大学の学生に愛されるアプリで<br />
            あなたのサークル・イベントを効果的に告知
          </p>
          
          <div className="hero-buttons">
            <Button href="#contact" variant="primary" className="primary-btn">
              お問い合わせ
            </Button>
            <Button href="#examples" variant="secondary" className="secondary-btn">
              掲載事例を見る
            </Button>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="stats-section">
        <div className="container">
          <h2 className="stats-title">NomNom!の実績</h2>
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

      {/* 告知の特徴セクション */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">NomNom!告知の特徴</h2>
            <p className="section-subtitle">
              なぜNomNom!が効果的な告知プラットフォームなのか
            </p>
          </div>
          
          <div className="features-container">
            <div className="features-tabs">
              {advertisingFeatures.map((feature, index) => (
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
                  {advertisingFeatures[activeFeature].icon} {advertisingFeatures[activeFeature].title}
                </h3>
                <p className="feature-description">
                  {advertisingFeatures[activeFeature].description}
                </p>
                <ul className="feature-list">
                  {advertisingFeatures[activeFeature].details.map((detail, index) => (
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

      {/* 掲載事例セクション */}
      <section id="examples" className="use-cases-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">掲載事例</h2>
            <p className="section-subtitle">
              こんなイベント・活動の告知に最適です
            </p>
          </div>
          
          <div className="use-cases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <div className="use-case-icon">{useCase.icon}</div>
                <h3 className="use-case-title">{useCase.title}</h3>
                <p className="use-case-description">{useCase.description}</p>
                <ul className="use-case-examples">
                  {useCase.examples.map((example, exampleIndex) => (
                    <li key={exampleIndex} className="use-case-example">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 掲載の流れセクション */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">掲載の流れ</h2>
            <p className="section-subtitle">
              お問い合わせから掲載開始まで
            </p>
          </div>
          
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">お問い合わせ</h3>
                <p className="step-description">
                  メールでお気軽にお問い合わせください。掲載希望内容や期間をお聞かせください。
                </p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">お見積もり・ご提案</h3>
                <p className="step-description">
                  内容に応じてお見積もりとプランをご提案いたします。専用ページ制作などのオプションもご相談ください。
                </p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">素材準備・制作</h3>
                <p className="step-description">
                  告知に必要な文章・画像をご準備いただき、必要に応じて専用ページの制作を行います。
                </p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">掲載開始</h3>
                <p className="step-description">
                  お知らせスライダーへの掲載を開始し、専用ページがある場合は公開いたします。
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
              告知掲載についてよくお寄せいただく質問にお答えします
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
        </div>
      </section>

      {/* お問い合わせCTAセクション */}
      <section id="contact" className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">告知掲載をご検討中の方へ</h2>
            <p className="cta-description">
              サークルやイベントの告知をお考えの方は<br />
              お気軽にお問い合わせください
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <div className="contact-label">メールでのお問い合わせ</div>
                  <div className="contact-value">sales@qurest.tech</div>
                  <div className="contact-note">料金や詳細についてはこちらまで</div>
                </div>
              </div>
            </div>
            <div className="cta-actions">
              <Button href="mailto:example@mail.com" variant="primary" className="main-cta">
                メールでお問い合わせ
              </Button>
            </div>
            <div className="cta-note">
              <p>
                ※ お問い合わせの際は、サークル・団体名、イベント内容、希望掲載期間をお教えください<br />
                ※ 掲載内容によってはお断りする場合がございます
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* ヒーローセクション */
        .hero-section {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
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
          left: -20%;
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

        /* 統計セクション */
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
          color: #007bff;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-light);
          font-weight: 500;
        }

        /* 機能セクション */
        .features-section {
          padding: 4rem 0;
          background: var(--bg-color);
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
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.1);
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

        /* 掲載事例セクション */
        .use-cases-section {
          padding: 4rem 0;
          background: white;
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .use-case-card {
          background: var(--bg-color);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border-color);
          text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .use-case-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .use-case-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .use-case-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1rem;
        }

        .use-case-description {
          color: var(--text-light);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .use-case-examples {
          list-style: none;
          padding: 0;
          text-align: left;
        }

        .use-case-example {
          padding: 0.25rem 0;
          color: var(--text-color);
          font-size: 0.9rem;
        }


        /* 掲載の流れセクション */
        .process-section {
          padding: 4rem 0;
          background: white;
        }

        .process-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .process-step {
          display: flex;
          gap: 1.5rem;
          padding: 2rem;
          background: var(--bg-color);
          border-radius: 1rem;
          border: 1px solid var(--border-color);
        }

        .step-number {
          width: 3rem;
          height: 3rem;
          background: #007bff;
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

        /* FAQセクション */
        .faq-section {
          padding: 4rem 0;
          background: var(--bg-color);
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
          background: rgba(0, 123, 255, 0.1);
        }

        .faq-q-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
        }

        .faq-icon {
          font-size: 1.5rem;
          color: #007bff;
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

        /* CTAセクション */
        .cta-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
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

        .contact-info {
          max-width: 600px;
          margin: 0 auto 3rem auto;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }

        .contact-icon {
          font-size: 2rem;
        }

        .contact-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .contact-value {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0.25rem 0;
        }

        .contact-note {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .cta-actions {
          margin-bottom: 2rem;
        }

        .main-cta {
          padding: 0.75rem 2rem;
          font-weight: 600;
        }

        .cta-note {
          max-width: 600px;
          margin: 0 auto;
          font-size: 0.9rem;
          opacity: 0.8;
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

        /* レスポンシブ対応 */
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

          .features-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .features-tabs {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .process-steps {
            grid-template-columns: 1fr;
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

          .features-tabs {
            grid-template-columns: 1fr;
          }

          .contact-item {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
}