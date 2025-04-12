// pages/waka-invaders.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import WakaInvaders from '@/components/games/WakaInvaders';
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
            <h2>ゲーム説明</h2>
            <p>5つのステージで構成された本格的インベーダーゲーム！</p>
            <p>敵を倒して高スコアを目指そう！様々なパワーアップアイテムを活用しよう！</p>
            
            <h3>パワーアップアイテム</h3>
            <ul className="powerup-list">
              <li><span className="powerup-icon powerup-speed">S</span> スピードアップ - 移動速度が上がる</li>
              <li><span className="powerup-icon powerup-shield">I</span> シールド - 一定時間無敵になる</li>
              <li><span className="powerup-icon powerup-multi">M</span> マルチショット - 一度に3発の弾を発射できる</li>
            </ul>
            
            <h3>敵の種類</h3>
            <ul className="enemy-list">
              <li><span className="enemy-icon enemy-red"></span> 赤い敵 - 点数: 40点</li>
              <li><span className="enemy-icon enemy-orange"></span> オレンジの敵 - 点数: 30点</li>
              <li><span className="enemy-icon enemy-green"></span> 緑の敵 - 点数: 20点</li>
              <li><span className="enemy-icon enemy-blue"></span> 青い敵 - 点数: 10点</li>
              <li><span className="enemy-icon enemy-purple"></span> ボス - 点数: 100点 - 強力な攻撃と高い耐久力</li>
            </ul>
            
            <h3>操作方法</h3>
            {isMobile ? (
              <ul>
                <li>画面上部をタップ: ビームを発射</li>
                <li>画面下部をタップ: 左右に移動</li>
                <li>画面中央をタップ: ポーズ切り替え</li>
              </ul>
            ) : (
              <ul>
                <li>← → キー: 自機を左右に移動</li>
                <li>スペースキー: ビームを発射</li>
                <li>Pキー: ポーズ切り替え</li>
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
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .game-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .game-header h1 {
          font-size: 2.5rem;
          color: #3b82f6;
          margin-bottom: 0.5rem;
          font-weight: 800;
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        }
        
        .game-subtitle {
          color: #64748b;
          font-size: 1.1rem;
        }
        
        .game-wrapper {
          background-color: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 30px rgba(59, 130, 246, 0.3);
          margin-bottom: 2rem;
        }
        
        .game-instructions {
          margin-bottom: 2rem;
        }
        
        .instructions-box {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .instructions-box h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }
        
        .instructions-box h3 {
          font-size: 1.2rem;
          margin: 1.5rem 0 0.75rem;
          color: #334155;
        }
        
        .instructions-box p {
          margin-bottom: 1rem;
          color: #475569;
          line-height: 1.6;
        }
        
        .instructions-box ul {
          list-style-type: none;
          padding-left: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .instructions-box li {
          margin-bottom: 0.5rem;
          color: #475569;
          display: flex;
          align-items: center;
        }
        
        .powerup-list li, .enemy-list li {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .powerup-icon {
          display: inline-flex;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          margin-right: 10px;
          flex-shrink: 0;
        }
        
        .powerup-speed {
          background-color: #22c55e;
          color: white;
        }
        
        .powerup-shield {
          background-color: #60a5fa;
          color: white;
        }
        
        .powerup-multi {
          background-color: #fbbf24;
          color: white;
        }
        
        .enemy-icon {
          display: inline-block;
          width: 24px;
          height: 16px;
          margin-right: 10px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        
        .enemy-red {
          background-color: #ef4444;
        }
        
        .enemy-orange {
          background-color: #f97316;
        }
        
        .enemy-green {
          background-color: #84cc16;
        }
        
        .enemy-blue {
          background-color: #06b6d4;
        }
        
        .enemy-purple {
          background-color: #8b5cf6;
        }
        
        .back-to-home {
          text-align: center;
          margin-top: 2rem;
        }
        
        .back-button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: background-color 0.3s;
          text-decoration: none;
        }
        
        .back-button:hover {
          background-color: #2563eb;
        }
        
        @media (max-width: 640px) {
          .game-header h1 {
            font-size: 2rem;
          }
          
          .game-subtitle {
            font-size: 1rem;
          }
          
          .instructions-box {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
}