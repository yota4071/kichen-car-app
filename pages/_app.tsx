// pages/_app.tsx
import '@/styles/globals.css';
import '@/styles/mypage.css';
import '@/styles/review-styles.css';
import '@/styles/categories.css'; // 新しく追加
import '@/styles/about.css'; // 新しく追加したCSSファイル
import '@/styles/games.css';
import '@/styles/share-button.css';
import '@/styles/menu-styles.css';
import '@/styles/header.module.css'; // 追加
import '@/styles/map-styles.css'; // 追加
import '@/styles/contact.css'; // 追加
import '@/styles/search.css';
import '@/styles/responsive-fixes.css'; // 追加：スマホ版のレイアウト修正
import '@/styles/override.css';
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Nom!Nom!</title>
        <meta name="description" content="立命館大学のキッチンカーを探すならNOM!NOM!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}