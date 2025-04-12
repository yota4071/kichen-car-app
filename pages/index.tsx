// pages/index.tsx
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/router";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import ShopCard from "@/components/shop/ShopCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import Button from "@/components/ui/Button";
import CategoryCard from "@/components/category/CategoryCard";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  dish?: string; // カテゴリとして使用
  rating?: number;
  reviewCount?: number;
};

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // URLからカテゴリーパラメータを取得
  useEffect(() => {
    if (router.query.category && typeof router.query.category === 'string') {
      const category = decodeURIComponent(router.query.category);
      if (categories.includes(category)) {
        setActiveCategory(category);
      }
    }
  }, [router.query]);

  // カテゴリーリスト
  const categories = [
    "すべて",
    "和食",
    "洋食",
    "中華",
    "アジア料理",
    "スイーツ",
    "ドリンク",
    "その他"
  ];

  // キッチンカーデータの取得
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        let shopsQuery;
        
        // カテゴリーでフィルタリング
        if (activeCategory !== "すべて") {
          shopsQuery = query(
            collection(db, "kitchens"),
            where("dish", "==", activeCategory)
          );
        } else {
          shopsQuery = collection(db, "kitchens");
        }
        
        const querySnapshot = await getDocs(shopsQuery);
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
  }, [activeCategory]);

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current) {
      setSearchQuery(searchInputRef.current.value);
    }
  };

  // カテゴリー変更ハンドラー
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    // URLを更新（カテゴリーが「すべて」の場合はパラメータを削除）
    if (category === "すべて") {
      router.push("/", undefined, { shallow: true });
    } else {
      router.push(`/?category=${encodeURIComponent(category)}`, undefined, { shallow: true });
    }
  };

  // フィルタリング - 検索クエリのみ適用
  const filteredShops = shops.filter(shop => {
    // 検索クエリによるフィルタリング
    return searchQuery === "" || 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop.type && shop.type.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // カテゴリー別のカウント計算
  const categoryCount = categories.reduce((acc, category) => {
    if (category !== "すべて") {
      acc[category] = shops.filter(shop => shop.dish === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // おすすめのキッチンカー（評価が高い順に3件）
  const featuredShops = [...filteredShops]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <Layout>
      {/* ヒーローセクション */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">あなたの近くの美味しい<br />キッチンカーを見つけよう</h1>
            <p className="hero-description">立命館大学で人気のキッチンカーを検索して、新しい味の発見を楽しみましょう</p>
            
            <form onSubmit={handleSearch} className="hero-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="キッチンカー名や場所で検索..."
                className="hero-search-input"
              />
              <span className="hero-search-icon">🔍</span>
            </form>
          </div>
        </div>
      </section>

      {/* 波形の区切り */}
      <div className="wave-divider"></div>

      {/* おすすめのキッチンカー */}
      {!isLoading && featuredShops.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>おすすめのキッチンカー</h2>
              <Link href="#all-shops" className="view-all">
                すべて見る
              </Link>
            </div>

            <div className="shop-grid">
              {featuredShops.map((shop) => (
                <ShopCard
                  key={`featured-${shop.id}`}
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
          </div>
        </section>
      )}

      {/* 人気のカテゴリー */}
      {!isLoading && (
        <section className="section" style={{ backgroundColor: "#f0f9ff" }}>
          <div className="container">
            <div className="section-title">
              <h2>人気のカテゴリー</h2>
              <Link href="/categories" className="view-all">
                カテゴリー一覧へ
              </Link>
            </div>

            <div className="top-categories-grid">
              {categories.filter(cat => cat !== "すべて").map((category) => (
                <CategoryCard 
                  key={category}
                  name={category}
                  count={categoryCount[category] || 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 全キッチンカーセクション */}
      <section id="all-shops" className="section" style={{ backgroundColor: "#f8fafc" }}>
        <div className="container">
          <h2 className="section-title">キッチンカーを探す</h2>

          {/* カテゴリーフィルター - 改良版 */}
          <div className="main-categories-tabs">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`category-tab ${activeCategory === category ? 'active-tab' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 検索とフィルターの結果表示 */}
          {(searchQuery || activeCategory !== "すべて") && (
            <div className="result-info-box">
              <div className="result-info-content">
                <div className="result-info-text">
                  {filteredShops.length}件のキッチンカーが見つかりました
                  {searchQuery && ` 「${searchQuery}」の検索結果`}
                  {activeCategory !== "すべて" && ` カテゴリー: ${activeCategory}`}
                </div>
                <button
                  onClick={() => {
                    setActiveCategory("すべて");
                    setSearchQuery("");
                    if (searchInputRef.current) {
                      searchInputRef.current.value = "";
                    }
                    router.push("/", undefined, { shallow: true });
                  }}
                  className="filter-clear-button"
                >
                  絞り込みをクリア
                </button>
              </div>
            </div>
          )}

          {/* キッチンカー一覧 */}
          {isLoading ? (
            <LoadingIndicator />
          ) : filteredShops.length > 0 ? (
            <div className="shop-grid">
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
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              キッチンカーが見つかりませんでした。検索条件を変更するか、別のカテゴリーを選択してみてください。
            </div>
          )}
        </div>
      </section>

      {/* CTA セクション */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-container">
            <div className="cta-content">
              <h2 className="cta-title">マップで近くのキッチンカーを探す</h2>
              <p className="cta-description">
                現在地周辺のキッチンカーをマップで簡単に見つけることができます。お気に入りのキッチンカーを見つけて、美味しい食事を楽しみましょう。
              </p>
              <Button href="/map" variant="primary" className="cta-button">
                マップを開く
              </Button>
            </div>
            <div className="cta-image">
              <div className="map-placeholder">
                🗺️
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}