// pages/ranking.tsx
import Layout from '@/components/Layout';

export default function RankingPage() {
  return (
    <Layout title="人気ランキング">
      <div className="ranking-page">
        <h1>キッチンカー人気ランキング</h1>
        <p>人気のキッチンカーをランキング形式で紹介します。</p>

        {/* 仮置きのランキングデータ */}
        <ol>
          <li>🔥 からあげ太郎</li>
          <li>🍛 カレー侍</li>
          <li>🍔 グルメバーガー号</li>
        </ol>

        <style jsx>{`
          .ranking-page {
            max-width: 800px;
            margin: 2rem auto;
            padding: 1rem;
          }

          h1 {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #1f2937;
          }

          ol {
            padding-left: 1.25rem;
            list-style: decimal;
          }

          li {
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
          }
        `}</style>
      </div>
    </Layout>
  );
}