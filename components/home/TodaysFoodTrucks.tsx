// components/home/TodaysFoodTrucks.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ShopCard from "@/components/shop/ShopCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import Button from "@/components/ui/Button";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  rating?: number;
  reviewCount?: number;
};

export default function TodaysFoodTrucks() {
  const [todaysShops, setTodaysShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysShops = async () => {
      setIsLoading(true);
      try {
        // 今日の日付を取得（時刻は0:00に設定）
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStart = Timestamp.fromDate(today);
        const todayEnd = Timestamp.fromDate(tomorrow);

        // 今日のスケジュールを取得
        const schedulesRef = collection(db, "schedules");
        const q = query(
          schedulesRef,
          where("date", ">=", todayStart),
          where("date", "<", todayEnd)
        );
        const schedulesSnapshot = await getDocs(q);

        // スケジュールから店舗IDを取得
        const kitchenIds = schedulesSnapshot.docs.map(doc => doc.data().kitchenId);

        // 店舗情報が空の場合は早期リターン
        if (kitchenIds.length === 0) {
          setTodaysShops([]);
          setIsLoading(false);
          return;
        }

        // 店舗情報を取得
        const shops: Shop[] = [];
        
        for (const kitchenId of kitchenIds) {
          // kitchensコレクションから店舗情報を取得
          const kitchenRef = collection(db, "kitchens");
          const kitchenSnap = await getDocs(query(kitchenRef, where("__name__", "==", kitchenId)));
          
          if (!kitchenSnap.empty) {
            const kitchenData = kitchenSnap.docs[0].data();
            
            // レビュー情報を取得（平均評価とレビュー数）
            const reviewsSnapshot = await getDocs(collection(db, "kitchens", kitchenId, "reviews"));
            const reviewCount = reviewsSnapshot.docs.length;
            
            let avgRating = 0;
            if (reviewCount > 0) {
              const totalRating = reviewsSnapshot.docs.reduce((sum, reviewDoc) => {
                const reviewData = reviewDoc.data();
                return sum + (reviewData.rating || 0);
              }, 0);
              avgRating = totalRating / reviewCount;
            }
            
            shops.push({
              id: kitchenId,
              name: kitchenData.name || "名称不明",
              location: kitchenData.location || "",
              image: kitchenData.image || "/images/default-shop.jpg",
              type: kitchenData.type || "",
              rating: avgRating,
              reviewCount: reviewCount
            });
          }
        }
        
        setTodaysShops(shops);
      } catch (error) {
        console.error("Error fetching today's shops:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysShops();
  }, []);

  if (isLoading) {
    return (
      <div className="py-6">
        <LoadingIndicator message="本日のキッチンカー情報を読み込み中..." />
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-title">
          <h2>本日のキッチンカー</h2>
          <Link href="/calendar" className="view-all">
            今後の予定を見る
          </Link>
        </div>

        {todaysShops.length > 0 ? (
          <div className="shop-grid">
            {todaysShops.map((shop) => (
              <ShopCard
                key={shop.id}
                id={shop.id}
                name={shop.name}
                location={shop.location}
                image={shop.image}
                type={shop.type}
                rating={shop.rating || 0}
                reviewCount={shop.reviewCount || 0}
              />
            ))}
          </div>
        ) : (
          <div className="no-shops-today">
            <p>本日出店予定のキッチンカーはありません。</p>
            <div className="mt-4">
              <Button href="/calendar" variant="primary">
                今後の予定を見る
              </Button>
            </div>
          </div>
        )}

        <style jsx>{`
          .no-shops-today {
            text-align: center;
            padding: 3rem;
            background-color: #f8fafc;
            border-radius: 0.75rem;
            color: #6b7280;
          }
        `}</style>
      </div>
    </section>
  );
}