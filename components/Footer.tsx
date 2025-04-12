// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>
            <span style={{ fontFamily: "'Bangers', cursive", fontSize: '24px' }}>
                NOM ! NOM !
            </span>
            </h3>
            <p style={{ color: '#718096', marginBottom: '1rem' }}>
              お近くの美味しいキッチンカーをすぐに見つけられるアプリ
            </p>
          </div>
          
          <div className="footer-column">
            <h3>リンク</h3>
            <div className="footer-links">
              <Link href="/" className="footer-link">ホーム</Link>
              <Link href="/categories" className="footer-link">カテゴリー</Link>
              <Link href="/map" className="footer-link">マップ</Link>
              <Link href="/about" className="footer-link">サイトについて</Link>
            </div>
          </div>
          
          <div className="footer-column">
            <h3>お問い合わせ</h3>
            <div className="footer-links">
              <Link href="/contact" className="footer-link">お問い合わせフォーム</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} <span style={{ fontFamily: "'Bangers', cursive", fontSize: '12px' }}>
            NOM ! NOM !
        </span> All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}