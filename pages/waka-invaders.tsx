// pages/waka-invaders.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import WakaInvaders from '@/components/games/WakaInvaders.tsx';
import Link from 'next/link';

export default function WakaInvadersPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <Layout title="Waka Invaders | キッチンカー探し">
      <Head>
        <meta name="description" content="WakaInvaders - 隠しゲームで遊ぼう！" />
      </Head>
      
      <div className="game-container">
        <div className="game-header">
          <h1>Waka Invaders</h1>
          <p className="game-subtitle">特殊コマンド「Waka」で発見された隠しゲーム！</p>
        </div>
        
        <div className="game-wrapper">
          <WakaInvaders isMobile={isMobile} />
        </div>
        
        <div className="game-instructions">
          <div className="instructions-box">
            <h2>遊び方</h2>
            {isMobile ? (
              <ul>
                <li>画面左右をタップして自機を移動</li>
                <li>画面上部のシュートボタンでビームを発射</li>
                <li>インベーダーを全て倒してスコアを稼ごう！</li>
              </ul>
            ) : (
              <ul>
                <li>← → キーで自機を左右に移動</li>
                <li>スペースキーでビームを発射</li>
                <li>インベーダーを全て倒してスコアを稼ごう！</li>
              </ul>
            )}
          </div>
        </div>
        
        <div className="back-to-home">
          <Link href="/" className="back-button">
            ホームに戻る
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .game-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        
        .game-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .game-header h1 {
          font-size: 2.5rem;
          color: #3b82f6;
        }
        
        .game-subtitle {
          color: #64748b;
        }
        
        .game-wrapper {
          background-color: #000;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          margin-bottom: 2rem;
        }
        
        .game-instructions {
          margin-bottom: 2rem;
        }
        
        .instructions-box {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .instructions-box h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #334155;
        }
        
        .instructions-box ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        
        .instructions-box li {
          margin-bottom: 0.5rem;
          color: #475569;
        }
        
        .back-to-home {
          text-align: center;
        }
        
        .back-button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        
        .back-button:hover {
          background-color: #2563eb;
        }
      `}</style>
    </Layout>
  );
}