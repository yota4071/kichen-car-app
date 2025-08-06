// components/Layout.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import NoticeSlider from './NoticeSlider';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export default function Layout({ 
  children, 
  title = 'NomNom! | 地元で人気のキッチンカーを見つけよう', 
  description = 'お近くの美味しいキッチンカーをすぐに見つけられるアプリ。ユーザーのレビューやお気に入り機能も充実。'
}: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(80);

  // ダークモード初期設定（オプション）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  // ヘッダーの高さを取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateHeaderHeight = () => {
        const header = document.querySelector('.header') as HTMLElement;
        if (header) {
          setHeaderHeight(header.offsetHeight);
        }
      };

      // 初期設定
      updateHeaderHeight();

      // ウィンドウリサイズ時に再計算
      window.addEventListener('resize', updateHeaderHeight);
      
      return () => window.removeEventListener('resize', updateHeaderHeight);
    }
  }, []);

  // ダークモード切り替え（オプション）
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode));
      document.documentElement.classList.toggle('dark', newDarkMode);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Sticky Notice Slider */}
      <div className="sticky-notice-wrapper" style={{ top: `${headerHeight}px` }}>
        <NoticeSlider />
      </div>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      
      <style jsx>{`
        .sticky-notice-wrapper {
          position: sticky;
          z-index: 50;
          background-color: var(--primary-color);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}