// components/map/InteractiveMap.tsx
import React, { useState } from 'react';

// 型定義
type CampusKey = 'oic' | 'bkc' | 'kinugasa';

type Spot = {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
};



const InteractiveMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CampusKey>('oic');
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  
  // マーカー位置データ定義
  const spotData: Record<CampusKey, Spot[]> = {
    oic: [
      { id: 'plaza', name: '空のプラザ', x: 52, y: 58, description: '学生が集まる広場。キッチンカーが多く出店します。' },
      { id: 'terrace', name: 'TERRACE GATE前', x: 35, y: 58, description: '人気のキッチンカースポット。お昼時には行列ができることも。' },
    ]
    
    ,
    bkc: [
      { id: 'central-square', name: 'セントラルアーク', x: 50, y: 50, description: 'キャンパス中央の広場。天気の良い日は賑わいます。' },
      { id: 'west-wing', name: 'ウェストウィング', x: 30, y: 40, description: '工学部の学生に人気のスポット。創作料理が多いです。' },
      { id: 'promenade', name: 'プロムナード', x: 70, y: 60, description: '並木道沿いの開放的なエリア。定期的に出店があります。' }
    ],
    kinugasa: [
      { id: 'front-gate', name: '正門前', x: 50, y: 30, description: 'キャンパスの玄関口。多様なキッチンカーが出店します。' },
      { id: 'cafeteria', name: '食堂裏', x: 65, y: 55, description: '静かで穴場的なスポット。特色あるメニューを提供するキッチンカーが多いです。' },
      { id: 'garden', name: '中庭', x: 35, y: 65, description: '自然に囲まれた落ち着いた環境。季節限定メニューも楽しめます。' }
    ]
  };

  // マップ画像パス
  const mapImages: Record<CampusKey, string> = {
    oic: '/images/map.png', // OICのマップ画像
    bkc: '/images/bkc_map.png', // BKCのマップ画像（実際の画像に置き換えてください）
    kinugasa: '/images/kinugasa_map.png' // 衣笠のマップ画像（実際の画像に置き換えてください）
  };

  // キャンパス名の表示名
  const campusNames: Record<CampusKey, string> = {
    oic: 'OIC（大阪いばらきキャンパス）',
    bkc: 'BKC（びわこ・くさつキャンパス）',
    kinugasa: '衣笠キャンパス'
  };

  

  // スポット情報表示
  // スポット情報表示
const SpotInfo: React.FC<{ spot: Spot }> = ({ spot }) => {
    // スポットごとの画像パス（実際の画像に置き換えてください）
    const spotImages: Record<string, string> = {
      'plaza': '/images/spots/plaza.jpg',
      'terrace': '/images/spots/terrace.jpg',
      'library': '/images/spots/library.jpg',
      'central-square': '/images/spots/central-square.jpg',
      'west-wing': '/images/spots/west-wing.jpg',
      'promenade': '/images/spots/promenade.jpg',
      'front-gate': '/images/spots/front-gate.jpg',
      'cafeteria': '/images/spots/cafeteria.jpg',
      'garden': '/images/spots/garden.jpg',
      // デフォルト画像
      'default': '/images/spots/default.jpg'
    };
  
    // スポットIDに対応する画像を取得、ない場合はデフォルト画像を使用
    const spotImage = spotImages[spot.id] || spotImages['default'];
  
    return (
      <div className="spot-info">
        <h3>{spot.name}</h3>
        
        {/* スポット画像 */}
        <div className="spot-image-container">
          <img 
            src={spotImage} 
            alt={`${spot.name}の様子`} 
            className="spot-image"
          />
        </div>
        
        <p className="spot-description">{spot.description}</p>
        
        {/* 本日のキッチンカーボタン */}
        <div className="spot-action">
          <a href="/" className="today-foodtrucks-button">
            <span className="button-icon">🚚</span>
            本日のキッチンカーを見る
          </a>
        </div>
        
        <style jsx>{`
          .spot-info {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          
          .spot-image-container {
            margin: 0.5rem 0 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .spot-image {
            width: 100%;
            height: auto;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          
          .spot-image:hover {
            transform: scale(1.03);
          }
          
          .spot-description {
            margin-bottom: 1.5rem;
            color: #4b5563;
            line-height: 1.5;
            flex-grow: 1;
          }
          
          .spot-action {
            margin-top: auto;
            padding-top: 1rem;
          }
          
          .today-foodtrucks-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background-color: #ef4444;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
            text-align: center;
            transition: all 0.2s;
            text-decoration: none;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
          }
          
          .today-foodtrucks-button:hover {
            background-color: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
          }
          
          .button-icon {
            font-size: 1.25rem;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="interactive-map-container">
      <div className="campus-tabs">
        <button 
          className={`campus-tab ${activeTab === 'oic' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('oic'); setActiveSpot(null); }}
        >
          OIC
        </button>
        <button 
          className={`campus-tab ${activeTab === 'bkc' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bkc'); setActiveSpot(null); }}
        >
          BKC
        </button>
        <button 
          className={`campus-tab ${activeTab === 'kinugasa' ? 'active' : ''}`}
          onClick={() => { setActiveTab('kinugasa'); setActiveSpot(null); }}
        >
          衣笠
        </button>
      </div>

      <h2 className="campus-title">{campusNames[activeTab]}</h2>
      
      <div className="map-info-container">
        <div className="map-container">
          <div className="map-image-container">
            <img src={mapImages[activeTab]} alt={`${campusNames[activeTab]}マップ`} className="campus-map" />
            
            {/* スポットマーカー */}
            {spotData[activeTab].map((spot) => (
              <div
                key={spot.id}
                className={`spot-marker ${activeSpot && activeSpot.id === spot.id ? 'active' : ''}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onClick={() => setActiveSpot(spot)}
              >
                <div className="marker-dot"></div>
                <div className="marker-pulse"></div>
                <div className="marker-label">{spot.name}</div>
              </div>
            ))}
          </div>
          
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-dot"></div>
              <span>キッチンカースポット</span>
            </div>
            <div className="legend-help">
              <p>※ マーカーをクリックして詳細を表示</p>
            </div>
          </div>
        </div>
        
        <div className="spot-info-panel">
          {activeSpot ? (
            <SpotInfo spot={activeSpot} />
          ) : (
            <div className="spot-info-placeholder">
              <p>マップ上のマーカーをクリックして、各スポットの詳細とキッチンカー情報を表示します。</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="map-note">
        <p>※ キッチンカーの出店情報は日によって変更される場合があります。</p>
        <p>最新情報は<a href="#" className="text-blue-600">お知らせページ</a>でご確認ください。</p>
      </div>

      <style jsx>{`
        .interactive-map-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .campus-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        
        .campus-tab {
          padding: 0.75rem 1.5rem;
          background-color: #f3f4f6;
          border-radius: 0.5rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .campus-tab:hover {
          background-color: #e5e7eb;
        }
        
        .campus-tab.active {
          background-color: #3b82f6;
          color: white;
        }
        
        .campus-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-align: center;
          color: #1f2937;
        }
        
        .map-info-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .map-info-container {
            flex-direction: row;
          }
          
          .map-container {
            flex: 3;
          }
          
          .spot-info-panel {
            flex: 2;
          }
        }
        
        .map-container {
          position: relative;
          background-color: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .map-image-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 75%; /* アスペクト比を調整 */
          overflow: hidden;
        }
        
        .campus-map {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .spot-marker {
          position: absolute;
          width: 24px;
          height: 24px;
          transform: translate(-50%, -50%);
          cursor: pointer;
          z-index: 10;
        }
        
        .marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
          z-index: 2;
          transition: all 0.3s;
        }
        
        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background-color: rgba(239, 68, 68, 0.4);
          border-radius: 50%;
          z-index: 1;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        
        .marker-label {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -20px;
          white-space: nowrap;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 4px;
          opacity: 0;
          transition: all 0.3s;
        }
        
        .spot-marker:hover .marker-label,
        .spot-marker.active .marker-label {
          opacity: 1;
          bottom: -25px;
        }
        
        .spot-marker:hover .marker-dot,
        .spot-marker.active .marker-dot {
          width: 16px;
          height: 16px;
          background-color: #dc2626;
        }
        
        .map-legend {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .legend-dot {
          width: 10px;
          height: 10px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 1px solid #fff;
          box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.3);
        }
        
        .legend-help {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: right;
        }
        
        .spot-info-panel {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          min-height: 250px;
          display: flex;
          flex-direction: column;
        }
        
        .spot-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #1f2937;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .spot-info p {
          margin-bottom: 1.25rem;
          color: #4b5563;
          line-height: 1.5;
        }
        
        .today-food-trucks h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .today-food-trucks h4::before {
          content: "🚚";
        }
        
        .today-food-trucks ul {
          list-style: none;
          padding: 0;
        }
        
        .today-food-trucks li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .food-truck-time {
          font-size: 0.875rem;
          font-weight: 600;
          color: #3b82f6;
          background-color: #eff6ff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          white-space: nowrap;
        }
        
        .food-truck-name {
          color: #4b5563;
        }
        
        .spot-info-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex-grow: 1;
          color: #6b7280;
          padding: 1rem;
        }
        
        .map-note {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMap;