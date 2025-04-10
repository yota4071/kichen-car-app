import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onAuthStateChanged, User, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import Link from "next/link";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
};

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ログイン処理
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("ログインエラー", err);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("ログアウトエラー", err);
    }
  };

  // ユーザー認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    
    return () => unsubscribe();
  }, []);

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

  // おすすめのキッチンカー（ダミーデータ）
  const featuredShops = shops.slice(0, 3);

  return (
    <div>
      {/* ヘッダー */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">
              キッチンカー探し
            </Link>

            <nav>
              <ul className="nav-list">
                <li><Link href="/" className="nav-link">ホーム</Link></li>
                <li><Link href="/categories" className="nav-link">カテゴリー</Link></li>
                <li><Link href="/map" className="nav-link">マップ</Link></li>
              </ul>
            </nav>

            <div className="search-bar">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="キッチンカーを検索..."
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </form>
            </div>

            {user ? (
              <div className="user-menu">
                <Link href="/mypage" className="nav-link">
                  マイページ
                </Link>
                <button onClick={handleLogout} className="login-button">
                  ログアウト
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="login-button">
                ログイン
              </button>
            )}

            <button
              className="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="container">
            <form onSubmit={handleSearch} className="mobile-search">
              <input
                type="text"
                placeholder="キッチンカーを検索..."
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </form>
            <ul>
              <li className="mobile-nav-item"><Link href="/">ホーム</Link></li>
              <li className="mobile-nav-item"><Link href="/categories">カテゴリー</Link></li>
              <li className="mobile-nav-item"><Link href="/map">マップ</Link></li>
              {user ? (
                <>
                  <li className="mobile-nav-item"><Link href="/mypage">マイページ</Link></li>
                  <li className="mobile-nav-item">
                    <button onClick={handleLogout}>ログアウト</button>
                  </li>
                </>
              ) : (
                <li className="mobile-nav-item">
                  <button onClick={handleLogin}>ログイン</button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>

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
                <Link key={`featured-${shop.id}`} href={`/shop/${shop.id}`} className="shop-card">
                  <div className="shop-image-container">
                    <img src={shop.image} alt={shop.name} className="shop-image" />
                    <div className="shop-type">{shop.type}</div>
                  </div>
                  <div className="shop-details">
                    <h3 className="shop-name">{shop.name}</h3>
                    <div className="shop-location">📍 {shop.location}</div>
                    <div className="rating">
                      <div className="stars">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">☆</span>
                      </div>
                      <span>(18)</span>
                    </div>
                  </div>
                </Link>
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
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>読み込み中...</div>
          ) : filteredShops.length > 0 ? (
            <div className="shop-grid">
              {filteredShops.map((shop) => (
                <Link key={shop.id} href={`/shop/${shop.id}`} className="shop-card">
                  <div className="shop-image-container">
                    <img src={shop.image} alt={shop.name} className="shop-image" />
                    <div className="shop-type">{shop.type}</div>
                  </div>
                  <div className="shop-details">
                    <h3 className="shop-name">{shop.name}</h3>
                    <div className="shop-location">📍 {shop.location}</div>
                    <div className="rating">
                      <div className="stars">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">☆</span>
                      </div>
                      <span>(18)</span>
                    </div>
                  </div>
                </Link>
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
              <Link href="/map" className="cta-button">
                マップを開く
              </Link>
            </div>
            <div className="cta-image">
              <div className="map-placeholder">
                🗺️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3>キッチンカー探し</h3>
              <p style={{ color: '#718096', marginBottom: '1rem' }}>
                お近くの美味しいキッチンカーをすぐに見つけられるアプリ
              </p>
            </div>
            
            <div className="footer-column">
              <h3>リンク</h3>
              <div className="footer-links">
                <Link href="/" className="footer-link">ホーム</Link>
                <Link href="/categories" className="footer-link">カテゴリー</Link>
                <Link href="/map" className="footer-link">マップ</Link>
                <Link href="/about" className="footer-link">サイトについて</Link>
              </div>
            </div>
            
            <div className="footer-column">
              <h3>お問い合わせ</h3>
              <div className="footer-links">
                <Link href="/contact" className="footer-link">お問い合わせフォーム</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} キッチンカー探し. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}