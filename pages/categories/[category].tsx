// pages/categories/[category].tsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/router";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import ShopCard from "@/components/shop/ShopCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import NoticeBanner from "@/components/NoticeBanner";
import Button from "@/components/ui/Button";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  dish: string;
  type: string;
  subDish?: string;
  rating?: number;
  reviewCount?: number;
};

export default function CategoryDetailPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubCategory, setActiveSubCategory] = useState("");
  const router = useRouter();
  const { category } = router.query;

  // カテゴリーに対応するサブカテゴリーのマッピング
  const subCategories: Record<string, string[]> = {
    "和食": ["ラーメン", "そば・うどん", "丼物", "おにぎり", "お好み焼き", "たこ焼き", "その他和食"],
    "洋食": ["ハンバーガー", "パスタ", "ピザ", "サンドイッチ", "ホットドッグ", "その他洋食"],
    "中華": ["餃子", "中華麺", "炒飯", "点心", "その他中華"],
    "アジア料理": ["タイ料理", "ベトナム料理", "インド料理", "韓国料理", "その他アジア料理"],
    "スイーツ": ["クレープ", "かき氷", "ソフトクリーム", "ドーナツ", "チョコレート", "その他スイーツ"],
    "ドリンク": ["コーヒー", "紅茶", "フレッシュジュース", "スムージー", "その他ドリンク"],
    "その他": ["ケータリング", "フュージョン", "ベジタリアン", "グルテンフリー"]
  };

  // カテゴリーに対応する説明
  const categoryDescriptions: Record<string, string> = {
    "和食": "ラーメン、うどん、おにぎりなど、日本の伝統的な味を提供するキッチンカーを探索しましょう。",
    "洋食": "ハンバーガー、パスタ、サンドイッチなど、西洋の多様な料理を提供するキッチンカーがあります。",
    "中華": "餃子、炒飯など、本格的な中華料理を味わえるキッチンカーをご紹介します。",
    "アジア料理": "タイ、ベトナム、インド、韓国など、アジア各国の多彩な料理を楽しめます。",
    "スイーツ": "クレープ、かき氷、ソフトクリームなど、甘いものが好きな方におすすめのキッチンカーです。",
    "ドリンク": "コーヒー、紅茶、フレッシュジュースなど、こだわりの飲み物を提供するキッチンカーを見つけましょう。",
    "その他": "ケータリングやフュージョン料理など、ユニークな食体験を提供するキッチンカーです。"
  };

  // カテゴリーに対応するメインビジュアル
  const categoryImages: Record<string, string> = {
    "和食": "/images/categories/japanese-banner.jpg",
    "洋食": "/images/categories/western-banner.jpg",
    "中華": "/images/categories/chinese-banner.jpg",
    "アジア料理": "/images/categories/asian-banner.jpg",
    "スイーツ": "/images/categories/sweets-banner.jpg",
    "ドリンク": "/images/categories/drinks-banner.jpg",
    "その他": "/images/categories/other-banner.jpg"
  };

  // キッチンカーデータの取得
  useEffect(() => {
    if (!category || typeof category !== 'string') return;

    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const decodedCategory = decodeURIComponent(category);
        
        // Firestoreからキッチンカーを取得（カテゴリーでフィルタリング）
        let shopQuery;
        if (decodedCategory === "すべて") {
          shopQuery = collection(db, "kitchens");
        } else {
          shopQuery = query(
            collection(db, "kitchens"),
            where("dish", "==", decodedCategory)
          );
        }
        
        const querySnapshot = await getDocs(shopQuery);
        const shopPromises = querySnapshot.docs.map(async (docSnapshot) => {
          const shopData = docSnapshot.data() as Omit<Shop, "id" | "rating" | "reviewCount">;
          const shopId = docSnapshot.id;
          
          // レビューコレクションを取得して平均評価とレビュー数を計算
          const reviewsSnapshot = await getDocs(collection(db, "kitchens", shopId, "reviews"));
          const reviewCount = reviewsSnapshot.docs.length;
          
          // 平均評価を計算
          let avgRating = 0;
          if (reviewCount > 0) {
            const totalRating = reviewsSnapshot.docs.reduce((sum, reviewDoc) => {
              const reviewData = reviewDoc.data();
              return sum + (reviewData.rating || 0);
            }, 0);
            avgRating = totalRating / reviewCount;
          }
          
          return {
            id: shopId,
            ...shopData,
            rating: avgRating,
            reviewCount: reviewCount
          };
        });
        
        const shopList = await Promise.all(shopPromises);
        setShops(shopList);
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [category]);

  // フィルタリング
  const filteredShops = shops.filter(shop => {
    // サブカテゴリーによるフィルタリング
    const matchesSubCategory = activeSubCategory === "" || shop.subDish === activeSubCategory;
    return matchesSubCategory;
  });

  // 該当するカテゴリーがない場合はリダイレクト
  useEffect(() => {
    if (router.isReady && category && typeof category === 'string') {
      const decodedCategory = decodeURIComponent(category);
      if (
        decodedCategory !== "すべて" && 
        !["和食", "洋食", "中華", "アジア料理", "スイーツ", "ドリンク", "その他"].includes(decodedCategory)
      ) {
        router.push("/categories");
      }
    }
  }, [router, category]);

  if (!category || typeof category !== 'string') {
    return <LoadingIndicator message="カテゴリー情報を読み込み中..." />;
  }

  const decodedCategory = decodeURIComponent(category);
  const categoryDescription = categoryDescriptions[decodedCategory] || "様々なキッチンカーをご紹介します。";
  const categoryImage = categoryImages[decodedCategory] || "/images/categories/default-banner.jpg";

  return (
    <Layout title={`${decodedCategory} | カテゴリー | キッチンカー探し`}>
      <div className="category-banner">
        <div className="category-banner-content">
          <h1>{decodedCategory}</h1>
          <p>{categoryDescription}</p>
        </div>
      </div>

      <div className="container">
        {/* サブカテゴリー（選択されたカテゴリーに基づく） */}
        {decodedCategory !== "すべて" && subCategories[decodedCategory] && (
          <div className="mb-8">
            <h2 className="subcategory-title">{decodedCategory}のジャンル</h2>
            <div className="subcategory-tabs">
              <button
                onClick={() => setActiveSubCategory("")}
                className={`subcategory-tab ${activeSubCategory === "" ? 'active-subcategory-tab' : ''}`}
              >
                すべて
              </button>
              {subCategories[decodedCategory].map((subCategory) => (
                <button
                  key={subCategory}
                  onClick={() => setActiveSubCategory(subCategory)}
                  className={`subcategory-tab ${activeSubCategory === subCategory ? 'active-subcategory-tab' : ''}`}
                >
                  {subCategory}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 検索とフィルターの結果表示 */}
        <div className="result-info-box">
          <div className="result-info-content">
            <div className="result-info-text">
              {filteredShops.length}件の{decodedCategory}系キッチンカーが見つかりました
              {activeSubCategory && ` ジャンル: ${activeSubCategory}`}
            </div>
            {activeSubCategory && (
              <button
                onClick={() => setActiveSubCategory("")}
                className="filter-clear-button"
              >
                絞り込みをクリア
              </button>
            )}
          </div>
        </div>
        
        {/* キッチンカー一覧 */}
        {isLoading ? (
          <LoadingIndicator message="キッチンカー情報を読み込み中..." />
        ) : filteredShops.length > 0 ? (
          <div className="shop-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredShops.map((shop) => (
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
          <div className="empty-state py-12 text-center">
            <NoticeBanner
              title="キッチンカーが見つかりませんでした"
              message="別のカテゴリーを選択してみてください。"
              icon="🔍"
            />
          </div>
        )}
        
        {/* 戻るボタン */}
        <div className="flex justify-center mb-8">
          <Button href="/categories" variant="secondary">
            カテゴリー一覧に戻る
          </Button>
        </div>
      </div>
    </Layout>
  );
}