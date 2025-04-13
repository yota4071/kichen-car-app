// pages/about.tsx
import Image from "next/image";
import Layout from "@/components/Layout";

const currentYear = new Date().getFullYear();

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
      <div className="about-container">
        <div className="about-header">
          <h1 className="about-title">サイトについて</h1>
          <p className="about-subtitle">
            キャンパスや地域の美味しいを、もっと身近に
          </p>
        </div>

        <div className="about-description">
          <p>
          <p><span style={{ fontFamily: "'Bangers', cursive", fontSize: '19px' }}>
            NOM ! NOM ! は、大学キャンパスや地域イベントで出店するキッチンカー情報をわかりやすく提供するアプリです。 </span></p>
          </p>
          <p>
            利用者は出店中のキッチンカーの位置、メニュー、レビューを閲覧できるほか、
            お気に入りのキッチンカーを探したりレビュー投稿も可能です。
          </p>
        </div>

        <h2 className="section-title">開発メンバー紹介</h2>
        <div className="developers-grid">
          {developers.map((dev, i) => (
            <div key={i} className="developer-card">
              <div className="developer-image">
                <Image
                  src={dev.image}
                  alt={dev.name}
                  fill
                  sizes="(max-width: 640px) 7rem, 7rem"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div>
                <h3 className="developer-name">{dev.name}</h3>
                <p className="developer-comment">{dev.comment}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="company-section">
          <div className="company-content">
            <h2 className="company-title">株式会社</h2>
            <div className="company-divider"></div>
            <p className="company-description">
              キッチンカーと地域をつなぐ<br className="sm-only-break" />未来の架け橋をつくる。
            </p>
          </div>
        </div>

        <p className="last-updated">最終更新：2025年4月</p>
      </div>
    </Layout>
  );
}