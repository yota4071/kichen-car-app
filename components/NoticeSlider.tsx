// components/NoticeSlider.tsx - シンプル版
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Notice = {
  id: string;
  title: string;
  link?: string | null;
  isExternal?: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  priority: number;
  createdAt: string;
};

type NoticeData = {
  notices: Notice[];
};

const NoticeSlider = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // JSONファイルからお知らせを取得
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/data/Notice.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: NoticeData = await response.json();
        const now = new Date();
        
        const activeNotices = data.notices
          .filter(notice => {
            if (!notice.isActive) return false;
            
            const startDate = notice.startDate ? new Date(notice.startDate) : null;
            const endDate = notice.endDate ? new Date(notice.endDate) : null;
            
            const isInDisplayPeriod = 
              (!startDate || startDate <= now) && 
              (!endDate || endDate >= now);
            
            return isInDisplayPeriod;
          })
          .sort((a, b) => {
            if (a.priority !== b.priority) {
              return a.priority - b.priority;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        
        setNotices(activeNotices);
        
      } catch (error) {
        console.error('Error fetching notices:', error);
        // エラー時は何も表示しない
        setNotices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // 自動スライド機能（シンプル）
  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 4500); // 4.5秒ごとに切り替え

    return () => clearInterval(interval);
  }, [notices.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="notice-slider loading">
        <div className="notice-container">
          <div className="notice-skeleton">
            <div className="skeleton-text"></div>
          </div>
        </div>
        
        <style jsx>{`
          .notice-slider {
            background-color: var(--primary-color);
            color: white;
            padding: 0;
            min-height: 40px;
            display: flex;
            align-items: center;
          }
          
          .notice-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
            width: 100%;
            display: flex;
            align-items: center;
          }
          
          .notice-skeleton {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .skeleton-text {
            width: 200px;
            height: 14px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            animation: skeleton-pulse 1.5s ease-in-out infinite;
          }
          
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // お知らせがない場合は表示しない
  if (notices.length === 0) return null;

  const currentNotice = notices[currentIndex];

  const NoticeContent = () => (
    <div className="notice-content">
      <span className="notice-text">
        {currentNotice.title}
      </span>
    </div>
  );

  return (
    <div className="notice-slider">
      <div className="notice-container">
        {/* 左矢印（複数のお知らせがある場合のみ表示） */}
        {notices.length > 1 && (
          <button
            className="nav-button nav-button-left"
            onClick={goToPrevious}
            aria-label="前のお知らせ"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
        )}

        {/* お知らせ内容 */}
        <div className="notice-wrapper">
          {currentNotice.link ? (
            currentNotice.isExternal ? (
              <a 
                href={currentNotice.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="notice-link"
              >
                <NoticeContent />
              </a>
            ) : (
              <Link href={currentNotice.link} className="notice-link">
                <NoticeContent />
              </Link>
            )
          ) : (
            <NoticeContent />
          )}
        </div>

        {/* 右矢印（複数のお知らせがある場合のみ表示） */}
        {notices.length > 1 && (
          <button
            className="nav-button nav-button-right"
            onClick={goToNext}
            aria-label="次のお知らせ"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
            </svg>
          </button>
        )}

        {/* インジケーター（複数のお知らせがある場合のみ表示） */}
        {notices.length > 1 && (
          <div className="notice-indicators">
            {notices.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`お知らせ ${index + 1} を表示`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .notice-slider {
          background-color: var(--primary-color);
          color: white;
          min-height: 40px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .notice-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notice-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .notice-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .notice-content {
          display: flex;
          align-items: center;
          padding: 8px 0;
          transition: opacity 0.3s ease;
          width: 100%;
          justify-content: center;
        }

        .notice-link:hover .notice-content {
          opacity: 0.8;
        }

        .notice-text {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          text-align: center;
        }

        .nav-button {
          width: 24px;
          height: 24px;
          min-width: 24px;
          min-height: 24px;
          max-width: 24px;
          max-height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;
          flex-shrink: 0;
          flex-grow: 0;
          box-sizing: border-box;
          aspect-ratio: 1;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .notice-indicators {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .indicator {
          width: 6px;
          height: 6px;
          min-width: 6px;
          min-height: 6px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .indicator.active {
          background-color: white;
        }

        .indicator:hover {
          background-color: rgba(255, 255, 255, 0.7);
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .notice-container {
            gap: 0.75rem;
            padding: 0 1rem;
          }

          .notice-text {
            font-size: 13px;
          }

          .nav-button {
            width: 20px;
            height: 20px;
            min-width: 20px;
            min-height: 20px;
            max-width: 20px;
            max-height: 20px;
            aspect-ratio: 1;
          }

          .nav-button svg {
            width: 10px;
            height: 10px;
            flex-shrink: 0;
          }

          .indicator {
            width: 5px;
            height: 5px;
            min-width: 5px;
            min-height: 5px;
          }
        }

        @media (max-width: 480px) {
          .notice-slider {
            min-height: 36px;
          }

          .notice-container {
            gap: 0.5rem;
            padding: 0 0.75rem;
          }

          .notice-content {
            padding: 6px 0;
          }

          .notice-text {
            font-size: 12px;
            line-height: 1.3;
          }

          .nav-button {
            width: 18px;
            height: 18px;
            min-width: 18px;
            min-height: 18px;
            max-width: 18px;
            max-height: 18px;
            aspect-ratio: 1;
          }

          .nav-button svg {
            width: 8px;
            height: 8px;
            flex-shrink: 0;
          }

          .indicator {
            width: 4px;
            height: 4px;
            min-width: 4px;
            min-height: 4px;
          }

          .notice-indicators {
            gap: 3px;
          }
        }

        /* アクセシビリティ */
        .nav-button:focus,
        .indicator:focus {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }

        /* 動作軽減設定 */
        @media (prefers-reduced-motion: reduce) {
          .notice-content {
            transition: none;
          }
          
          .nav-button,
          .indicator {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default NoticeSlider;