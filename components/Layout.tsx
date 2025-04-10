import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth, provider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // ダークモード初期設定
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
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

  // ダークモード切り替え
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode));
      document.documentElement.classList.toggle('dark', newDarkMode);
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
    <div className="flex flex-col min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* ロゴ */}
            <Link href="/" className="flex items-center space-x-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                キッチンカー探し
              </span>
            </Link>

            {/* デスクトップナビゲーション */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="キッチンカーを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 py-2 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                  <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </form>
              </div>
              
              <nav className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    router.pathname === '/' 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800'
                  }`}
                >
                  ホーム
                </Link>
                <Link 
                  href="/categories"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    router.pathname.startsWith('/categories') 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800'
                  }`}
                >
                  カテゴリー
                </Link>
                <Link 
                  href="/map"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    router.pathname.startsWith('/map') 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800'
                  }`}
                >
                  マップ
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                  aria-label={isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
                >
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                </button>
                
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center space-x-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || 'ユーザー'} className="w-full h-full object-cover" />
                        ) : (
                          <span>{(user.displayName || 'ユーザー').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden scale-0 origin-top-right group-hover:scale-100 transition-transform duration-150 z-10">
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {user.displayName || user.email || 'ユーザー'}
                        </div>
                        <Link
                          href="/mypage"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          マイページ
                        </Link>
                        <Link
                          href="/mypage/edit"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          プロフィール編集
                        </Link>
                        <Link
                          href="/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          お気に入り
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          ログアウト
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    ログイン
                  </button>
                )}
              </div>
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-800 dark:text-gray-200">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-800 dark:text-gray-200">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 shadow-lg">
            <form onSubmit={handleSearch} className="p-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="キッチンカーを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="absolute left-3 top-3.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </form>
            
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname === '/' 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link
              href="/categories"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname.startsWith('/categories') 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              カテゴリー
            </Link>
            <Link
              href="/map"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname.startsWith('/map') 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              マップ
            </Link>
            
            <div className="flex items-center justify-between px-3 py-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
              >
                {isDarkMode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <span>ライトモード</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <span>ダークモード</span>
                  </>
                )}
              </button>
            </div>
            
            {user ? (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'ユーザー'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(user.displayName || 'ユーザー').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                      {user.displayName || 'ユーザー'}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <Link
                  href="/mypage"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  マイページ
                </Link>
                <Link
                  href="/mypage/edit"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  プロフィール編集
                </Link>
                <Link
                  href="/favorites"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  お気に入り
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogin}
                  className="w-full px-4 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  ログイン
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow pt-16 md:pt-20">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                >
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
                <span className="text-lg font-bold text-gray-800 dark:text-white">キッチンカー探し</span>
              </Link>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                お近くの美味しいキッチンカーをすぐに見つけられるアプリ
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-300">
                サイトマップ
              </h3>
              <div className="mt-4 space-y-2">
                <Link href="/" className="block text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  ホーム
                </Link>
                <Link href="/categories" className="block text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  カテゴリー
                </Link>
                <Link href="/map" className="block text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  マップ
                </Link>
                <Link href="/about" className="block text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  サイトについて
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-300">
                お問い合わせ
              </h3>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
                ご質問やフィードバックがありましたら、お気軽にお問い合わせください。
              </p>
              <div className="mt-4">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                >
                  お問い合わせ
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} キッチンカー探し. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}