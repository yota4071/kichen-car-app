// components/Layout.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

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

  // ダークモード初期設定（オプション）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
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
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}