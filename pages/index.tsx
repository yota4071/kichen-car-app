// pages/index.tsx
import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import ShopCard from "@/components/shop/ShopCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import Button from "@/components/ui/Button";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
};

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        const querySnapshot = await getDocs(collection(db, "kitchens"));
        const shopList: Shop[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Shop, "id">),
        }));
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
      shop.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // カテゴリーによるフィルタリング
    const matchesCategory = activeCategory === "すべて" || shop.type === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // おすすめのキッチンカー（最初の3件を表示）
  const featuredShops = shops.slice(0, 3);

  return (
    <Layout>
      {/* ヒーローセクション */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">あなたの近くの美味しい<br />キッチンカーを見つけよう</h1>
            <p className="hero-description">地元で人気のキッチンカーを検索して、新しい味の発見を楽しみましょう</p>
            
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
      {featuredShops.length > 0 && (
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

          {/* カテゴリーフィルター */}
          <div className="filter-scroll">
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`category-button ${activeCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 検索とフィルターの結果表示 */}
          {(searchQuery || activeCategory !== "すべて") && (
            <div className="filter-results">
              <div className="result-text">
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
                }}
                className="clear-filter"
              >
                絞り込みをクリア
              </button>
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