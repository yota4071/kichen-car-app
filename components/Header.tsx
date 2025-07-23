// components/Header.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth, provider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
//import '@/styles/Header.module.css'; // 追加
import { checkIsAdmin } from '@/lib/admin'; // 追加

// 管理者ユーザーIDの配列
const ADMIN_USER_IDS: string[] = [
  // 管理者のuidをここに追加
  "2",
  "1"
];



type HeaderProps = {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
};

export default function Header({  }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false); // 管理者フラグ追加

   // ユーザー認証状態の監視
   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 管理者かどうか確認
        const adminStatus = await checkIsAdmin(user);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
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

 // components/Header.tsxを修正して管理者アクセス機能を追加

// 検索処理の部分を修正
// handleSearch 関数を更新
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  
    const trimmedQuery = searchQuery.trim().toLowerCase();
  
    if (!trimmedQuery) return;
  
    // 特殊コマンドのチェック
    if (trimmedQuery === "waka") {
      router.push('/waka-invaders');
      setSearchQuery('');
      return;
    }
  
    if (trimmedQuery === "oz") {
      router.push('/oz-invaders');
      setSearchQuery('');
      return;
    }
  
    // 管理者アクセスコマンド
    if (trimmedQuery === "admin123") {
      router.push('/admin/calendar');
      setSearchQuery('');
      return;
    }
  
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setSearchQuery('');
  };


  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
        <Link href="/" className="logo">
        <span style={{ fontFamily: "'Bangers', cursive", fontSize: '45px' }}>
            NOM ! NOM !
        </span>
        </Link>

          <nav>
            <ul className="nav-list">
              {/* <li><Link href="/" className="nav-link">ホーム</Link></li> */}
              <li><Link href="/categories" className="nav-link">カテゴリー</Link></li>
              <li><Link href="/map" className="nav-link">マップ</Link></li>
              <li><Link href="/ranking" className="nav-link">ランキング</Link></li>
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
    
    {/* 管理者向けメニューを追加 - ハードコードされたIDの配列を使わず、isAdmin状態を使用 */}
    {isAdmin && (
      <div className="admin-menu-dropdown">
        <button className="admin-dropdown-button">
          管理メニュー ▼
        </button>
        <div className="admin-dropdown-content">
          <Link href="/admin/calendar" className="admin-link">
            カレンダー管理
          </Link>
          <Link href="/admin/shops" className="admin-link">
            店舗管理
          </Link>
        </div>
      </div>
    )}
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
      <span className="search-icon"></span>
    </form>
    <ul>
      <li className="mobile-nav-item"><Link href="/">ホーム</Link></li>
      <li className="mobile-nav-item"><Link href="/categories">カテゴリー</Link></li>
      <li className="mobile-nav-item"><Link href="/map">マップ</Link></li>
      <li className="mobile-nav-item"><Link href="/calendar">カレンダー</Link></li>
      <li className="mobile-nav-item"><Link href="/ranking">ランキング</Link></li>
      
      {user ? (
        <>
          <li className="mobile-nav-item"><Link href="/mypage">マイページ</Link></li>
          {/* 管理者メニュー */}
          {ADMIN_USER_IDS.includes(user.uid) && (
            <>
              <li className="mobile-nav-item mobile-admin-title">管理者メニュー</li>
              <li className="mobile-nav-item mobile-admin-item">
                <Link href="/admin/calendar">カレンダー管理</Link>
              </li>
              <li className="mobile-nav-item mobile-admin-item">
                <Link href="/admin/shops">店舗管理</Link>
              </li>
            </>
          )}
          <li className="mobile-nav-item">
            <button onClick={handleLogout} className="mobile-logout-button">ログアウト</button>
          </li>
        </>
      ) : (
        <li className="mobile-nav-item">
          <button onClick={handleLogin} className="mobile-login-button">ログイン</button>
        </li>
      )}
      
      
    </ul>
  </div>
</div>
    </header>
  );

  <style jsx>{`
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .admin-menu-dropdown {
      position: relative;
      display: inline-block;
    }
    
    .admin-dropdown-button {
      background-color: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }
    
    .admin-dropdown-button:hover {
      background-color: #1d4ed8;
    }
    
    .admin-dropdown-content {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 160px;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 0.375rem;
      overflow: hidden;
      z-index: 10;
    }
    
    .admin-menu-dropdown:hover .admin-dropdown-content {
      display: block;
    }
    
    .admin-link {
      display: block;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #4b5563;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    .admin-link:hover {
      background-color: #f3f4f6;
      color: #1f2937;
    }

     /* モバイルメニューのログイン・ログアウトボタン */
.mobile-login-button, .mobile-logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.mobile-login-button {
  background-color: #3b82f6;
  color: white;
}

.mobile-login-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.mobile-logout-button {
  background-color: #fee2e2;
  color: #ef4444;
}

.mobile-logout-button:hover {
  background-color: #fecaca;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

/* アイコンを追加 */
.mobile-login-button::before {
  content: "👤";
  margin-right: 0.75rem;
}

.mobile-logout-button::before {
  content: "🚪";
  margin-right: 0.75rem;
}

/* mobile-nav-item のスタイル調整 */
.mobile-nav-item {
  margin-bottom: 0.5rem;
  width: 100%;
}

/* 親要素のli内でボタンを正しく配置 */
.mobile-nav-item .mobile-login-button,
.mobile-nav-item .mobile-logout-button {
  margin: 0;
  width: 100%;
}

  `}</style>

}


