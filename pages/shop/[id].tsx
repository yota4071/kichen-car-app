import { useRouter } from "next/router";
import { doc, getDoc, getDocs, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

type Shop = {
  name: string;
  location: string;
  image: string;
  type?: string;
};

type Review = {
  rating: number;
  comment: string;
  displayName: string;
  createdAt?: Timestamp;
};

export default function ShopDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shop, setShop] = useState<Shop | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 初回にログイン状態を監視する
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  const fetchReviews = async () => {
    if (!id) return;
    const reviewRef = collection(db, "kitchens", String(id), "reviews");
    const snapshot = await getDocs(reviewRef);
    const reviewList: Review[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Review);
    // レビューを日付順に並べ替え（新しい順）
    reviewList.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
    setReviews(reviewList);
  };

  // ログイン
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("ログインエラー", err);
    }
  };

  // ログアウト
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("ログアウトエラー", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchShop = async () => {
      const ref = doc(db, "kitchens", String(id));
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setShop(snapshot.data() as Shop);
      }
    };
    fetchShop();
    fetchReviews();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const displayName = userData?.displayName ?? "名無し";

    const reviewRef = collection(db, "kitchens", String(id), "reviews");
    await addDoc(reviewRef, {
      rating,
      comment,
      displayName,
      createdAt: serverTimestamp(),
    });

    setComment("");
    setRating(5);
    setSuccess(true);
    fetchReviews();
    setTimeout(() => setSuccess(false), 3000);
  };

  // 星評価を表示するヘルパー関数
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="star" style={{ color: i <= rating ? '#FFB800' : '#CBD5E0' }}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  if (!shop) return (
    <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
      <div className="loading">
        <p>読み込み中...</p>
      </div>
    </div>
  );

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

      {/* 店舗詳細 */}
      <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="shop-detail-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* 店舗情報 */}
          <div className="shop-detail-header" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '2rem',
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="shop-image-name" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <img 
                src={shop.image} 
                alt={shop.name} 
                style={{ 
                  width: '100%', 
                  maxHeight: '300px', 
                  objectFit: 'cover', 
                  borderRadius: '0.5rem'
                }} 
              />
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{shop.name}</h1>
                <p style={{ fontSize: '1rem', color: '#718096' }}>
                  <span style={{ marginRight: '0.5rem' }}>📍</span>
                  {shop.location}
                </p>
                {shop.type && (
                  <div style={{ 
                    display: 'inline-block', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem',
                    marginTop: '0.5rem'
                  }}>
                    {shop.type}
                  </div>
                )}
              </div>
            </div>

            <div className="user-login-section" style={{ 
              backgroundColor: '#f9fafb', 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>ログイン中: {user.displayName || user.email}</span>
                  <button 
                    onClick={handleLogout} 
                    style={{ 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      padding: '0.375rem 0.75rem', 
                      borderRadius: '0.375rem', 
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={handleLogin} 
                    style={{ 
                      backgroundColor: '#3b82f6', 
                      color: 'white', 
                      padding: '0.375rem 0.75rem', 
                      borderRadius: '0.375rem', 
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Googleでログイン
                  </button>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#6b7280' }}>
                    レビューを投稿するにはログインが必要です
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* タブ */}
          <div className="tabs" style={{ 
            display: 'flex', 
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <button 
              onClick={() => setActiveTab('info')} 
              style={{ 
                padding: '0.75rem 1.5rem', 
                fontWeight: activeTab === 'info' ? 'bold' : 'normal',
                color: activeTab === 'info' ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === 'info' ? '2px solid #3b82f6' : '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              詳細情報
            </button>
            <button 
              onClick={() => setActiveTab('reviews')} 
              style={{ 
                padding: '0.75rem 1.5rem', 
                fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
                color: activeTab === 'reviews' ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === 'reviews' ? '2px solid #3b82f6' : '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              レビュー ({reviews.length})
            </button>
          </div>

          {/* コンテンツ */}
          {activeTab === 'info' && (
            <div className="detail-content" style={{ 
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>キッチンカー情報</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                このキッチンカーの詳細情報です。お気に入りのキッチンカーを見つけて、美味しい食事を楽しみましょう！
              </p>
              
              <Link 
                href="/" 
                style={{ 
                  color: '#3b82f6', 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                <span style={{ marginRight: '0.25rem' }}>←</span> トップページに戻る
              </Link>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              {/* レビュー投稿フォーム */}
              {user ? (
                <div className="review-form" style={{ 
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>レビューを投稿する</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        評価
                        <div style={{ marginTop: '0.5rem' }}>
                          {[1, 2, 3, 4, 5].map((value) => (
                            <span
                              key={value}
                              onClick={() => setRating(value)}
                              style={{ 
                                cursor: 'pointer', 
                                color: value <= rating ? '#FFB800' : '#CBD5E0',
                                fontSize: '1.5rem',
                                padding: '0 0.25rem'
                              }}
                            >
                              {value <= rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </label>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        コメント
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            marginTop: '0.5rem',
                            minHeight: '100px'
                          }}
                          placeholder="このキッチンカーの感想を教えてください..."
                          required
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      style={{ 
                        backgroundColor: '#10b981', 
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.375rem',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      レビューを投稿
                    </button>

                    {success && (
                      <div style={{ 
                        marginTop: '1rem', 
                        backgroundColor: '#f0fff4', 
                        color: '#38a169',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #c6f6d5'
                      }}>
                        レビューが投稿されました！ご協力ありがとうございます。
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <div style={{ 
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}>
                  <p style={{ marginBottom: '1rem' }}>レビューを投稿するには、ログインしてください。</p>
                  <button
                    onClick={handleLogin}
                    style={{ 
                      backgroundColor: '#3b82f6', 
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.375rem',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Googleでログイン
                  </button>
                </div>
              )}

              {/* レビュー一覧 */}
              <div className="reviews-list" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>みんなのレビュー</h2>
                
                {reviews.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center',
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <p style={{ color: '#6b7280' }}>まだレビューはありません。最初のレビューを投稿してみませんか？</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {reviews.map((review, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          backgroundColor: 'white',
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <div style={{ marginBottom: '0.5rem' }}>
                          {renderStars(review.rating)}
                        </div>
                        <p style={{ 
                          marginBottom: '1rem',
                          lineHeight: '1.6'
                        }}>
                          {review.comment}
                        </p>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          color: '#6b7280',
                          fontSize: '0.875rem'
                        }}>
                          <span style={{ marginRight: '0.5rem' }}>👤</span>
                          {review.displayName || '匿名ユーザー'}
                          {review.createdAt && (
                            <span style={{ 
                              marginLeft: '0.5rem',
                              color: '#9ca3af',
                              fontSize: '0.75rem'
                            }}>
                              {new Date(review.createdAt.toMillis()).toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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