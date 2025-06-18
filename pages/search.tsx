// pages/search.tsx（改良版）
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, query, where, orderBy, startAt, endAt } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Layout from "@/components/Layout";
import ShopCard from "@/components/shop/ShopCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import NoticeBanner from "@/components/NoticeBanner";
import Button from "@/components/ui/Button";
import Link from "next/link";

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

type SortOption = 'name' | 'rating' | 'reviews';

const POPULAR_KEYWORDS = ['クレープ', 'たこ焼き', '唐揚げ', 'カレー', 'ラーメン', 'コーヒー', 'サンドイッチ', 'ドリンク'];

export default function SearchPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // URLからクエリパラメータを取得
  useEffect(() => {
    if (router.query.q && typeof router.query.q === 'string') {
      const query = decodeURIComponent(router.query.q);
      setSearchQuery(query);
      if (searchInputRef.current) {
        searchInputRef.current.value = query;
      }
    }
    
    if (router.query.sort && typeof router.query.sort === 'string') {
      setSortBy(router.query.sort as SortOption);
    }
  }, [router.query]);

  // 検索履歴をローカルストレージから取得
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
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

  // 検索結果のフィルタリングとソート
  const filteredAndSortedShops = (() => {
    let filtered = shops;
    
    // 検索フィルタリング
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = shops.filter(shop => 
        (shop.name && shop.name.toLowerCase().includes(query)) ||
        (shop.location && shop.location.toLowerCase().includes(query)) ||
        (shop.dish && shop.dish.toLowerCase().includes(query)) ||
        (shop.type && shop.type.toLowerCase().includes(query)) ||
        (shop.subDish && shop.subDish.toLowerCase().includes(query))
      );
    }
    
    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'ja');
      }
    });
    
    return filtered;
  })();

  // 表示制限適用
  const displayedShops = filteredAndSortedShops.slice(0, displayLimit);

  // 検索履歴に追加
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // 検索フォーム送信処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current) {
      const newQuery = searchInputRef.current.value.trim();
      setSearchQuery(newQuery);
      setDisplayLimit(12); // 検索時にリセット
      
      if (newQuery) {
        addToSearchHistory(newQuery);
        router.push(`/search?q=${encodeURIComponent(newQuery)}${sortBy !== 'name' ? `&sort=${sortBy}` : ''}`, undefined, { shallow: true });
      } else {
        router.push('/search', undefined, { shallow: true });
      }
      setShowSuggestions(false);
    }
  };

  // キーワード検索処理
  const searchKeyword = (keyword: string) => {
    if (searchInputRef.current) {
      searchInputRef.current.value = keyword;
    }
    setSearchQuery(keyword);
    addToSearchHistory(keyword);
    router.push(`/search?q=${encodeURIComponent(keyword)}${sortBy !== 'name' ? `&sort=${sortBy}` : ''}`, undefined, { shallow: true });
    setShowSuggestions(false);
  };

  // ソート変更処理
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('q', searchQuery);
    if (newSort !== 'name') queryParams.set('sort', newSort);
    
    const queryString = queryParams.toString();
    router.push(`/search${queryString ? `?${queryString}` : ''}`, undefined, { shallow: true });
  };

  // 検索クリア処理
  const clearSearch = () => {
    setSearchQuery("");
    setDisplayLimit(12);
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    router.push('/search', undefined, { shallow: true });
    setShowSuggestions(false);
  };

  // もっと見る処理
  const loadMore = () => {
    setDisplayLimit(prev => prev + 12);
  };

  // 入力フォーカス時の処理
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // 入力外クリック時の処理
  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <Layout title={`検索結果${searchQuery ? `: ${searchQuery}` : ''} | キッチンカー探し`}>
      <div className="search-page">
        <div className="container">
          <div className="search-header">
            <h1 className="search-page-title">キッチンカー検索</h1>
            <p className="search-page-subtitle">お探しのキッチンカーを見つけましょう</p>
            
            {/* 検索ボックス */}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="キッチンカー名、料理名、場所で検索..."
                    className="search-main-input"
                    defaultValue={searchQuery}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  <button type="submit" className="search-submit-button">
                    
                  </button>
                </div>
                
                {/* 検索候補 */}
                {showSuggestions && (searchHistory.length > 0 || !searchQuery) && (
                  <div className="search-suggestions">
                    {searchHistory.length > 0 && (
                      <div className="suggestion-section">
                        <h4 className="suggestion-title">最近の検索</h4>
                        <div className="suggestion-items">
                          {searchHistory.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => searchKeyword(item)}
                              className="suggestion-item"
                            >
                              <svg className="suggestion-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!searchQuery && (
                      <div className="suggestion-section">
                        <h4 className="suggestion-title">人気のキーワード</h4>
                        <div className="suggestion-items">
                          {POPULAR_KEYWORDS.map((keyword) => (
                            <button
                              key={keyword}
                              onClick={() => searchKeyword(keyword)}
                              className="suggestion-item"
                            >
                              <svg className="suggestion-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              {keyword}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
            
            {/* 検索結果情報とソート */}
            {searchQuery && (
              <div className="search-result-header">
                <div className="result-info">
                  <span className="result-text">
                    「<strong>{searchQuery}</strong>」の検索結果: {filteredAndSortedShops.length}件
                  </span>
                  <button onClick={clearSearch} className="clear-search-button">
                    検索をクリア
                  </button>
                </div>
                
                <div className="sort-controls">
                  <span className="sort-label">並び順:</span>
                  <div className="sort-options">
                    <button
                      onClick={() => handleSortChange('name')}
                      className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                    >
                      名前順
                    </button>
                    <button
                      onClick={() => handleSortChange('rating')}
                      className={`sort-option ${sortBy === 'rating' ? 'active' : ''}`}
                    >
                      評価順
                    </button>
                    <button
                      onClick={() => handleSortChange('reviews')}
                      className={`sort-option ${sortBy === 'reviews' ? 'active' : ''}`}
                    >
                      レビュー数順
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 検索結果 */}
          <div className="search-results">
            {isLoading ? (
              <LoadingIndicator message="検索結果を読み込み中..." />
            ) : searchQuery ? (
              filteredAndSortedShops.length > 0 ? (
                <>
                  <div className="search-results-grid">
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
                  
                  {/* もっと見るボタン */}
                  {displayLimit < filteredAndSortedShops.length && (
                    <div className="load-more-section">
                      <Button onClick={loadMore} variant="secondary">
                        もっと見る ({filteredAndSortedShops.length - displayLimit}件)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-results">
                  <NoticeBanner
                    title="検索結果が見つかりませんでした"
                    message="検索キーワードを変更するか、カテゴリーから探してみてください。"
                    icon="🔍"
                  />
                </div>
              )
            ) : (
              <div className="empty-search-state">
                <div className="empty-state-icon">🔍</div>
                <h2 className="empty-state-title">検索キーワードを入力してください</h2>
                <p className="empty-state-description">
                  キッチンカー名、料理名、場所などで検索できます
                </p>
                
                {/* 人気キーワード */}
                <div className="popular-keywords-section">
                  <p className="popular-keywords-title">人気の検索キーワード:</p>
                  <div className="popular-keywords-grid">
                    {POPULAR_KEYWORDS.map((keyword) => (
                      <button
                        key={keyword}
                        onClick={() => searchKeyword(keyword)}
                        className="popular-keyword-button"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 関連リンク */}
          <div className="related-links">
            <h3 className="related-links-title">他の方法で探す</h3>
            <div className="related-links-grid">
              <Link href="/categories" className="related-link-card">
                <div className="related-link-icon">📁</div>
                <div className="related-link-content">
                  <h4>カテゴリーから探す</h4>
                  <p>料理ジャンル別に探せます</p>
                </div>
              </Link>
              <Link href="/map" className="related-link-card">
                <div className="related-link-icon">🗺️</div>
                <div className="related-link-content">
                  <h4>マップで探す</h4>
                  <p>場所から近くのお店を見つけられます</p>
                </div>
              </Link>
              <Link href="/calendar" className="related-link-card">
                <div className="related-link-icon">📅</div>
                <div className="related-link-content">
                  <h4>出店予定を確認</h4>
                  <p>今後の出店スケジュールをチェック</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}