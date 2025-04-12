// pages/_app.tsx
import '@/styles/globals.css';
import '@/styles/mypage.css';
import '@/styles/review-styles.css';
import '@/styles/categories.css'; // 新しく追加
import '@/styles/about.css'; // 新しく追加したCSSファイル
import '@/styles/games.css';
import '@/styles/share-button.css';
import '@/styles/menu-styles.css';
import '@/styles/Header.module.css'; // 追加
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>キッチンカー探し | 地元で人気のキッチンカーを見つけよう</title>
        <meta name="description" content="お近くの美味しいキッチンカーをすぐに見つけられるアプリ。ユーザーのレビューやお気に入り機能も充実。" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}