// pages/categories.tsx（人気のカテゴリーを常に表示するように修正）
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
import TypeFilter from "@/components/shop/TypeFilter"; // 料理タイプのフィルター
import DynamicSubCategoryFilter from "@/components/shop/DynamicSubCategoryFilter"; // 動的サブカテゴリーフィルター

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

export default function CategoriesPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [activeSubCategory, setActiveSubCategory] = useState("");
  const [activeType, setActiveType] = useState(""); // typeによるフィルタリング用
  const [searchQuery, setSearchQuery] = useState("");
  const [mainCategories, setMainCategories] = useState<string[]>(["すべて"]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // URLからパラメータを取得
  useEffect(() => {
    if (router.query.category && typeof router.query.category === 'string') {
      const category = decodeURIComponent(router.query.category);
      if (mainCategories.includes(category)) {
        setActiveCategory(category);
      }
    }
    
    if (router.query.subCategory && typeof router.query.subCategory === 'string') {
      setActiveSubCategory(decodeURIComponent(router.query.subCategory));
    }
    
    if (router.query.type && typeof router.query.type === 'string') {
      setActiveType(decodeURIComponent(router.query.type));
    }
  }, [router.query, mainCategories]);

  // Firestoreから全カテゴリー（dish）を取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const kitchensRef = collection(db, "kitchens");
        const kitchensSnapshot = await getDocs(kitchensRef);
        
        // dishフィールドを抽出して重複を排除
        const categorySet = new Set<string>();
        categorySet.add("すべて"); // デフォルトで「すべて」を含める
        
        kitchensSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.dish) {
            categorySet.add(data.dish);
          }
        });
        
        // Setから配列に変換してソート
        const categoryArray = Array.from(categorySet);
        // 「すべて」を先頭に、それ以外をアルファベット順でソート
        const sortedCategories = [
          "すべて",
          ...categoryArray.filter(cat => cat !== "すべて").sort()
        ];
        
        setMainCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
      (shop.name && shop.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shop.location && shop.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shop.dish && shop.dish.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shop.type && shop.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shop.subDish && shop.subDish.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // メインカテゴリーによるフィルタリング
    const matchesMainCategory = activeCategory === "すべて" || shop.dish === activeCategory;
    
    // サブカテゴリーによるフィルタリング
    const matchesSubCategory = activeSubCategory === "" || shop.subDish === activeSubCategory;
    
    // typeによるフィルタリング
    const matchesType = activeType === "" || shop.type === activeType;
    
    return matchesSearch && matchesMainCategory && matchesSubCategory && matchesType;
  });

  // カテゴリー変更ハンドラー
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveSubCategory(""); // サブカテゴリーをリセット
    setActiveType(""); // typeもリセット
    
    // URLを更新
    if (category === "すべて") {
      router.push("/categories", undefined, { shallow: true });
    } else {
      router.push(`/categories?category=${encodeURIComponent(category)}`, undefined, { shallow: true });
    }
  };

  // サブカテゴリー変更ハンドラー
  const handleSubCategoryChange = (subCategory: string) => {
    setActiveSubCategory(subCategory);
    
    // URLを更新
    const query: Record<string, string> = {};
    if (activeCategory !== "すべて") {
      query.category = activeCategory;
    }
    if (subCategory) {
      query.subCategory = subCategory;
    }
    if (activeType) {
      query.type = activeType;
    }
    
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    router.push(
      queryString ? `/categories?${queryString}` : "/categories", 
      undefined, 
      { shallow: true }
    );
  };

  // typeフィルター変更ハンドラー
  const handleTypeChange = (type: string) => {
    setActiveType(type);
    
    // URLを更新
    const query: Record<string, string> = {};
    if (activeCategory !== "すべて") {
      query.category = activeCategory;
    }
    if (activeSubCategory) {
      query.subCategory = activeSubCategory;
    }
    if (type) {
      query.type = type;
    }
    
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    router.push(
      queryString ? `/categories?${queryString}` : "/categories", 
      undefined, 
      { shallow: true }
    );
  };

  // カテゴリー別のカウント計算
  const categoryCount = mainCategories.reduce((acc, category) => {
    if (category !== "すべて") {
      acc[category] = shops.filter(shop => shop.dish === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // 人気カテゴリーを表示するかどうかの判定（修正：検索クエリがない場合は常に表示）
  const showTopCategories = !isLoading && !searchQuery;

  return (
    <Layout title="カテゴリー | キッチンカー探し">
      <div className="category-banner">
        <div className="category-banner-content">
          <h1>カテゴリーから探す</h1>
          <p>お好みの料理ジャンルから、キャンパス周辺の美味しいキッチンカーを見つけましょう！</p>
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
        
        {/* トップカテゴリー一覧 - 修正版（検索クエリがない場合は常に表示） */}
        <div className="mb-12" style={{ 
          minHeight: showTopCategories ? 'auto' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out'
        }}>
          {showTopCategories && (
            <>
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
            </>
          )}
        </div>
        
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
        
        {/* 動的サブカテゴリーフィルター */}
        {activeCategory !== "すべて" && (
          <div className="mb-8">
            <DynamicSubCategoryFilter 
              selectedSubCategory={activeSubCategory}
              onSubCategoryChange={handleSubCategoryChange}
              dishCategory={activeCategory}
            />
          </div>
        )}
        
        {/* タイプフィルター */}
        <div className="mb-8">
          <TypeFilter 
            selectedType={activeType}
            onTypeChange={handleTypeChange}
            dishCategory={activeCategory !== "すべて" ? activeCategory : undefined}
          />
        </div>
        
        {/* 検索とフィルターの結果表示 */}
        <div className="result-info-box">
          <div className="result-info-content">
            <div className="result-info-text">
              {filteredShops.length}件のキッチンカーが見つかりました
              {searchQuery && ` 「${searchQuery}」の検索結果`}
              {activeCategory !== "すべて" && ` カテゴリー: ${activeCategory}`}
              {activeSubCategory && ` > ${activeSubCategory}`}
              {activeType && ` タイプ: ${activeType}`}
            </div>
            {(searchQuery || activeCategory !== "すべて" || activeSubCategory || activeType) && (
              <button
                onClick={() => {
                  setActiveCategory("すべて");
                  setActiveSubCategory("");
                  setActiveType("");
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
              message="検索条件を変更するか、別のカテゴリーを選択してみてください。"
              icon="🔍"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}