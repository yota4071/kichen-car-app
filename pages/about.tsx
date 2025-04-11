// pages/about.tsx
import Image from "next/image";
import Layout from "@/components/Layout";

type Developer = {
  name: string;
  image: string;
  comment: string;
};

const developers: Developer[] = [
  {
    name: "Oz",
    image: "/images/developers/ozawa.jpg", // 画像パス
    comment: "IoTと社会課題解決に挑戦中！",
  },
  {
    name: "Waka",
    image: "/images/developers/wakamiya.jpg",
    comment: "アサイーボウルに人生を救われた男。",
  },
];

export default function AboutPage() {
  return (
    <Layout title="サイトについて">
      <div className="container py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">サイトについて</h1>
        <p className="mb-4 text-gray-700 leading-relaxed">
          「キッチンカー探し」は、大学キャンパスや地域イベントで出店するキッチンカー情報をわかりやすく提供するWebアプリです。
        </p>
        <p className="mb-8 text-gray-700 leading-relaxed">
          利用者は出店中のキッチンカーの位置、メニュー、レビューを閲覧できるほか、
          お気に入りのキッチンカーを探したりレビュー投稿も可能です。
        </p>

        {/* 🔽 開発者紹介セクション */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">開発メンバー紹介</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {developers.map((dev, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-4 text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src={dev.image}
                  alt={dev.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">{dev.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{dev.comment}</p>
            </div>
          ))}
        </div>

        <p className="text-gray-500 mt-12 text-sm text-right">最終更新：2025年4月</p>
        {/* ▼ 会社紹介を大きく強調表示 */}
        <div className="mt-16 bg-blue-600 text-white p-10 rounded-xl shadow-xl text-center">
            <h2 className="text-4xl font-bold mb-4 tracking-wide">株式会社</h2>
             <p className="text-lg font-light">
                キッチンカーと地域をつなぐ<br className="sm:hidden" />未来の架け橋をつくる。
             </p>
        </div>
      </div>
    </Layout>
  );
}