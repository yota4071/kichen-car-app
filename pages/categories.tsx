// pages/categories.tsx
import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/router";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import ShopCard from "@/components/shop/ShopCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import NoticeBanner from "@/components/NoticeBanner";
import CategoryCard from "@/components/category/CategoryCard";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  dish: string;
  subDish?: string;
  rating?: number;
  reviewCount?: number;
};

export default function CategoriesPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [activeSubCategory, setActiveSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // URLからカテゴリーパラメータを取得
  useEffect(() => {
    if (router.query.category && typeof router.query.category === 'string') {
      const category = decodeURIComponent(router.query.category);
      if (mainCategories.includes(category)) {
        setActiveCategory(category);
      }
    }
  }, [router.query]);

  // メインカテゴリーリスト
  const mainCategories = [
    "すべて",
    "和食",
    "洋食",
    "中華",
    "アジア料理",
    "スイーツ",
    "ドリンク",
    "その他"
  ];

  // サブカテゴリーのマッピング
  const subCategories: Record<string, string[]> = {
    "和食": ["ラーメン", "そば・うどん", "丼物", "おにぎり", "お好み焼き", "たこ焼き", "その他和食"],
    "洋食": ["ハンバーガー", "パスタ", "ピザ", "サンドイッチ", "ホットドッグ", "その他洋食"],
    "中華": ["餃子", "中華麺", "炒飯", "点心", "その他中華"],
    "アジア料理": ["タイ料理", "ベトナム料理", "インド料理", "韓国料理", "その他アジア料理"],
    "スイーツ": ["クレープ", "かき氷", "ソフトクリーム", "ドーナツ", "チョコレート", "その他スイーツ"],
    "ドリンク": ["コーヒー", "紅茶", "フレッシュジュース", "スムージー", "その他ドリンク"],
    "その他": ["ケータリング", "フュージョン", "ベジタリアン", "グルテンフリー"]
  };

  // キッチンカーデータの取得
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "kitchens"));
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
  }, []);

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current) {
      setSearchQuery(searchInputRef.current.value);
    }
  };

  // フィルタリング
  const filteredShops = shops.filter(shop => {
    // 検索クエリによるフィルタリング
    const matchesSearch = searchQuery === "" || 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.dish?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // メインカテゴリーによるフィルタリング
    const matchesMainCategory = activeCategory === "すべて" || shop.dish === activeCategory;
    
    // サブカテゴリーによるフィルタリング
    const matchesSubCategory = activeSubCategory === "" || shop.subDish === activeSubCategory;
    
    return matchesSearch && matchesMainCategory && matchesSubCategory;
  });

  // カテゴリー変更ハンドラー
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveSubCategory(""); // サブカテゴリーをリセット
    
    // URLを更新（カテゴリーが「すべて」の場合はパラメータを削除）
    if (category === "すべて") {
      router.push("/categories", undefined, { shallow: true });
    } else {
      router.push(`/categories?category=${encodeURIComponent(category)}`, undefined, { shallow: true });
    }
  };

  // カテゴリー別のカウント計算
  const categoryCount = mainCategories.reduce((acc, category) => {
    if (category !== "すべて") {
      acc[category] = shops.filter(shop => shop.dish === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout title="カテゴリー | キッチンカー探し">
      <div className="category-banner">
        <div className="category-banner-content">
          <h1>カテゴリーから探す</h1>
          <p>お好みの料理ジャンルから、キャンパス周辺の美味しいキッチンカーを見つけましょう</p>
        </div>
      </div>
      
      <div className="container category-container">
        {/* 検索ボックス */}
        <div className="search-box">
          <form onSubmit={handleSearch}>
            <div className="search-input-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="キッチンカー名や場所で検索..."
                className="search-input"
                defaultValue={searchQuery}
              />
              <button type="submit" className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
        
        {/* トップカテゴリー一覧 */}
        {!isLoading && !searchQuery && activeCategory === "すべて" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">人気のカテゴリー</h2>
            <div className="top-categories-grid">
              {mainCategories.filter(cat => cat !== "すべて").map((category) => (
                <CategoryCard 
                  key={category}
                  name={category}
                  count={categoryCount[category] || 0}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* メインカテゴリータブ */}
        <div className="mb-8">
          <div className="main-categories-tabs">
            {mainCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`category-tab ${activeCategory === category ? 'active-tab' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* サブカテゴリー（選択されたカテゴリーに基づく） */}
        {activeCategory !== "すべて" && subCategories[activeCategory] && (
          <div className="mb-8">
            <h2 className="subcategory-title">{activeCategory}のジャンル</h2>
            <div className="subcategory-tabs">
              <button
                onClick={() => setActiveSubCategory("")}
                className={`subcategory-tab ${activeSubCategory === "" ? 'active-subcategory-tab' : ''}`}
              >
                すべて
              </button>
              {subCategories[activeCategory].map((subCategory) => (
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
              {filteredShops.length}件のキッチンカーが見つかりました
              {searchQuery && ` 「${searchQuery}」の検索結果`}
              {activeCategory !== "すべて" && ` カテゴリー: ${activeCategory}`}
              {activeSubCategory && ` > ${activeSubCategory}`}
            </div>
            {(searchQuery || activeCategory !== "すべて" || activeSubCategory) && (
              <button
                onClick={() => {
                  setActiveCategory("すべて");
                  setActiveSubCategory("");
                  setSearchQuery("");
                  if (searchInputRef.current) {
                    searchInputRef.current.value = "";
                  }
                  router.push("/categories", undefined, { shallow: true });
                }}
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
          <div className="shop-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                id={shop.id}
                name={shop.name}
                location={shop.location}
                image={shop.image}
                type={shop.dish}
                rating={shop.rating || 0}
                reviewCount={shop.reviewCount || 0}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state py-12 text-center">
            <NoticeBanner
              title="キッチンカーが見つかりませんでした"
              message="検索条件を変更するか、別のカテゴリーを選択してみてください。"
              icon="🔍"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}