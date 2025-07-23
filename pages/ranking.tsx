import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Firestoreインスタンス
import Layout from '@/components/Layout';

type StoreRanking = {
  storeId: string;
  storeName: string;
  reviewCount: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<StoreRanking[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));

      const counts: Record<string, StoreRanking> = {};

      reviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        const storeId = data.storeId;
        const storeName = data.storeName;

        if (!storeId) return;

        if (!counts[storeId]) {
          counts[storeId] = {
            storeId,
            storeName,
            reviewCount: 1,
          };
        } else {
          counts[storeId].reviewCount += 1;
        }
      });

      // レビュー数の多い順にソート
      const sorted = Object.values(counts).sort((a, b) => b.reviewCount - a.reviewCount);
      setRanking(sorted);
    };

    fetchRanking();
  }, []);

  return (
    <Layout title="キッチンカー人気ランキング">
      <div className="ranking-page">
        <h1>🔥 人気キッチンカーランキング</h1>

        {ranking.length === 0 ? (
          <p>読み込み中...</p>
        ) : (
          <ol>
            {ranking.map((store, index) => (
              <li key={store.storeId}>
                <strong>{index + 1}位: {store.storeName}</strong>（レビュー数: {store.reviewCount}件）
              </li>
            ))}
          </ol>
        )}

        <style jsx>{`
          .ranking-page {
            max-width: 800px;
            margin: 2rem auto;
            padding: 1rem;
          }

          h1 {
            font-size: 1.75rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: #1f2937;
          }

          ol {
            padding-left: 1.5rem;
          }

          li {
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    </Layout>
  );
}