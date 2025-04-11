// components/Header.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth, provider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

type HeaderProps = {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
};

export default function Header({ isDarkMode, toggleDarkMode }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // ユーザー認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  // スクロール検出
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ログイン処理
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setIsMenuOpen(false);
    } catch (err) {
      console.error("ログインエラー", err);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
    } catch (err) {
      console.error("ログアウトエラー", err);
    }
  };

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
  );
}