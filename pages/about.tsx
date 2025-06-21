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
    comment: "いっぱい使ってください！！",
  },
  {
    name: "Waka",
    image: "/images/waka.png",
    comment: "finding the best food trucks.",
  },
  {
    name: "rei",
    image: "/images/developers/rei.jpg", // 画像パス
    comment: "半年は暇やから",
  }
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
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: '19px' }}>
            NOM ! NOM ! は、大学キャンパスや地域イベントで出店するキッチンカー情報をわかりやすく提供するサイトです。
          </span>
          <br />
            
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
    {/* SVGアイコンを追加 */}
    <div className="company-logo">
      <img src="/images/LogoOnly.svg" alt="Qurest Logo" className="company-svg" />
    </div>
    <h2 className="company-title" style={{ fontFamily: "'Sintony', sans-serif" }}>
      Qurest
    </h2>
    <div className="company-divider"></div>
    <p className="company-description">
      最高のキッチンカーを見つけよう<br className="sm-only-break" />
    </p>
  </div>
</div>

        <p className="last-updated">最終更新：2025年4月</p>
      </div>
    </Layout>
  );
}