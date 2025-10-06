// components/home/TodaysFoodTrucks.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy, Timestamp, doc, getDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ShopCard from "@/components/shop/ShopCard";
import PRCard from "@/components/shop/PRCard";
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

type PRCard = {
  id: string;
  name: string;
  location: string;
  image: string;
  prMessage: string;
  url: string;
  isActive: boolean;
  displayLocation: string[];
  startDate?: string;
  endDate?: string;
  priority?: number;
  createdAt?: string;
};

export default function TodaysFoodTrucks() {
  const [todaysShops, setTodaysShops] = useState<Shop[]>([]);
  const [prCards, setPrCards] = useState<PRCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // PRカードデータの取得（クライアントサイド最適化版）
  useEffect(() => {
    const fetchPRCards = async () => {
      try {
        // 基本クエリ（isActiveでフィルタリング）
        const prCardsRef = collection(db, "pr-cards");
        const q = query(
          prCardsRef,
          where("isActive", "==", true),
          orderBy("priority", "asc")
        );

        const querySnapshot = await getDocs(q);
        const now = new Date();
        const activePRCards: PRCard[] = [];

        querySnapshot.docs.forEach(docSnapshot => {
          const data = docSnapshot.data();

          // クライアントサイドで効率的にフィルタリング
          if (!data.displayLocation?.includes('today')) return;

          const startDate = data.startDate ? new Date(data.startDate) : null;
          const endDate = data.endDate ? new Date(data.endDate) : null;

          const isInDisplayPeriod =
            (!startDate || startDate <= now) &&
            (!endDate || endDate >= now);

          if (isInDisplayPeriod) {
            activePRCards.push({
              id: docSnapshot.id,
              name: data.name || "",
              location: data.location || "",
              image: data.image || "",
              prMessage: data.prMessage || "",
              url: data.url || "",
              isActive: data.isActive ?? true,
              displayLocation: data.displayLocation || [],
              startDate: data.startDate || "",
              endDate: data.endDate || "",
              priority: data.priority || 1,
              createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });
          }
        });

        // 最大5件に制限
        setPrCards(activePRCards.slice(0, 5));
      } catch (error) {
        console.error("Error fetching PR cards:", error);
      }
    };

    fetchPRCards();
  }, []);

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

        // 重複を排除したユニークなkitchenIDリストを作成
        const uniqueKitchenIds = [...new Set(kitchenIds)];

        // 全ての店舗情報を並列取得
        const kitchenPromises = uniqueKitchenIds.map(async (kitchenId): Promise<Shop | null> => {
          try {
            // ダイレクトアクセスで店舗情報を取得
            const kitchenDoc = await getDoc(doc(db, "kitchens", kitchenId));

            if (!kitchenDoc.exists()) {
              return null;
            }

            const kitchenData = kitchenDoc.data();

            // レビュー情報を並列取得
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

            const shop: Shop = {
              id: kitchenId,
              name: kitchenData.name || "名称不明",
              location: kitchenData.location || "",
              image: kitchenData.image || "/images/default-shop.jpg",
              type: kitchenData.type || "",
              rating: avgRating > 0 ? avgRating : undefined,
              reviewCount: reviewCount > 0 ? reviewCount : undefined
            };

            return shop;
          } catch (error) {
            console.error(`Error fetching kitchen ${kitchenId}:`, error);
            return null;
          }
        });

        // 並列処理で全ての店舗情報を取得
        const kitchenResults = await Promise.all(kitchenPromises);

        // nullを除外してShop[]として設定
        const shops = kitchenResults.filter((shop): shop is Shop => shop !== null);
        
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

        {todaysShops.length > 0 || prCards.length > 0 ? (
          <div className="shop-grid">
            {/* PRカード表示 */}
            {prCards.map((prCard) => (
              <PRCard
                key={prCard.id}
                id={prCard.id}
                name={prCard.name}
                location={prCard.location}
                image={prCard.image}
                prMessage={prCard.prMessage}
                url={prCard.url}
              />
            ))}
            
            {/* キッチンカー表示 */}
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