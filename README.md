コンフリクトを解決した README.md の修正版を作成しました：

```markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

# キッチンカー情報アプリ

## 概要
大学に来るキッチンカーの場所やレビューを確認できるWebアプリです。

## URL
🔗 https://kichen-car-app.vercel.app/

## 使い方
1. Googleでログイン
2. キッチンカーを選択
3. レビューを投稿・閲覧！

## 開発技術
- Next.js (React)
- Firebase (Auth, Firestore)
- TypeScript
- Tailwind CSS

# コンポーネントの説明

基本コンポーネント:

- Header: ナビゲーションとユーザー認証を管理
- Footer: サイト全体の共通フッター
- Layout: ヘッダー、フッター、メタデータを含むページレイアウト

プロフィール関連コンポーネント:

- ProfileContainer: プロフィールページの基本構造
- ProfileInfo: プロフィール詳細情報を表示
- ProfileComment: ユーザーの自己紹介セクション
- ProfileCompletion: プロフィール完成度バー
- StatsContainer: 統計情報を表示
- ActivitySection: アクティビティ一覧を表示

UI コンポーネント:

- Button: さまざまなスタイルのボタン
- FormGroup, FormInput, FormSelect など: フォーム要素
- NoticeBanner: 通知バナー
- LoadingIndicator: ローディング状態表示
- SuccessMessage: 成功メッセージ

ショップ関連コンポーネント:

- ShopCard: キッチンカーカード表示
- RatingStars: 星評価の表示
- ReviewForm: レビュー投稿フォーム
- ReviewList: レビュー一覧表示

**共通で使うものは全てコンポーネントにしてメンテナンス性UP!!!**

# Windowsユーザ用環境構築

[npmをインストールする](https://nodejs.org/ja/)

出来たら再起動する

再起動したらpowerShellを管理者で実行する

```ps
Set-ExecutionPolicy RemoteSigned
```

を実行して 「Y」 で承認する

次に、VScodeでリポジトリをクローンする

クローンしたら次は、

VSCODEのTerminalに
```bash
node -v; npm -v
```

これでバージョンが表示されたらOK

次に、
```bash
npm install next react react-dom
```

を実行する

**実行には時間がかかるのでここでトイレや喫煙もしくは0721を行っておくこと**

次に、
プロジェクトルートに瑶太からもらった`.env.local`をプロジェクトルートに置く

```bash
npm run dev
```

これを実行して、表示されたURLに行って表示されればOKです。
```