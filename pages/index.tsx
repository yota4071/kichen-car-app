// pages/index.tsx（改良版：折りたたみ機能・詳細検索リンク追加）
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
import TodaysFoodTrucks from "@/components/home/TodaysFoodTrucks";

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
  const [isExpanded, setIsExpanded] = useState(false); // 折りたたみ状態管理
  const [displayLimit, setDisplayLimit] = useState(8); // 初期表示数
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
    const query = searchInputRef.current.value.trim();
    if (query) {
      // search ページにリダイレクト
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      // 空の場合は search ページのトップに移動
      router.push('/search');
    }
  }
};

  // カテゴリー変更ハンドラー
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setIsExpanded(false); // カテゴリー変更時に折りたたむ
    
    // URLを更新（カテゴリーが「すべて」の場合はパラメータを削除）
    if (category === "すべて") {
      router.push("/", undefined, { shallow: true });
    } else {
      router.push(`/?category=${encodeURIComponent(category)}`, undefined, { shallow: true });
    }
  };

  const filteredShops = shops.filter(shop => {
  // 検索クエリによるフィルタリング（undefined チェック追加）
  return searchQuery === "" || 
    (shop.name && shop.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (shop.location && shop.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (shop.type && shop.type.toLowerCase().includes(searchQuery.toLowerCase()));
});

  // 表示するショップ
  const displayedShops = isExpanded ? filteredShops : filteredShops.slice(0, displayLimit);

  // もっと見るボタンの表示条件
  const showMoreButton = !isExpanded && filteredShops.length > displayLimit;
  // 折りたたむボタンの表示条件
  const showLessButton = isExpanded && filteredShops.length > displayLimit;

  // 展開/折りたたみ処理
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // スクロール位置を調整
    if (!isExpanded) {
      window.scrollTo({ top: window.scrollY, behavior: 'smooth' });
    }
  };

  // 詳細検索ページへの遷移
  const goToDetailedSearch = () => {
    router.push('/categories');
  };

  // カテゴリー別のカウント計算
  const categoryCount = categories.reduce((acc, category) => {
    if (category !== "すべて") {
      acc[category] = shops.filter(shop => shop.dish === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

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

      {/* 本日のキッチンカー */}
      <TodaysFoodTrucks />

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

      {/* 全キッチンカーセクション - 折りたたみ機能追加 */}
      <section id="all-shops" className="section" style={{ backgroundColor: "#f8fafc" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">キッチンカーを探す</h2>
            
            {/* 詳細検索へのリンク - 新規追加 */}
            <button 
              onClick={goToDetailedSearch}
              className="detailed-search-button"
            >
              詳細検索へ 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

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

          {/* キッチンカー一覧 - 折りたたみ機能付き */}
          {isLoading ? (
            <LoadingIndicator />
          ) : filteredShops.length > 0 ? (
            <>
              <div className="shop-grid">
                {displayedShops.map((shop) => (
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
              
              {/* もっと見る/折りたたむボタン */}
              {showMoreButton && (
                <div className="show-more-container">
                  <button className="show-more-button" onClick={toggleExpand}>
                    もっと見る ({filteredShops.length - displayLimit}件) 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {showLessButton && (
                <div className="show-more-container">
                  <button className="show-less-button" onClick={toggleExpand}>
                    折りたたむ
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              キッチンカーが見つかりませんでした。検索条件を変更するか、別のカテゴリーを選択してみてください。
            </div>
          )}
          
          {/* 詳細検索へのCTA */}
          <div className="detailed-search-cta">
            <div className="cta-content">
              <h3>もっと詳しく探す</h3>
              <p>料理タイプや出店場所など、細かい条件で検索できます</p>
            </div>
            <Button href="/categories" variant="primary">
              詳細検索へ
            </Button>
          </div>
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
      
      {/* スタイル追加 */}
      <style jsx>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .detailed-search-button {
          display: flex;
          align-items: center;
          color: #3b82f6;
          background: none;
          border: none;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }
        
        .detailed-search-button:hover {
          background-color: #eff6ff;
          text-decoration: underline;
        }
        
        .detailed-search-button svg {
          width: 1rem;
          height: 1rem;
          margin-left: 0.25rem;
        }
        
        .show-more-container {
          text-align: center;
          margin: 2rem 0;
        }
        
        .show-more-button,
        .show-less-button {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1.5rem;
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
          color: #4b5563;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .show-more-button:hover,
        .show-less-button:hover {
          background-color: #e5e7eb;
          color: #1f2937;
        }
        
        .show-more-button svg,
        .show-less-button svg {
          width: 1.25rem;
          height: 1.25rem;
          margin-left: 0.25rem;
        }
        
        .detailed-search-cta {
          margin-top: 3rem;
          padding: 1.5rem;
          background-color: #eff6ff;
          border-radius: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .detailed-search-cta .cta-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        
        .detailed-search-cta .cta-content p {
          color: #6b7280;
          font-size: 0.95rem;
        }
        
        @media (max-width: 640px) {
          .detailed-search-cta {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .detailed-search-cta button {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}